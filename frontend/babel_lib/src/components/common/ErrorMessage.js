import styled from 'styled-components';

const ErrorMessage = styled.div`
  color: ${props => props.theme.error};
  background-color: ${props => props.theme.error}15;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default ErrorMessage;

