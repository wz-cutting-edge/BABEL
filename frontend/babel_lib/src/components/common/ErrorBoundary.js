import React from 'react';
import styled from 'styled-components';
import { AlertCircle } from 'lucide-react';

const ErrorContainer = styled.div`
  padding: 2rem;
  margin: 1rem;
  background-color: ${props => props.theme.error}15;
  border: 1px solid ${props => props.theme.error}30;
  border-radius: 8px;
  text-align: center;
`;

const ErrorIcon = styled(AlertCircle)`
  color: ${props => props.theme.error};
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h3`
  color: ${props => props.theme.error};
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.text};
  margin-bottom: 1rem;
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon size={48} />
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            {this.state.error?.message || 'An unexpected error occurred'}
          </ErrorMessage>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
