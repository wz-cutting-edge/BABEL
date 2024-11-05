import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter } from 'lucide-react';

const FooterWrapper = styled.footer`
  background-color: ${props => props.theme.surfaceColor};
  border-top: 1px solid ${props => props.theme.borderLight};
  padding: 2rem 0;
  margin-top: auto;
  box-shadow: 0 -1px ${props => props.theme.shadowSm};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterTitle = styled.h3`
  color: ${props => props.theme.text};
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.textSecondary};
  text-decoration: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: ${props => props.theme.primary};
    transform: translateX(4px);
  }

  svg {
    color: ${props => props.theme.textSecondary};
  }

  &:hover svg {
    color: ${props => props.theme.primary};
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterContent>
        <FooterSection>
          <FooterTitle>About BABEL</FooterTitle>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Resources</FooterTitle>
          <FooterLink to="/help">Help Center</FooterLink>
          <FooterLink to="/guidelines">Community Guidelines</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Connect</FooterTitle>
          <SocialLinks>
            <FooterLink to="https://github.com/your-repo" target="_blank">
              <Github size={16} /> GitHub
            </FooterLink>
            <FooterLink to="https://twitter.com/your-handle" target="_blank">
              <Twitter size={16} /> Twitter
            </FooterLink>
          </SocialLinks>
        </FooterSection>
      </FooterContent>
    </FooterWrapper>
  );
};

export default Footer;
