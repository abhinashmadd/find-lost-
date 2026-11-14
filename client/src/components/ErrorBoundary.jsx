import React from "react";

/**
 * Production-ready React Error Boundary.
 * Catches JavaScript errors anywhere in child component tree,
 * logs the incident, and displays a resilient fallback interface.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled rendering error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container error-boundary-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ maxWidth: "540px", margin: "0 auto", background: "#ffffff", padding: "2.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              Something Went Wrong
            </h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.95rem", lineHeight: 1.6 }}>
              An unexpected error occurred while rendering this view. Your data is safe.
              You can reload the page or return to the home screen.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
                style={{ padding: "0.6rem 1.25rem", cursor: "pointer" }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="btn btn-submit"
                style={{ padding: "0.6rem 1.25rem", cursor: "pointer" }}
              >
                Return to Home
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <pre
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  background: "#f1f5f9",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  textAlign: "left",
                  overflowX: "auto",
                  color: "#e11d48",
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
