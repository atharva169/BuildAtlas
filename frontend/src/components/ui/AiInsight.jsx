// FILE: src/components/ui/AiInsight.jsx
// Reusable AI Insight component — generates contextual insights via Gemini 2.5 Flash
import React, { useState } from 'react'
import { Sparkles, ChevronDown, Loader2 } from 'lucide-react'

function formatInsight(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-teal">$1</strong>')
    .replace(/₹([\d,.]+[LC]?r?)/g, '<span class="font-mono text-teal">₹$1</span>')
    .replace(/\n/g, '<br/>')
}

export default function AiInsight({ context, label = 'AI Insight' }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const generate = async () => {
    if (insight) { setOpen(!open); return }

    setOpen(true)
    setLoading(true)

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!geminiKey) {
      setInsight('API key not configured. Add VITE_GEMINI_API_KEY to your environment.')
      setLoading(false)
      return
    }

    try {
      const prompt = `You are BuildAtlas AI — a senior Indian construction consultant. Based on this specific data point, give exactly 1-2 sentences of practical, actionable insight. Be data-driven, cite IS codes or Indian market context where relevant. Use ₹ amounts in lakhs/crores. Keep it under 40 words.

DATA: ${context}`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 150 }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        setInsight(reply || 'Unable to generate insight.')
      } else if (response.status === 429) {
        setInsight('API rate limit exceeded. Please try again later.')
      } else {
        setInsight('Gemini API temporarily unavailable.')
      }
    } catch (e) {
      setInsight('Could not reach AI service.')
    }

    setLoading(false)
  }

  return (
    <div className="mt-2">
      <button onClick={generate}
        className="flex items-center gap-1.5 text-[10px] text-teal/70 hover:text-teal transition-colors group">
        <Sparkles size={10} className="group-hover:animate-pulse" />
        <span>{label}</span>
        <ChevronDown size={10} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-1.5 px-3 py-2 bg-teal/5 border border-teal/10 rounded-lg animate-fadeIn">
          {loading ? (
            <div className="flex items-center gap-2 text-[10px] text-txt-3">
              <Loader2 size={10} className="animate-spin text-teal" />
              <span>Generating insight...</span>
            </div>
          ) : (
            <p className="text-[10px] leading-relaxed text-txt-2"
              dangerouslySetInnerHTML={{ __html: formatInsight(insight || '') }} />
          )}
        </div>
      )}
    </div>
  )
}
