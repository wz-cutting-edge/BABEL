import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { BookOpen, Search, LogIn, UserPlus, Book, Video } from 'lucide-react';
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
  position: relative;
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

// Add new styled components for search results
const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 0.5rem;
  display: ${props => props.show ? 'block' : 'none'};
`;

const ResultItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:hover {
    background: ${props => props.theme.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ResultInfo = styled.div`
  flex: 1;
`;

const ResultTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  color: ${props => props.theme.text};
`;

const ResultMeta = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${props => props.theme.textSecondary};
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
            <Title>Welcome to BABEL</Title>
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
