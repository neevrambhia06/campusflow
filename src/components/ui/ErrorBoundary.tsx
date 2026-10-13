import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CampusFlow caught an unhandled rendering error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center animate-fade-in">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="font-display font-bold text-xl text-slate-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              CampusFlow encountered an unexpected error while displaying this page.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg p-3 font-mono text-left mb-6 break-words max-h-32 overflow-y-auto">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
