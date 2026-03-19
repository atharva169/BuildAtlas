// FILE: src/components/ErrorBoundary.jsx
// ═══════════════════════════════════════════════════════════════════════
// Error Boundary — catches any render error in a feature page.
// Shows a clean "Feature unavailable" card. Never crashes the app.
// ═══════════════════════════════════════════════════════════════════════

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // Log for debugging — never show to user
    console.error(
      `[BuildAtlas] 🔴 ErrorBoundary caught in ${this.props.name || 'unknown'}:`,
      error,
      errorInfo?.componentStack
    )
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center mb-5">
            <AlertTriangle size={24} className="text-amber" />
          </div>
          <h3 className="text-sm font-semibold text-txt-1 mb-1.5">
            {this.props.title || 'Feature temporarily unavailable'}
          </h3>
          <p className="text-xs text-txt-3 max-w-xs mb-5 leading-relaxed">
            {this.props.message || 'This section encountered an issue. Your data is safe — try refreshing this view.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg bg-teal/10 text-teal border border-teal/20 hover:bg-teal/20 transition-all"
          >
            <RefreshCw size={13} />
            Try Again
          </button>
          {/* Debug info — visible only in dev console */}
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 text-left max-w-md w-full">
              <summary className="text-[10px] text-txt-3 cursor-pointer hover:text-txt-2">Debug info</summary>
              <pre className="mt-2 text-[10px] text-red bg-bg-3 rounded-lg p-3 overflow-x-auto border border-bdr-1">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
