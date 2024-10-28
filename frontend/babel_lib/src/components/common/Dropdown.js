import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../hooks/ui/useClickOutside';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.secondaryBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  color: ${props => props.theme.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.background};
  }

  svg {
    transition: transform 0.2s;
    transform: rotate(${props => props.isOpen ? '180deg' : '0deg'});
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  min-width: 200px;
  background: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: all 0.2s;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.secondaryBackground};
  }

  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background: none;
    }
  `}
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.border};
  margin: 0.5rem 0;
`;

const Dropdown = ({ 
  trigger, 
  items, 
  onSelect,
  placement = 'bottom-start'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsOpen(false));

  const handleSelect = (item) => {
    if (!item.disabled) {
      onSelect(item);
      setIsOpen(false);
    }
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownTrigger 
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
      >
        {trigger}
        <ChevronDown size={16} />
      </DropdownTrigger>

      <DropdownMenu isOpen={isOpen}>
        {items.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} />
          ) : (
            <MenuItem
              key={item.id || index}
              onClick={() => handleSelect(item)}
              disabled={item.disabled}
            >
              {item.icon && item.icon}
              {item.label}
            </MenuItem>
          )
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
};

export default Dropdown;
