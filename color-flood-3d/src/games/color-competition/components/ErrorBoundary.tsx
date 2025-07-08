import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: '#ff0000',
          color: '#ffffff',
          fontFamily: 'monospace',
          overflow: 'auto',
          height: '100vh',
        }}>
          <h1>🔥 Something went wrong!</h1>
          <h2>Error:</h2>
          <pre>{this.state.error?.toString()}</pre>
          <h2>Stack:</h2>
          <pre>{this.state.error?.stack}</pre>
          {this.state.errorInfo && (
            <>
              <h2>Component Stack:</h2>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </>
          )}
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              marginTop: '1rem',
              background: '#000',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}