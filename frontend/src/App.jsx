// FILE: src/App.jsx
import React, { Suspense, lazy } from 'react'
import useProjectStore from './store/projectStore'
import useProjectData from './hooks/useProjectData'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { ParallaxComponent } from './components/ui/ParallaxScrolling'

// ── Lazy-loaded feature pages ─────────────────────────────────────────
const Dashboard        = lazy(() => import('./components/features/dashboard/Dashboard'))
const FloorPlanPage    = lazy(() => import('./components/features/floorplan/FloorPlanPage'))
const EstimatorPage    = lazy(() => import('./components/features/estimator/EstimatorPage'))
const WhatIfPage       = lazy(() => import('./components/features/whatif/WhatIfPage'))
const SchedulePage     = lazy(() => import('./components/features/schedule/SchedulePage'))
const DelayCascadePage = lazy(() => import('./components/features/cascade/DelayCascadePage'))
const RiskPage         = lazy(() => import('./components/features/risks/RiskPage'))
const ReversePlanPage  = lazy(() => import('./components/features/reverse/ReversePlanPage'))
const MaterialSwapPage = lazy(() => import('./components/features/materials/MaterialSwapPage'))
const ResourcePage     = lazy(() => import('./components/features/resources/ResourcePage'))

// ── Page titles for error boundary ────────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  floorplan: 'Floor Plan',
  estimator: 'Cost Estimator',
  whatif: 'What-If Sandbox',
  schedule: 'Schedule',
  cascade: 'Delay Cascade',
  risks: 'Risk Engine',
  reverse: 'Reverse Planning',
  materials: 'Material Swap',
  resources: 'Resources',
}

function PageRouter() {
  const activePage = useProjectStore(s => s.activePage)

  const pages = {
    dashboard: Dashboard,
    floorplan: FloorPlanPage,
    estimator: EstimatorPage,
    whatif: WhatIfPage,
    schedule: SchedulePage,
    cascade: DelayCascadePage,
    risks: RiskPage,
    reverse: ReversePlanPage,
    materials: MaterialSwapPage,
    resources: ResourcePage,
  }

  const Page = pages[activePage] || Dashboard

  return (
    <ErrorBoundary key={activePage} name={PAGE_TITLES[activePage] || 'Page'}>
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="md" />
        </div>
      }>
        <Page />
      </Suspense>
    </ErrorBoundary>
  )
}

export default function App() {
  const [showLanding, setShowLanding] = React.useState(true)
  
  // Initialize offline-first data layer
  useProjectData()

  if (showLanding) {
    return <ParallaxComponent onEnterSite={() => setShowLanding(false)} />
  }

  return (
    <Layout>
      <PageRouter />
    </Layout>
  )
}
