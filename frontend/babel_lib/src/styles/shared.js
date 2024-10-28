import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Layout Components
export const PageWrapper = styled.div`
  padding-top: 4rem; // Height of Navigation + some spacing
  min-height: 100vh;
  width: 100%;
  background: ${props => props.theme.background};
  position: relative;
  z-index: 1;
`;

export const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: ${props => props.theme.secondaryBackground}95;
  backdrop-filter: blur(8px);
  border-radius: 16px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: 0 4px 6px -1px ${props => props.theme.background}40;
  position: relative;
  z-index: 2;
`;

// Typography
export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: ${props => props.theme.text}; // This ensures the text color matches the theme
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme.text};
  margin-bottom: 1rem;
`;

// Form Elements
export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  border: 2px solid ${props => props.theme.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}40;
  }
  
  &::placeholder {
    color: ${props => props.theme.textSecondary};
    opacity: 0.8;
  }
`;

export const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.primaryHover};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const OutlineButton = styled(StyledButton)`
  background-color: transparent;
  border: 2px solid ${props => props.theme.primary};
  color: ${props => props.theme.primary};
  
  &:hover {
    background-color: ${props => props.theme.primary}10;
    border-color: ${props => props.theme.primaryHover};
    color: ${props => props.theme.primaryHover};
  }
`;

// Navigation
export const StyledLink = styled(Link)`
  color: ${props => props.theme.primary};
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.primaryHover};
  }
`;

// Cards
export const Card = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &.primary {
    background-color: ${props => props.theme.primary};
    color: white;
  }
  
  &.secondary {
    background-color: ${props => props.theme.secondaryBackground};
    color: ${props => props.theme.text};
  }
`;
