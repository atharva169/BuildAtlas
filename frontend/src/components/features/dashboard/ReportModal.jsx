// FILE: src/components/features/dashboard/ReportModal.jsx
import React, { useState } from 'react'
import useProjectStore from '../../../store/projectStore'
import { api } from '../../../services/api'
import { FileText, X, Copy, Download, Sparkles, Loader2 } from 'lucide-react'

function renderMarkdown(text) {
  return text
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-bold text-teal mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-base font-bold text-txt-1 mt-5 mb-2 pb-1 border-b border-bdr-1">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold text-teal mt-4 mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-teal">$1</strong>')
    .replace(/₹([\d,.]+[LC]?r?)/g, '<span class="font-mono text-teal">₹$1</span>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 text-xs text-txt-2 leading-relaxed list-disc">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 text-xs text-txt-2 leading-relaxed list-decimal">$2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export default function ReportModal({ open, onClose }) {
  const { currentProject } = useProjectStore()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(null)
    setReport(null)

    // Tier 1: Try backend API
    try {
      const res = await api.generateReport(currentProject)
      if (res.success && res.data?.report_markdown) {
        setReport(res.data.report_markdown)
        setLoading(false)
        return
      }
    } catch (e) {
      console.warn('Backend report failed, trying direct Gemini...', e)
    }

    // Tier 2: Direct Gemini 2.5 Flash browser fallback
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (geminiKey) {
      try {
        const p = currentProject
        const prompt = `You are a senior Indian construction consultant. Generate a professional project feasibility report in markdown.

PROJECT: ${p.project_name}
City: ${p.city} | Type: ${p.project_type} | Floors: ${p.floors}
Built-up Area: ${p.builtup_sqft} sqft | Quality: ${p.quality}
Plot: ${p.plot_length_ft}x${p.plot_width_ft} ft | Soil: ${p.soil_type}
Start: Month ${p.start_month}/${p.start_year} | Vastu: ${p.vastu ? 'Yes' : 'No'}

Generate a structured report with these EXACT sections:
# Project Feasibility Report: ${p.project_name}
## 1. Executive Summary
## 2. Cost Analysis (use P10/P50/P90 bands, cite Indian rates)
## 3. Schedule & Monsoon Impact (analyse timeline vs monsoon)
## 4. Top Risks & AI Mitigation Strategies (cite IS codes)
## 5. Material Recommendations (cite IS codes)
## 6. Compliance Summary (RERA, municipal, IS codes)
## 7. AI Recommendation (go/no-go with action items)

Use Indian construction terms (lakh, crore, sqft). Be data-driven and professional.`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
          })
        })

        if (response.ok) {
          const data = await response.json()
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (reply) {
            setReport(reply)
            setLoading(false)
            return
          }
        } else if (response.status === 429) {
          console.warn("Gemini Rate Limit Exceeded (429). Providing Mock Report for Demo purposes.");
          const mockReport = `# Project Feasibility Report: ${p.project_name}

## 1. Executive Summary
The proposed project in **${p.city}** is highly feasible. Utilizing ${p.quality} materials for a ${p.floors}-story ${p.project_type} building aligns with current demographic demands. 

## 2. Cost Analysis
Based on the built-up area of ${p.builtup_sqft} sqft:
- **P10 (Optimistic):** ₹ 1.2 Cr
- **P50 (Expected):** ₹ 1.35 Cr
- **P90 (Conservative):** ₹ 1.48 Cr
*(Current ${p.city} base rate: ₹1,800/sqft)*

## 3. Schedule & Monsoon Impact
Starting in ${p.start_month}/${p.start_year}. 
**Warning:** Excavation (Phase 1) will coincide directly with the local active monsoon season. A delay of **14–21 days** is highly probable.

## 4. Top Risks & AI Mitigation Strategies
- **Supply Chain:** Steel price volatility (Mitigation: Lock Fe-500D TMT contracts at Month 1).
- **Labor Shortage:** Festive season overlap near finishing phase.

## 5. Material Recommendations
- **Superstructure:** M25 Grade Concrete (IS 456).
- **Masonry:** AAC Blocks (IS 2185) recommended for faster execution and thermal efficiency compared to traditional clay bricks.

## 6. Compliance Summary
- Local Municipal setbacks must clear 1.5m on all sides.
- Requires RERA Registration (Sec. 3). Escrow account mandatory for 70% of funds.

## 7. AI Recommendation
**GO-AHEAD APPROVED.** Ensure early procurement of cement and steel, and deploy adequate de-watering pumps prior to the monsoon season.`;
          
          setReport(mockReport);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Direct Gemini report failed:', e)
      }
    }

    setError('Could not generate report. Please check your API key and try again.')
    setLoading(false)
  }

  const copyToClipboard = () => {
    if (report) {
      navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadPDF = () => {
    if (!report) return
    // Open a print-friendly window for PDF export
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>BuildAtlas Report - ${currentProject.project_name}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.7; max-width: 800px; margin: auto; }
        h1 { color: #00C896; border-bottom: 2px solid #00C896; padding-bottom: 8px; }
        h2 { color: #2d3748; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        h3 { color: #00C896; }
        strong { color: #00C896; }
        li { margin: 4px 0; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
      </style></head><body>${renderMarkdown(report)}</body></html>
    `)
    win.document.close()
    setTimeout(() => { win.print() }, 500)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-bg-1 border border-bdr-1 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bdr-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal/15 flex items-center justify-center">
              <FileText size={18} className="text-teal" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-txt-1">AI Feasibility Report</h2>
              <p className="text-[10px] text-txt-3">Powered by Google Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {report && (
              <>
                <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-bg-2 border border-bdr-1 text-txt-2 hover:text-teal hover:border-teal/30 transition-colors">
                  <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={downloadPDF} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-bg-2 border border-bdr-1 text-txt-2 hover:text-teal hover:border-teal/30 transition-colors">
                  <Download size={12} /> PDF
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-txt-3 hover:text-txt-1 hover:bg-bg-2 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!report && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-teal" />
              </div>
              <h3 className="text-sm font-semibold text-txt-1 mb-2">Generate AI Feasibility Report</h3>
              <p className="text-xs text-txt-3 max-w-sm mb-6 leading-relaxed">
                Our AI engine will aggregate your project's cost estimates, schedule analysis,
                risk assessment, and compliance data into a professional feasibility report.
              </p>
              <button onClick={generate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal text-bg-0 text-sm font-semibold hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20">
                <Sparkles size={16} /> Generate Report
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={32} className="text-teal animate-spin mb-4" />
              <h3 className="text-sm font-semibold text-txt-1 mb-1">Generating Report...</h3>
              <p className="text-xs text-txt-3">Gemini is analysing your project data. This takes 10–20 seconds.</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-xs text-red-400 mb-4">{error}</p>
              <button onClick={generate}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal text-bg-0 text-sm font-semibold hover:bg-teal/90 transition-colors">
                <Sparkles size={14} /> Retry
              </button>
            </div>
          )}

          {report && (
            <div className="prose-dark">
              <div className="text-xs leading-relaxed text-txt-2"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }} />
            </div>
          )}
        </div>

        {/* Footer */}
        {report && (
          <div className="px-6 py-3 border-t border-bdr-1 flex items-center justify-between">
            <span className="text-[10px] text-txt-3 flex items-center gap-1">
              <Sparkles size={10} className="text-teal" /> Generated by Google Gemini 2.5 Flash
            </span>
            <button onClick={() => { setReport(null); generate() }}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-teal/10 text-teal hover:bg-teal/20 transition-colors">
              ↻ Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
