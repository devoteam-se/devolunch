import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@devolunch/shared/logger/browser';
import { css } from '@emotion/react';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
}

const fallbackStyles = css`
  padding: 1rem;
  margin: 0.5rem 0;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  color: #7f1d1d;
  font-size: 0.875rem;
  text-align: center;
`;

class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.componentName || 'Unknown Component';
    logger.error({ err: error, errorInfo, componentName }, 'Component error');

    // You could report component-specific errors here
    // reportComponentError(componentName, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const componentName = this.props.componentName || 'component';
      return (
        <div css={fallbackStyles}>
          Unable to load {componentName}. Please refresh the page.
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
