import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { BookOpen, Search, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../components/common';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1b1e, #2C2F33);
`;

const MainSection = styled.section`
  flex: 1;
  width: 100%;
  padding: 3rem 1rem;
  
  @media (min-width: 768px) {
    padding: 6rem 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 8rem 2rem;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: bold;
  letter-spacing: -0.025em;
  color: ${props => props.theme.text};
  
  @media (min-width: 640px) {
    font-size: 2.5rem;
  }
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
  
  @media (min-width: 1024px) {
    font-size: 3.75rem;
  }
`;

const Description = styled.p`
  max-width: 700px;
  margin: 0 auto;
  color: ${props => props.theme.secondary};
  
  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  max-width: 24rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  background-color: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
  border-radius: 0.375rem;
  
  &::placeholder {
    color: ${props => props.theme.secondary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  @media (min-width: 400px) {
    flex-direction: row;
  }
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.theme.primary};
  color: white;
  
  &:hover {
    opacity: 0.9;
  }
`;

const OutlineButton = styled(StyledButton)`
  background-color: transparent;
  border: 1px solid white;
  
  &:hover {
    background-color: white;
    color: ${props => props.theme.background};
  }
`;

const Home = () => {
  return (
    <PageWrapper>
      <MainSection>
        <ContentContainer>
          <ContentWrapper>
            <Title>Welcome to BABEL</Title>
            <Description>
              BABEL is a digital library archive and social platform for books, textbooks,
              movies, videos, and more. Join our community to discover, share, and discuss your favorite content.
            </Description>
            <SearchForm>
              <SearchInput placeholder="Search for content..." />
              <StyledButton>
                <Search size={16} />
                Search
              </StyledButton>
            </SearchForm>
            <ButtonGroup>
              <StyledButton as={Link} to="/login">
                <LogIn size={16} />
                Login
              </StyledButton>
              <OutlineButton as={Link} to="/register">
                <UserPlus size={16} />
                Register
              </OutlineButton>
            </ButtonGroup>
          </ContentWrapper>
        </ContentContainer>
      </MainSection>
    </PageWrapper>
  );
};

export default Home;
