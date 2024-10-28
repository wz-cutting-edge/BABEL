import React from 'react';
import styled from 'styled-components';

const StyledTag = styled.span`
  background-color: ${props => props.theme.accent + '33'};
  color: ${props => props.theme.accent};
  padding: 0.25rem 0.5rem;
  border-radius: 16px;
  font-size: 0.8rem;
  display: inline-block;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Tag = ({ children }) => {
  return <StyledTag>{children}</StyledTag>;
};

export default Tag;