import styled from 'styled-components';

export const Alert = styled.div`
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background-color: ${props => 
    props.variant === 'destructive' ? '#fef2f2' : '#f3f4f6'};
  border: 1px solid ${props => 
    props.variant === 'destructive' ? '#fecaca' : '#e5e7eb'};
  color: ${props => 
    props.variant === 'destructive' ? '#dc2626' : '#374151'};
`;

export const AlertDescription = styled.span`
  font-size: 0.875rem;
`;
