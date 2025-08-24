import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // You can also log error to an error reporting service here
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Something went wrong.
          </h1>
          <p className="mb-2 text-gray-700 dark:text-gray-300">
            An unexpected error has occurred.
          </p>
          {this.state.error && (
            <details className="mb-4 whitespace-pre-wrap text-xs text-gray-500 dark:text-gray-400">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
          <button
            onClick={this.handleReload}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
