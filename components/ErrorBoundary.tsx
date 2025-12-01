"use client";

import React from "react";

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console to make it easy to copy the full stack trace
    // quando testar no navegador.
    // Você pode aqui adicionar também um envio para um serviço de logs.
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary captured:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg bg-rose-900/80 text-rose-100">
          <h3 className="mb-2 text-lg font-semibold">Erro na cena 3D</h3>
          <p className="text-sm">Uma exceção ocorreu ao renderizar a cena.</p>
          <details className="mt-3 whitespace-pre-wrap text-xs text-rose-200">
            {this.state.error?.message}
            {this.state.info?.componentStack && (
              <>
                {'\n'}
                {this.state.info.componentStack}
              </>
            )}
          </details>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
