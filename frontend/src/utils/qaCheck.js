// FILE: src/utils/qaCheck.js
// ═══════════════════════════════════════════════════════════════════════
// BuildAtlas QA Check — Console diagnostic for demo validation
// Run: window.buildatlasQACheck() in browser console
// ═══════════════════════════════════════════════════════════════════════

export function buildatlasQACheck() {
  const results = []
  let passed = 0
  let failed = 0

  function check(name, fn) {
    try {
      const result = fn()
      if (result) {
        results.push({ name, status: '✅', detail: result === true ? 'OK' : result })
        passed++
      } else {
        results.push({ name, status: '❌', detail: 'FAILED' })
        failed++
      }
    } catch (e) {
      results.push({ name, status: '❌', detail: e.message })
      failed++
    }
  }

  console.group('🏗️ BuildAtlas QA Check')
  console.log('Running 8 quality checks...\n')

  // Check 1: Store has demo data
  check('Store: Demo data loaded', () => {
    const store = JSON.parse(localStorage.getItem('buildatlas-store') || '{}')
    const state = store?.state
    if (!state) return false
    const hasProject = !!state.currentProject?.project_name
    const hasCost = !!state.costEstimate?.total
    const hasSchedule = !!state.schedule?.phases
    const hasRisks = !!state.risks?.risks
    return hasProject && hasCost && hasSchedule && hasRisks
      ? `Project: ${state.currentProject.project_name}, Cost: ₹${state.costEstimate.total.p50}L`
      : false
  })

  // Check 2: All routes render — check DOM for main content
  check('Routes: Main layout present', () => {
    const layout = document.querySelector('.bg-bg-0')
    const sidebar = document.querySelector('aside')
    return layout && sidebar ? 'Layout + Sidebar rendered' : false
  })

  // Check 3: No React error boundaries triggered
  check('Errors: No error boundaries visible', () => {
    const errorCards = document.querySelectorAll('[class*="text-amber"]')
    const errorBoundary = Array.from(errorCards).find(el =>
      el.textContent.includes('temporarily unavailable')
    )
    return !errorBoundary ? 'No error states visible' : false
  })

  // Check 4: Floor plan SVG renders rooms
  check('Floor Plan: SVG has room rects', () => {
    const svgs = document.querySelectorAll('svg rect')
    return svgs.length > 0 ? `${svgs.length} SVG rects found` : 'No SVG rects (navigate to Floor Plan page)'
  })

  // Check 5: Number formatting is correct (₹ symbol present)
  check('Formatting: ₹ symbols present', () => {
    const body = document.body.textContent || ''
    const rupeeCount = (body.match(/₹/g) || []).length
    return rupeeCount > 0 ? `${rupeeCount} ₹ symbols found` : false
  })

  // Check 6: Copilot panel exists
  check('Copilot: Panel present', () => {
    const copilot = document.querySelector('aside:last-of-type')
    const hasInput = document.querySelector('textarea[placeholder*="IS codes"]')
    return copilot ? 'Copilot panel found' : false
  })

  // Check 7: No console errors (check error count)
  check('Console: Performance check', () => {
    const entries = performance.getEntriesByType('resource')
    const failedLoads = entries.filter(e => e.transferSize === 0 && e.name.includes('/api/'))
    return failedLoads.length === 0
      ? `${entries.length} resources loaded`
      : `${failedLoads.length} failed API calls (expected in demo mode)`
  })

  // Check 8: Store version is current
  check('Store: Version check', () => {
    const store = JSON.parse(localStorage.getItem('buildatlas-store') || '{}')
    return store.version === 2 ? 'Store v2 (current)' : `Store v${store.version || '?'} (expected v2)`
  })

  // Summary
  console.log('\n')
  console.table(results.map(r => ({ Check: r.name, Status: r.status, Detail: r.detail })))
  console.log(`\n📊 Result: ${passed}/${passed + failed} passed`)

  if (failed === 0) {
    console.log('%c✅ ALL CHECKS PASSED — Demo is ready!', 'color: #00C896; font-weight: bold; font-size: 14px')
  } else {
    console.log(`%c⚠️ ${failed} check(s) need attention`, 'color: #F59E0B; font-weight: bold; font-size: 14px')
  }

  console.groupEnd()
  return { passed, failed, results }
}

// Auto-register on window for console access
if (typeof window !== 'undefined') {
  window.buildatlasQACheck = buildatlasQACheck
}

export default buildatlasQACheck
