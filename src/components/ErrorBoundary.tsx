import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Przechwytuje błędy renderowania i pokazuje bezpieczny widok awaryjny aplikacji.
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  /**
   * Ustawia stan awarii po wykryciu błędu renderowania.
   * @returns Stan awarii boundary.
   * @example
   * ErrorBoundary.getDerivedStateFromError(new Error("Boom"));
   */
  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  /**
   * Loguje szczegóły błędu tylko w trybie deweloperskim.
   * @param error Przechwycony błąd.
   * @param errorInfo Dodatkowy kontekst z Reacta.
   * @returns Funkcja nie zwraca wartości.
   * @example
   * // Wywoływane automatycznie przez React po błędzie potomka.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary captured an error:", error, errorInfo);
    }
  }

  /**
   * Renderuje dzieci lub ekran awaryjny, gdy wystąpił błąd.
   * @returns Widok potomny albo fallback z przyciskiem odświeżenia.
   * @example
   * <ErrorBoundary><App /></ErrorBoundary>
   */
  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="error-boundary" role="alert">
        <svg
          aria-hidden="true"
          className="error-boundary-icon"
          viewBox="0 0 24 24"
          width="72"
          height="72"
        >
          <path
            d="M12 3L1.8 20.5c-.4.7.1 1.5.9 1.5h18.6c.8 0 1.3-.8.9-1.5L12 3z"
            fill="currentColor"
          />
          <rect x="11" y="9" width="2" height="6" fill="#fff" />
          <rect x="11" y="16.5" width="2" height="2" fill="#fff" />
        </svg>
        <h1>Cos poszlo nie tak</h1>
        <button onClick={() => window.location.reload()} type="button">
          Odswiez strone
        </button>
      </main>
    );
  }
}
