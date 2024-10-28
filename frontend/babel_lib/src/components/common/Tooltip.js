import React, { useState } from 'react';
import styled from 'styled-components';

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div`
  position: absolute;
  z-index: 1000;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  border-radius: 4px;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  
  /* Positioning based on placement prop */
  ${props => {
    switch (props.placement) {
      case 'top':
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
        `;
      case 'bottom':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(8px);
        `;
      case 'left':
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(-8px);
        `;
      case 'right':
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(8px);
        `;
      default:
        return '';
    }
  }}

  /* Arrow */
  &::before {
    content: '';
    position: absolute;
    border: 6px solid transparent;
    
    ${props => {
      switch (props.placement) {
        case 'top':
          return `
            border-top-color: ${props.theme.background};
            bottom: -12px;
            left: 50%;
            transform: translateX(-50%);
          `;
        case 'bottom':
          return `
            border-bottom-color: ${props.theme.background};
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
          `;
        case 'left':
          return `
            border-left-color: ${props.theme.background};
            right: -12px;
            top: 50%;
            transform: translateY(-50%);
          `;
        case 'right':
          return `
            border-right-color: ${props.theme.background};
            left: -12px;
            top: 50%;
            transform: translateY(-50%);
          `;
        default:
          return '';
      }
    }}
  }

  /* Animation */
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: opacity 0.2s, visibility 0.2s;
`;

const Tooltip = ({ 
  children, 
  content, 
  placement = 'top',
  delay = 200 
}) => {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setVisible(false);
  };

  return (
    <TooltipWrapper
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <TooltipContent
        placement={placement}
        visible={visible}
        role="tooltip"
      >
        {content}
      </TooltipContent>
    </TooltipWrapper>
  );
};

export default Tooltip;
