import React from 'react';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  background-color: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.text};
  padding: 1rem;
  text-align: center;
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <p>&copy; 2024 BABEL Digital Library. All rights reserved.</p>
    </FooterWrapper>
  );
};

export default Footer;