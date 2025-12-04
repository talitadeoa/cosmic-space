"use client";

import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary para capturar erros em componentes canvas
 * Previne que falhas em um canvas quebre toda a aplicação
 */
export class CanvasErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Canvas Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Erro ao Renderizar Canvas</h1>
            <p className="text-slate-300 mb-2">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition"
            >
              Tentar Novamente
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
