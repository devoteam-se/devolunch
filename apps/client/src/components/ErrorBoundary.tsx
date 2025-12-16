import { Component, ErrorInfo, ReactNode } from 'react';
import { css } from '@emotion/react';
import { color } from '../utils/theme';
import { logger } from '@devolunch/shared/logger/browser';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const errorContainerStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
  text-align: center;
  background-color: ${color.ivory};
`;

const errorTitleStyles = css`
  font-size: 1.5rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 1rem;
`;

const errorMessageStyles = css`
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1.5rem;
  max-width: 500px;
  line-height: 1.5;
`;

const errorButtonStyles = css`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const errorDetailsStyles = css`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  max-width: 600px;
  text-align: left;

  summary {
    cursor: pointer;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  pre {
    font-size: 0.75rem;
    color: #6b7280;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error({ err: error, errorInfo }, 'Error caught by ErrorBoundary');

    this.setState({
      error,
      errorInfo,
    });

    // You could report the error to an error reporting service here
    // reportError(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div css={errorContainerStyles}>
          <h1 css={errorTitleStyles}>Something went wrong</h1>
          <p css={errorMessageStyles}>
            We encountered an unexpected error. Please try reloading the page. If the problem persists,
            please try again later.
          </p>
          <button css={errorButtonStyles} onClick={this.handleReload}>
            Reload Page
          </button>

          {import.meta.env.DEV && this.state.error && (
            <details css={errorDetailsStyles}>
              <summary>Error Details (Development)</summary>
              <pre>
                <strong>Error:</strong> {this.state.error.message}
                {'\n\n'}
                <strong>Stack:</strong>
                {'\n'}
                {this.state.error.stack}
                {this.state.errorInfo?.componentStack && (
                  <>
                    {'\n\n'}
                    <strong>Component Stack:</strong>
                    {'\n'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
