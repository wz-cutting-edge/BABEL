import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.borderLight};
  background-color: ${props => props.isScrolled ? 
    `${props.theme.surfaceColor}95` : 
    props.theme.surfaceColor};
  backdrop-filter: ${props => props.isScrolled ? 'blur(12px)' : 'none'};
  transform: translateY(${props => props.hide ? '-100%' : '0'});
  transition: all 0.3s ease, background-color 0.2s ease, border-color 0.2s ease;
  color: ${props => props.theme.text};
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
`;

export const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const NavLink = styled(Link)`
  text-decoration: none;
  color: ${props => props.theme.text};
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease, color 0.2s ease, background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.backgroundAlt};
  }

  &.active {
    color: ${props => props.theme.primary};
    background: ${props => props.theme.primaryAlpha};
  }
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  color: ${props => props.theme.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.backgroundAlt};
  }
`;

export const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: ${props => props.theme.surfaceColor};
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  min-width: 200px;
  box-shadow: ${props => props.theme.shadowMd};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.2s ease;
  overflow: hidden;
`;

export const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: ${props => props.theme.text};
  transition: background-color 0.2s ease;
  text-decoration: none;

  &:hover {
    background: ${props => props.theme.backgroundAlt};
  }

  svg {
    color: ${props => props.theme.textSecondary};
  }
`;

export const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

export const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.text};
  text-decoration: none;
  transition: color 0.2s ease;

  svg {
    color: ${props => props.theme.primary};
    transition: color 0.2s ease;
  }

  span {
    font-weight: bold;
    color: ${props => props.theme.text};
    transition: color 0.2s ease;
  }
`;

export const LogoText = styled.span`
  font-weight: bold;
  color: ${props => props.theme.text};
`;

export const AvatarImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

export const DropdownHeader = styled.div`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
  
  div:first-child {
    color: ${props => props.theme.text};
  }
  
  div:last-child {
    font-size: 0.75rem;
    opacity: 0.7;
    color: ${props => props.theme.textSecondary};
  }
`;

export const DropdownEmail = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
`;

export const ThemeToggleButton = styled(IconButton)`
  color: ${props => props.theme.text};
  transition: all 0.2s ease, color 0.2s ease, background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.backgroundAlt};
  }

  svg {
    transition: color 0.2s ease;
  }
`;

export const NotificationDot = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${props => props.theme.error};
  border-radius: 50%;
  width: 10px;
  height: 10px;
`;

export const NavContainer = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

export const TicketNotification = styled.span`
  background: ${props => props.theme.error};
  border-radius: 50%;
  width: 8px;
  height: 8px;
`;

export const TicketHeader = styled.div`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.text};
`;

export const RegisterButton = styled(IconButton)`
  background-color: ${props => props.theme.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.primaryHover};
    opacity: 0.9;
  }
`;
