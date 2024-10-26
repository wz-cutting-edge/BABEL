import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: ${props => props.primary ? props.theme.accent : 'transparent'};
  color: ${props => props.primary ? props.theme.background : props.theme.text};
  border: ${props => props.primary ? 'none' : `1px solid ${props.theme.accent}`};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${props => props.primary ? props.theme.accent + 'dd' : props.theme.accent + '22'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = ({ children, primary, ...props }) => {
  return (
    <StyledButton primary={primary} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button;