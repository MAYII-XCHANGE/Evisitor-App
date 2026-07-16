import { Component } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "./Button";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-surface-muted p-6">
          <div className="max-w-md rounded-xl border border-gray-100 bg-white p-6 text-center shadow-card">
            <FiAlertCircle className="mx-auto h-10 w-10 text-danger" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-500">Refresh the page or contact the portal administrator if this continues.</p>
            <Button className="mt-5" onClick={() => window.location.reload()}>
              Reload Portal
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
