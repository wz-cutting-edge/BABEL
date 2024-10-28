import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { BookOpen, Search, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../components/common/common';
import { 
  PageWrapper, 
  ContentContainer, 
  Title, 
  StyledButton, 
  OutlineButton,
  Input 
} from '../styles/shared';
import { useAuth } from '../contexts/AuthContext';

const MainSection = styled.section`
  flex: 1;
  width: 100%;
  padding: 3rem 1rem;
  background: linear-gradient(
    135deg,
    ${props => props.theme.background} 0%,
    ${props => props.theme.secondaryBackground} 100%
  );
  
  @media (min-width: 768px) {
    padding: 6rem 1.5rem;
  }
`;

const Description = styled.p`
  max-width: 700px;
  margin: 0 auto 2rem;
  color: ${props => props.theme.textSecondary};
  font-size: 1.125rem;
  line-height: 1.6;
  text-align: center;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 0.75rem;
  width: 100%;
  max-width: 32rem;
  margin: 1rem auto 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 24rem;
  margin: 0 auto;
  
  @media (min-width: 400px) {
    flex-direction: row;
    justify-content: center;
  }
`;

// Add the missing ContentWrapper component
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;
`;

// Add the missing SearchInput component
const SearchInput = styled(Input)`
  flex: 1;
  min-width: 0; // Prevents flex item from overflowing
`;

const Home = () => {
  const { user } = useAuth();

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
              {!user && (
                <>
                  <StyledButton as={Link} to="/login">
                    <LogIn size={16} />
                    Login
                  </StyledButton>
                  <OutlineButton as={Link} to="/register">
                    <UserPlus size={16} />
                    Register
                  </OutlineButton>
                </>
              )}
            </ButtonGroup>
          </ContentWrapper>
        </ContentContainer>
      </MainSection>
    </PageWrapper>
  );
};

export default Home;
