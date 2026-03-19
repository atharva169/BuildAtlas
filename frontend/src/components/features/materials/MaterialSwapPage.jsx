// FILE: src/components/features/materials/MaterialSwapPage.jsx
// Material swap intelligence — interactive substitution matrix.
// Switch red brick → AAC, OPC → PPC, Fe500 → Fe415.
// See cost delta, time delta, strength grade, IS code compliance instantly.
import React, { useState, useMemo, useEffect } from 'react'
import useProjectStore from '../../../store/projectStore'
import { api } from '../../../services/api'
import { MATERIALS_DATA } from '../../../utils/constants'
import { formatLakhs } from '../../../utils/formatters'
import Card, { Badge, Button } from '../../ui/Card'
import { Layers, ArrowRight, Sparkles, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

const CATEGORIES = ['masonry', 'cement', 'steel', 'roofing']
const CATEGORY_LABELS = { masonry: '🧱 Masonry', cement: '🏗️ Cement', steel: '🔩 Steel', roofing: '🏠 Roofing' }

export default function MaterialSwapPage() {
  const { currentProject, isLoading, setLoading } = useProjectStore()
  const [category, setCategory] = useState('masonry')
  const [materials, setMaterials] = useState(MATERIALS_DATA.masonry)
  const [origId, setOrigId] = useState('clay_brick')
  const [altId, setAltId] = useState('aac_block')
  const [result, setResult] = useState(null)

  // Load materials — try API first, fallback to local data
  useEffect(() => {
    setResult(null)
    async function load() {
      const res = await api.getMaterials(category)
      if (res.success && res.data?.materials) {
        setMaterials(res.data.materials)
      } else {
        setMaterials(MATERIALS_DATA[category] || [])
      }
    }
    load()
    // Set defaults
    const local = MATERIALS_DATA[category] || []
    const base = local.find(m => m.is_baseline)
    const alt = local.find(m => !m.is_baseline)
    if (base) setOrigId(base.id)
    if (alt) setAltId(alt.id)
  }, [category])

  // Client-side swap calculation (always works)
  const localResult = useMemo(() => {
    if (!origId || !altId || origId === altId) return null
    const orig = materials.find(m => m.id === origId)
    const alt = materials.find(m => m.id === altId)
    if (!orig || !alt) return null
    return {
      original: orig, alternative: alt,
      cost_delta_pct: +((alt.base_cost - orig.base_cost) / orig.base_cost * 100).toFixed(1),
      time_delta_weeks: +(alt.time_delta_weeks - orig.time_delta_weeks).toFixed(1),
      strength_delta_pct: +(alt.strength_pct - orig.strength_pct).toFixed(1),
      thermal_improvement: +(alt.thermal_score - orig.thermal_score).toFixed(1),
      ai_recommendation: null,
    }
  }, [origId, altId, materials])

  const handleSwap = async () => {
    if (!origId || !altId || origId === altId) return
    setLoading('materials', true)
    const res = await api.swapMaterial(category, origId, altId, currentProject)
    if (res.success && res.data) {
      setResult(res.data)
    } else {
      setResult(localResult)
    }
    setLoading('materials', false)
  }

  const displayResult = result || null
  const orig = materials.find(m => m.id === origId)
  const alt = materials.find(m => m.id === altId)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-txt-1 flex items-center gap-2">
          <Layers size={20} className="text-teal" /> Material Swap Intelligence
        </h2>
        <p className="text-xs text-txt-3 mt-1">Interactive substitution matrix — see cost delta, time delta, strength grade, and IS code compliance instantly</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-1 py-3 px-3 rounded-xl text-xs font-medium transition-all ${category === c ? 'bg-teal/15 text-teal border border-teal/30 shadow-lg shadow-teal/5' : 'bg-bg-2 text-txt-2 border border-bdr-1 hover:border-bdr-2'}`}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Material Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Material */}
        <Card>
          <h3 className="text-[10px] text-txt-3 uppercase tracking-widest mb-3">Current Material</h3>
          <div className="space-y-1.5">
            {materials.map(m => (
              <button key={m.id} onClick={() => setOrigId(m.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${origId === m.id ? 'bg-blue/10 text-blue border border-blue/30' : 'text-txt-2 hover:bg-bg-3 border border-transparent'}`}>
                <div className={`w-3 h-3 rounded-full border-2 ${origId === m.id ? 'border-blue bg-blue' : 'border-bdr-2'}`}>
                  {origId === m.id && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[1px]" />}
                </div>
                <span className="flex-1 text-left font-medium">{m.name}</span>
                {m.is_baseline && <Badge color="blue">Base</Badge>}
                <span className="font-mono text-[10px] text-txt-3">{m.is_code}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Alternative Material */}
        <Card>
          <h3 className="text-[10px] text-txt-3 uppercase tracking-widest mb-3">Swap To</h3>
          <div className="space-y-1.5">
            {materials.filter(m => m.id !== origId).map(m => (
              <button key={m.id} onClick={() => setAltId(m.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${altId === m.id ? 'bg-teal/10 text-teal border border-teal/30' : 'text-txt-2 hover:bg-bg-3 border border-transparent'}`}>
                <div className={`w-3 h-3 rounded-full border-2 ${altId === m.id ? 'border-teal bg-teal' : 'border-bdr-2'}`}>
                  {altId === m.id && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[1px]" />}
                </div>
                <span className="flex-1 text-left font-medium">{m.name}</span>
                <span className="font-mono text-[10px] text-txt-3">{m.is_code}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Compare Button */}
      <Button onClick={handleSwap} disabled={isLoading?.materials || !origId || !altId || origId === altId} size="lg" className="w-full">
        <RefreshCw size={14} /> {isLoading?.materials ? 'Analyzing...' : 'Compare Swap Impact'}
      </Button>

      {/* Live preview (always shown) */}
      {localResult && (
        <Card glow>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-txt-1">{orig?.name}</span>
            <ArrowRight size={16} className="text-teal" />
            <span className="text-xs font-medium text-teal">{alt?.name}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Cost Delta', val: `${localResult.cost_delta_pct > 0 ? '+' : ''}${localResult.cost_delta_pct}%`, bad: localResult.cost_delta_pct > 0, emoji: '💰' },
              { label: 'Time Delta', val: `${localResult.time_delta_weeks > 0 ? '+' : ''}${localResult.time_delta_weeks} wks`, bad: localResult.time_delta_weeks > 0, emoji: '⏱️' },
              { label: 'Strength Δ', val: `${localResult.strength_delta_pct > 0 ? '+' : ''}${localResult.strength_delta_pct}%`, bad: localResult.strength_delta_pct < -5, emoji: '💪' },
              { label: 'Thermal', val: `${localResult.thermal_improvement > 0 ? '+' : ''}${localResult.thermal_improvement}`, bad: localResult.thermal_improvement < 0, emoji: '🌡️' },
            ].map(d => (
              <div key={d.label} className="bg-bg-3 rounded-xl p-3 text-center">
                <span className="text-lg">{d.emoji}</span>
                <p className="text-[10px] text-txt-3 uppercase mt-1">{d.label}</p>
                <p className={`text-lg font-bold font-mono mt-1 ${d.bad ? 'text-red' : 'text-green'}`}>{d.val}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-bdr-1">
                <th className="text-left py-2 px-2 text-txt-3 font-medium">Attribute</th>
                <th className="text-right py-2 px-2 text-blue font-medium">{orig?.name}</th>
                <th className="text-right py-2 px-2 text-teal font-medium">{alt?.name}</th>
              </tr></thead>
              <tbody>
                {[
                  ['IS Code', orig?.is_code, alt?.is_code],
                  ['Unit Cost', `₹${orig?.base_cost?.toLocaleString('en-IN')}/${orig?.unit}`, `₹${alt?.base_cost?.toLocaleString('en-IN')}/${alt?.unit}`],
                  ['Strength', `${orig?.strength_pct}%`, `${alt?.strength_pct}%`],
                  ['Thermal Score', `${orig?.thermal_score}/10`, `${alt?.thermal_score}/10`],
                  ['Availability', `${orig?.availability_pct}%`, `${alt?.availability_pct}%`],
                ].map(([attr, v1, v2]) => (
                  <tr key={attr} className="border-b border-bdr-1/50">
                    <td className="py-2 px-2 text-txt-2">{attr}</td>
                    <td className="py-2 px-2 text-right font-mono text-txt-1">{v1}</td>
                    <td className="py-2 px-2 text-right font-mono text-teal">{v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* AI Recommendation (if API returned one) */}
      {displayResult?.ai_recommendation && (
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-teal" />
            <h3 className="text-sm font-semibold text-txt-1">AI Recommendation</h3>
          </div>
          <p className="text-xs text-txt-2 leading-relaxed">{displayResult.ai_recommendation}</p>
        </Card>
      )}
    </div>
  )
}
