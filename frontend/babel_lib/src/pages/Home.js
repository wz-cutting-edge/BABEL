import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { BookOpen, Search, LogIn, UserPlus, Book, Video } from 'lucide-react';
import { Button } from '../components/common/common';
import { 
  PageWrapper, 
  ContentContainer, 
  Title as BaseTitle,
  StyledButton, 
  OutlineButton,
  Input 
} from '../styles/shared';
import { useAuth } from '../contexts/AuthContext';
import BookCarousel from '../components/features/books/BookCarousel';
import { searchMedia } from '../services/api/search';
import { useDebounce } from '../hooks/useDebounce';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../services/firebase/config';

const MainSection = styled.section`
  flex: 1;
  width: 100%;
  padding: 2rem 1rem;
  background: linear-gradient(
    135deg,
    ${props => props.theme.background} 0%,
    ${props => props.theme.secondaryBackground} 100%
  );
  
  @media (min-width: 768px) {
    padding: 6rem 1.5rem;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const HomeTitle = styled(BaseTitle)`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Description = styled.p`
  max-width: 700px;
  margin: 0 auto 2rem;
  color: ${props => props.theme.textSecondary};
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
  padding: 0 1rem;
  
  @media (min-width: 768px) {
    font-size: 1.125rem;
    padding: 0;
  }
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 32rem;
  margin: 1rem auto 2rem;
  position: relative;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
    gap: 0.5rem;
  }
`;

const SearchInput = styled(Input)`
  flex: 1;
  min-width: 0;
  height: 48px;
  
  @media (max-width: 768px) {
    height: 44px;
    font-size: 16px; // Prevents zoom on iOS
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 1rem;
  right: 1rem;
  background: ${props => props.theme.surfaceColor};
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadowLg};
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  z-index: 50;
  display: ${props => (props.show ? 'block' : 'none')};
  
  @media (max-width: 768px) {
    left: 0.5rem;
    right: 0.5rem;
    max-height: 300px;
  }
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.75rem;
  }
`;

const ResultInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTitle = styled.div`
  font-weight: 500;
  color: ${props => props.theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultMeta = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 24rem;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: center;
    padding: 0;
  }
  
  ${StyledButton}, ${OutlineButton} {
    flex: 1;
    
    @media (min-width: 480px) {
      flex: 0 1 auto;
      min-width: 140px;
    }
  }
`;

const Home = () => {
  const [books, setBooks] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const mediaRef = collection(db, 'media');
        const q = query(
          mediaRef,
          where('type', '==', 'book'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        setBooks(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error('Error fetching featured books:', error);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const searchHandler = useCallback(async (term) => {
    if (!term) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchMedia(term);
      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useDebounce(searchHandler, 500);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleViewItem = (item) => {
    if (!user) {
      navigate('/login', { state: { from: `/media/${item.id}` } });
    } else {
      navigate(`/media/${item.id}`);
    }
  };

  return (
    <PageWrapper>
      <MainSection>
        <ContentContainer>
          <ContentWrapper>
            <HomeTitle>Welcome to BABEL</HomeTitle>
            <Description>
              BABEL is a digital library archive and social platform for books, textbooks,
              movies, videos, and more. Join our community to discover, share, and discuss your favorite content.
            </Description>
            {!user && <BookCarousel books={books} />}
            <SearchForm onSubmit={(e) => e.preventDefault()}>
              <SearchInput 
                placeholder="Search for content..." 
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <StyledButton type="submit">
                <Search size={16} />
                Search
              </StyledButton>
              
              <SearchResults show={searchTerm.length > 0}>
                {loading ? (
                  <ResultItem>Loading...</ResultItem>
                ) : results.length > 0 ? (
                  results.map((item) => (
                    <ResultItem key={item.id} onClick={() => handleViewItem(item)}>
                      {item.type === 'book' ? <Book size={24} /> : <Video size={24} />}
                      <ResultInfo>
                        <ResultTitle>{item.title}</ResultTitle>
                        <ResultMeta>
                          {item.author} • {item.type} {item.year && `• ${item.year}`}
                        </ResultMeta>
                      </ResultInfo>
                    </ResultItem>
                  ))
                ) : searchTerm.length > 0 ? (
                  <ResultItem>No results found</ResultItem>
                ) : null}
              </SearchResults>
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
