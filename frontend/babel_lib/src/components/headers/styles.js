import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.border};
  background-color: ${props => props.isScrolled ? 
    `${props.theme.background}95` : 
    props.theme.background};
  backdrop-filter: ${props => props.isScrolled ? 'blur(8px)' : 'none'};
  transform: translateY(${props => props.hide ? '-100%' : '0'});
  transition: transform 0.3s ease;
`;

export const Container = styled.div`
  display: flex;
  height: 4rem;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

export const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.spacing || '1.5rem'};

  &.logo-group {
    flex: 0 0 auto;
    margin-right: 2rem;
  }

  &.nav-links {
    flex: 1;
    justify-content: flex-start;
  }

  &.actions-group {
    flex: 0 0 auto;
    justify-content: flex-end;
  }
`;

export const NavLink = styled(Link)`
  color: ${props => props.theme.secondary};
  font-size: 0.875rem;
  font-weight: 500;
  &:hover {
    color: ${props => props.theme.primary};
  }
`;

export const IconButton = styled.button`
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

export const Dropdown = styled.div`
  position: relative;
`;

export const DropdownContent = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  width: 14rem;
  margin-top: 0.5rem;
  background: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.border};
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

export const DropdownItem = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  text-align: left;
  
  &:hover {
    background: ${props => props.theme.hover};
  }
`;

export const PrimaryButton = styled(IconButton)`
  background-color: ${props => props.theme.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  
  &:hover {
    background-color: ${props => props.theme.primaryHover};
  }
`;

export const SecondaryButton = styled(IconButton)`
  &:hover {
    background-color: ${props => props.theme.hover};
  }
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
`;

export const DropdownUserInfo = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.secondary};
`;
