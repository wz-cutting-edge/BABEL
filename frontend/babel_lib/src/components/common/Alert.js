import styled from 'styled-components';

export const Alert = styled.div`
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  
  ${props => {
    switch (props.variant) {
      case 'error':
        return `
          background-color: ${props.theme.error}15;
          color: ${props.theme.error};
          border: 1px solid ${props.theme.error}30;
        `;
      case 'success':
        return `
          background-color: ${props.theme.success}15;
          color: ${props.theme.success};
          border: 1px solid ${props.theme.success}30;
        `;
      case 'warning':
        return `
          background-color: ${props.theme.warning}15;
          color: ${props.theme.warning};
          border: 1px solid ${props.theme.warning}30;
        `;
      default:
        return `
          background-color: ${props.theme.info}15;
          color: ${props.theme.info};
          border: 1px solid ${props.theme.info}30;
        `;
    }
  }}
`;

export const AlertTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-weight: 600;
`;

export const AlertDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
`;
