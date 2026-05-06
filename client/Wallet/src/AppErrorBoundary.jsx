import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    const message = this.state.error?.message || "Something went wrong while loading NexaWallet.";

    return (
      <div className="grid min-h-screen place-items-center bg-[var(--app-bg)] px-4 text-[var(--text)]">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">NexaWallet</p>
          <h1 className="mt-2 text-2xl font-bold">Could not load the app</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{message}</p>
          <button
            className="mt-5 h-11 rounded-full bg-[var(--text)] px-5 text-sm font-bold text-[var(--app-bg)]"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
