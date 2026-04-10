import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary — catches render crashes and shows a retry card.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="bg-white border border-brand-border rounded-2xl p-8 max-w-md w-full shadow-lg">
            {/* Error header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-text">
                  {this.props.fallbackTitle || 'Something went wrong'}
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  A component failed to render
                </p>
              </div>
            </div>

            {/* Error detail */}
            <div className="bg-slate-50 border border-brand-border rounded-lg text-red-600 p-4 mb-6 font-mono text-xs overflow-x-auto max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </div>

            {/* Retry */}
            <button
              onClick={this.handleRetry}
              className="btn-primary w-full"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
