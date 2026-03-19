// FILE: src/components/features/estimator/EstimatorPage.jsx
import React, { useEffect, useMemo } from 'react'
import useProjectStore from '../../../store/projectStore'
import { estimateCostFrontend } from '../../../utils/calculations'
import { formatLakhs, formatRupees } from '../../../utils/formatters'
import Card, { StatCard, Badge, Button } from '../../ui/Card'
import { IndianRupee, Download } from 'lucide-react'

function BOQTable({ boq }) {
  const copyCSV = () => {
    const csv = 'S.No,Category,Percentage,Amount (₹ Lakhs)\n' + boq.map(r => `${r.sno},${r.category},${r.percentage}%,${r.amount_lakhs}`).join('\n')
    navigator.clipboard?.writeText(csv)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-txt-1">Bill of Quantities</h4>
        <button onClick={copyCSV} className="text-[10px] text-txt-3 hover:text-teal flex items-center gap-1 transition-colors"><Download size={11} /> Copy CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-bg-2">
            <tr className="border-b border-bdr-1">
              <th className="text-left py-2 px-3 text-txt-3 font-medium">#</th>
              <th className="text-left py-2 px-3 text-txt-3 font-medium">Category</th>
              <th className="text-right py-2 px-3 text-txt-3 font-medium">Share</th>
              <th className="text-right py-2 px-3 text-txt-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {boq?.map((item, i) => {
              const isSteel = item.category.includes('Civil')
              return (
                <tr key={i} className="border-b border-bdr-1/50 hover:bg-bg-3/50 transition-colors">
                  <td className="py-2.5 px-3 text-txt-3 font-mono">{item.sno}</td>
                  <td className="py-2.5 px-3 text-txt-1 flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full" style={{ background: ['#3B82F6','#8B5CF6','#00C896','#F59E0B','#EF4444'][i % 5] }} />
                    {item.category}
                    {isSteel && <Badge color="amber" className="ml-1">HIGH VOLATILITY</Badge>}
                  </td>
                  <td className="py-2.5 px-3 text-right text-txt-2 font-mono">{item.percentage}%</td>
                  <td className="py-2.5 px-3 text-right text-txt-1 font-mono font-medium">{formatLakhs(item.amount_lakhs)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-teal/5">
              <td colSpan={2} className="py-2.5 px-3 text-sm font-bold text-teal">Total</td>
              <td className="py-2.5 px-3 text-right text-sm font-bold text-teal font-mono">100%</td>
              <td className="py-2.5 px-3 text-right text-sm font-bold text-teal font-mono">
                {formatLakhs(boq?.reduce((s, i) => s + i.amount_lakhs, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default function EstimatorPage() {
  const { currentProject, costEstimate, setCostEstimate } = useProjectStore()
  const localCost = useMemo(() => estimateCostFrontend(currentProject), [currentProject])
  const cost = costEstimate || localCost

  return (
    <div className="space-y-5">
      {/* Confidence Bands */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Optimistic (P10)', val: cost.total?.p10, color: 'green', desc: 'Best-case: bulk discounts, smooth execution' },
          { label: 'Most Likely (P50)', val: cost.total?.p50, color: 'teal', desc: 'Expected cost with standard conditions' },
          { label: 'Pessimistic (P90)', val: cost.total?.p90, color: 'red', desc: 'Worst-case: delays, price escalation' },
        ].map(b => (
          <Card key={b.label} glow={b.color === 'teal'}>
            <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-1">{b.label}</p>
            <p className={`text-xl font-bold font-mono ${b.color === 'teal' ? 'text-teal' : b.color === 'green' ? 'text-green' : 'text-red'}`}>{formatLakhs(b.val)}</p>
            <p className="text-[10px] text-txt-3 mt-1">{b.desc}</p>
          </Card>
        ))}
      </div>

      {/* Metadata + BOQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 space-y-3">
          <h4 className="text-sm font-semibold text-txt-1">Estimate Details</h4>
          {[
            ['City Rate', `${formatRupees(cost.city_rate_used)}/sqft`],
            ['Quality Multiplier', `×${cost.quality_multiplier}`],
            ['Structural Multiplier', `×${cost.structural_multiplier?.toFixed(2)}`],
            ['Cost per sqft (P50)', formatRupees(cost.cost_per_sqft?.p50)],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-txt-3">{label}</span>
              <span className="font-mono text-txt-1">{val}</span>
            </div>
          ))}
          <div className="mt-3 p-2 bg-bg-3 rounded-lg text-[10px] text-txt-3 leading-relaxed">
            💡 {cost.variance_driver}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <BOQTable boq={cost.boq} />
        </Card>
      </div>
    </div>
  )
}
