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
 * Brutalist error boundary — catches render crashes and shows a retry card.
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
          <div className="bg-white border-2 border-black p-8 max-w-md w-full shadow-[8px_8px_0_rgba(0,0,0,0.1)]">
            {/* Error header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-black">
              <div className="w-10 h-10 bg-red-500 border-2 border-black flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-widest font-mono">
                  {this.props.fallbackTitle || 'SYS_ERROR'}
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
                  COMPONENT_CRASH_DETECTED
                </p>
              </div>
            </div>

            {/* Error detail */}
            <div className="bg-black text-red-400 p-4 mb-6 font-mono text-[10px] tracking-widest uppercase overflow-x-auto max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </div>

            {/* Retry */}
            <button
              onClick={this.handleRetry}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary border-2 border-black text-black text-xs font-bold uppercase tracking-widest font-mono hover:bg-black hover:text-brand-primary transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)]"
            >
              <RotateCcw size={14} />
              RETRY_RENDER
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
