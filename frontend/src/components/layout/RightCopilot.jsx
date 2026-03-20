// FILE: src/components/layout/RightCopilot.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import useProjectStore from '../../store/projectStore'
import { api } from '../../services/api'
import { COPILOT_CHIPS } from '../../utils/constants'
import { MessageSquare, Send, Sparkles, X } from 'lucide-react'
import { PlaceholdersAndVanishInput } from '../ui/PlaceholdersAndVanishInput'

const CANNED_RESPONSES = {
  'M25': 'As per **IS 456:2000 Clause 9.1.2**, M25 grade concrete (fck = 25 MPa) is the minimum recommended grade for RCC structural members in residential buildings. Mix design should follow **IS 10262:2019**. For your 3-floor project in Bengaluru, M25 is appropriate for columns, beams, and slabs.',
  'monsoon': 'Your project starts in January — Bengaluru\'s SW monsoon hits **June–September**. Foundation and superstructure work (Phases 1–2) will likely overlap. Expect **8–12 weeks** of disrupted outdoor work. Pre-monsoon stockpile aggregates and ensure site drainage per **IS 3764**.',
  'steel': 'Steel (Fe-500D TMT) is **38% of your structural cost** (~₹16.2L). To reduce: 1) Optimize bar-bending schedule to reduce waste from 5% to 2%. 2) Lock forward rates with 2 suppliers by Month 2. 3) Consider Fe-415 for non-critical members per **IS 1786:2008**.',
  'RERA': '**RERA Act 2016** checklist for Bengaluru:\n• Registration before advertisement (Sec. 3)\n• 70% collections in escrow (Sec. 4(2)(l)(D))\n• Quarterly progress filing (Sec. 11)\n• Structural completion cert from engineer (Sec. 14)\n• OC application after completion (Sec. 11(4)(b))',
  'soft soil': 'For soft soil, **IS 1904:1986** recommends pile or raft foundations. Your plot (40×60ft) in medium soil is fine with isolated footings. If SPT N-value < 10, switch to pile foundation per **IS 2911**. Budget impact: +₹8–12L for piling.',
  'masonry': 'For Bengaluru residential, **AAC Blocks** (IS 2185 Part 1) are recommended over clay bricks. Benefits: 30% lighter (less structural steel), better thermal insulation (U-value 0.8 vs 2.4), faster laying. Cost: ₹6,600/m³ vs ₹7,500/1000 bricks.',
}

function matchResponse(msg) {
  const lower = msg.toLowerCase()
  for (const [key, resp] of Object.entries(CANNED_RESPONSES)) {
    if (lower.includes(key.toLowerCase())) return resp
  }
  return 'I can help with IS codes, cost optimization, scheduling, and compliance. Could you be more specific about what aspect of your project you need guidance on?'
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-teal">$1</strong>')
    .replace(/₹([\d,.]+[LC]?r?)/g, '<span class="font-mono text-teal">₹$1</span>')
    .replace(/\n•/g, '<br/>•')
    .replace(/\n(\d+)\)/g, '<br/>$1)')
    .replace(/\n/g, '<br/>')
}

export default function RightCopilot({ open, onClose }) {
  const { copilotMessages, addCopilotMessage, currentProject, isLoading, setLoading } = useProjectStore()
  const [input, setInput] = useState('')
  const messagesEnd = useRef(null)

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [copilotMessages])

  const send = useCallback(async () => {
    const msg = input.trim()
    if (!msg) return
    setInput('')
    addCopilotMessage({ role: 'user', text: msg })
    setLoading('copilot', true)

    const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

    if (!isDemo) {
      try {
        // 1. Try backend API first (if not in demo mode)
        const res = await api.askCopilot(msg, currentProject)
        if (res && res.success && res.data?.reply) {
          addCopilotMessage({ role: 'ai', text: res.data.reply })
          setLoading('copilot', false)
          return
        }
      } catch (e) {
        console.warn("Backend copilot failed, attempting direct Gemini API call", e)
      }
    }

    let backendSucceeded = false;

    if (!isDemo && import.meta.env.VITE_API_URL) {
      try {
        const res = await api.askCopilot(msg, currentProject)
        if (res && res.success && res.data?.reply) {
          addCopilotMessage({ role: 'ai', text: res.data.reply })
          setLoading('copilot', false)
          backendSucceeded = true;
          return;
        }
      } catch (e) {
        console.warn("Backend copilot failed to respond, falling back to direct browser Gemini API...", e)
      }
    }

    if (!backendSucceeded) {
      // Direct Gemini REST API Fallback
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!geminiKey) {
        addCopilotMessage({ role: 'ai', text: "**Deployment Error:** The backend is unavailable AND your `VITE_GEMINI_API_KEY` environment variable is completely missing from this Vercel deployment. You need to add it to Vercel and click Redeploy." })
        setLoading('copilot', false)
        return;
      }

      try {
        const sysPrompt = `You are the BuildAtlas AI Copilot, a senior construction manager & civil engineer in India.
Answer the following construction inquiry short, crisp, and professionally. Use markdown formatting.
Base context: Project is in ${currentProject?.city || 'Bengaluru'}.
Question: ${msg}`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: sysPrompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (reply) {
            addCopilotMessage({ role: 'ai', text: reply })
            setLoading('copilot', false)
            return;
          }
        } else {
          const errText = await response.text();
          if (response.status === 429) {
            console.warn("Gemini Rate Limit (429) hit. Falling back to rule-based answers.");
            // Do not return; let execution continue to the ultra-safe fallback below
          } else {
            addCopilotMessage({ role: 'ai', text: `**Google API Blocked:** The Google Gemini API rejected the request. Status: ${response.status}.\n\nRaw Error: ${errText}` })
            setLoading('copilot', false)
            return;
          }
        }
      } catch (e) {
        addCopilotMessage({ role: 'ai', text: `**Network Error:** Could not reach Google Gemini API directly from browser: ${e.message}` })
        setLoading('copilot', false)
        return;
      }
    }

    // Final ultra-safe Fallback to rule-based responses if completely broken somehow
    addCopilotMessage({ role: 'ai', text: matchResponse(msg) })
    setLoading('copilot', false)
  }, [input, currentProject, addCopilotMessage, setLoading])

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <aside className={`fixed lg:static inset-y-0 right-0 z-40 w-[280px] bg-bg-1 border-l border-bdr-1 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
      {/* Header */}
      <div className="h-14 px-4 flex items-center gap-2 border-b border-bdr-1 shrink-0">
        <Sparkles size={16} className="text-teal" />
        <span className="text-sm font-semibold text-txt-1 flex-1">AI Copilot</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-teal/10 text-teal font-mono">LIVE</span>
        <button onClick={onClose} className="lg:hidden p-1 text-txt-3 hover:text-txt-1"><X size={16} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {copilotMessages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-teal/15 text-txt-1 rounded-br-sm' : 'bg-bg-2 border border-bdr-1 text-txt-2 rounded-bl-sm'}`}>
              {m.role === 'ai' ? <div dangerouslySetInnerHTML={{ __html: formatMarkdown(m.text) }} /> : m.text}
            </div>
          </div>
        ))}
        {isLoading.copilot && (
          <div className="flex justify-start">
            <div className="bg-bg-2 border border-bdr-1 px-4 py-3 rounded-xl rounded-bl-sm dot-pulse"><span/><span/><span/></div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Quick Chips */}
      <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
        {COPILOT_CHIPS.slice(0, 4).map(chip => (
          <button key={chip} onClick={() => setInput(chip)}
            className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-bg-2 border border-bdr-1 text-txt-2 hover:text-teal hover:border-teal/30 transition-colors">
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-3">
        <PlaceholdersAndVanishInput
          placeholders={[
            "What IS code for M25 concrete?",
            "Will monsoon delay excavation?",
            "How to reduce steel cost by 10%?",
            "Should I use AAC blocks or bricks?",
            "What is the RERA compliance checklist?",
            "What if I change to a premium finish?",
            "Is my timeline feasible?",
          ]}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        />
      </div>
    </aside>
  )
}
