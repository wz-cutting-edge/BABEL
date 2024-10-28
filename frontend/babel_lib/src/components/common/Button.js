import React from 'react';
import styled, { css } from 'styled-components';

const variants = {
  primary: css`
    background-color: ${props => props.theme.primary};
    color: white;
    
    &:hover {
      background-color: ${props => props.theme.primaryHover};
    }
  `,
  secondary: css`
    background-color: ${props => props.theme.secondary};
    color: white;
    
    &:hover {
      background-color: ${props => props.theme.secondaryHover};
    }
  `,
  outline: css`
    background-color: transparent;
    border: 1px solid ${props => props.theme.primary};
    color: ${props => props.theme.primary};
    
    &:hover {
      background-color: ${props => props.theme.primary}10;
    }
  `,
  danger: css`
    background-color: ${props => props.theme.error};
    color: white;
    
    &:hover {
      background-color: ${props => props.theme.errorHover};
    }
  `
};

const sizes = {
  small: css`
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  `,
  medium: css`
    padding: 0.5rem 1rem;
    font-size: 1rem;
  `,
  large: css`
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  `
};

const Button = styled.button`
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => variants[props.variant || 'primary']}
  ${props => sizes[props.size || 'medium']}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
`;

export default Button;
