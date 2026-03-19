// FILE: src/data/demoFlow.js
// ═══════════════════════════════════════════════════════════════════════
// BuildAtlas GenAI — Guided Demo Sequence
// 8 scripted steps for hackathon judges. Each step includes:
//   - title: what's happening
//   - page: which page to navigate to
//   - action: what to trigger
//   - highlight: which component to spotlight
//   - narration: presenter script (designed for 2-minute walkthrough)
// ═══════════════════════════════════════════════════════════════════════

export const DEMO_STEPS = [
  {
    step: 1,
    title: 'Enter Project Details',
    page: 'floorplan',
    action: 'Auto-fill form with Sharma Residence',
    highlight: 'PlotConfigForm',
    narration:
      'A client walks in with a 12×9m East-facing plot in Bengaluru. ' +
      'Watch what happens when we hit Generate.',
    duration_sec: 15,
  },
  {
    step: 2,
    title: 'Floor Plan Generated',
    page: 'floorplan',
    action: 'Trigger generation animation',
    highlight: 'FloorPlanCanvas',
    narration:
      'A Vastu-compliant 2BHK layout appears in under 2 seconds. ' +
      'Note the kitchen is correctly placed in the South-East — ' +
      'Vastu Agni corner. The living room faces North-East for ' +
      'maximum natural light. Every room is sized to IS code minimums.',
    duration_sec: 20,
  },
  {
    step: 3,
    title: 'Cost Estimate with Confidence Bands',
    page: 'dashboard',
    action: 'Highlight stat cards',
    highlight: 'StatCardsRow',
    narration:
      'Not one number — three. ₹1.55Cr best case, ₹1.84Cr realistic, ' +
      '₹2.31Cr worst case. The system flags TMT steel as the primary ' +
      'variance driver. Below — a 12-item BOQ that would take a ' +
      'quantity surveyor two days. We did it in 200 milliseconds.',
    duration_sec: 20,
  },
  {
    step: 4,
    title: 'What-If: Steel Prices Rise 15%',
    page: 'whatif',
    action: 'Move steel slider to +15',
    highlight: 'WhatIfSandbox',
    narration:
      'Steel goes up 15% — cost jumps to ₹1.93Cr. The system shows ' +
      'you exactly what changed and why. ₹4.08L from steel alone. ' +
      'No spreadsheet can do this in real time. Adjust any variable — ' +
      'labour, cement, timeline — and see the cascade instantly.',
    duration_sec: 15,
  },
  {
    step: 5,
    title: 'Schedule with Monsoon Buffer',
    page: 'schedule',
    action: 'Highlight monsoon overlay',
    highlight: 'GanttOverview',
    narration:
      'The schedule already knows about Bengaluru\'s monsoon. ' +
      'Jun–Sep outdoor work is automatically buffered — 4 extra ' +
      'weeks added to foundation and RCC phases. BBMP approval is ' +
      'a dependency — the foundation can\'t start until it clears. ' +
      'Critical path is highlighted in real time.',
    duration_sec: 20,
  },
  {
    step: 6,
    title: 'Delay Cascade: Foundation Slips 3 Weeks',
    page: 'cascade',
    action: 'Set delay slider to 3 weeks on foundation phase',
    highlight: 'DelaySimulator',
    narration:
      'Watch what happens when foundation slips 3 weeks. Seven ' +
      'downstream phases recalculate in 200ms. Red means blocked. ' +
      'The new handover date shifts, and we show cost impact too — ' +
      '₹1.8L extra from extended labour. No spreadsheet model can ' +
      'show this live.',
    duration_sec: 15,
  },
  {
    step: 7,
    title: 'Reverse Planning: ₹50L, 8 Months',
    page: 'reverse',
    action: 'Set budget to 50 lakhs, timeline to 8 months',
    highlight: 'BuildOptionCards',
    narration:
      'The client says budget is actually ₹50 Lakhs. We flip the ' +
      'workflow. Enter budget and deadline — get three options. ' +
      'Economy 520 sqft, Standard 390 sqft, Premium 295 sqft. ' +
      'Each shows what gets cut and why. No other tool does this.',
    duration_sec: 15,
  },
  {
    step: 8,
    title: 'Ask the AI Copilot',
    page: 'dashboard',
    action: 'Send: Can I use AAC blocks instead of clay bricks?',
    highlight: 'RightCopilot',
    narration:
      'Project-grounded AI. It knows this is a Bengaluru project, ' +
      'knows your area and budget. Saves ₹2.1L, IS 2185 compliant, ' +
      '85% availability in Bengaluru, and better thermal insulation. ' +
      'Not a generic chatbot — it knows your project context.',
    duration_sec: 15,
  },
]

// Total estimated demo duration
export const DEMO_TOTAL_SECONDS = DEMO_STEPS.reduce((sum, s) => sum + s.duration_sec, 0)
export const DEMO_TOTAL_MINUTES = Math.ceil(DEMO_TOTAL_SECONDS / 60)

export default DEMO_STEPS
