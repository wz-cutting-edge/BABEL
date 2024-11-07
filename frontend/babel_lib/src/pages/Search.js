import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useDebounce } from '../hooks/useDebounce';
import { searchMedia } from '../services/api/media';
import { Search as SearchIcon, Filter, Book, Video } from 'lucide-react';
import { Loading, ErrorMessage } from '../components/common';
import { useNavigate } from 'react-router-dom';
import AddToCollection from '../components/features/collections/AddToCollection';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuth } from '../contexts/AuthContext';

const SearchWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const SearchHeader = styled.div`
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, ${props => props.theme.primary}, ${props => props.theme.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadowMd};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  font-size: 1rem;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.primary}30;
  }
`;

const StyledSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  min-width: 150px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.primary}30;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
`;

const MediaCard = styled.div`
  background: ${props => props.theme.secondaryBackground};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.theme.borderLight};
  box-shadow: ${props => props.theme.shadowSm};

  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.theme.primary}50;
    box-shadow: ${props => props.theme.shadowLg};
  }
`;

const MediaThumbnail = styled.div`
  height: 320px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.background};
  border-bottom: 2px solid ${props => props.theme.borderLight};

  svg {
    color: ${props => props.theme.textSecondary};
    opacity: 0.5;
  }
`;

const MediaInfo = styled.div`
  padding: 1.5rem;
`;

const MediaTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.2rem;
  color: ${props => props.theme.text};
`;

const MediaMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 1.5rem;

  svg {
    color: ${props => props.theme.primary};
  }
`;

const MediaActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.primary ? `
    background: ${props.theme.primary};
    color: white;
    
    &:hover {
      background: ${props.theme.primary}ee;
    }
  ` : `
    background: ${props.theme.background};
    color: ${props.theme.text};
    border: 2px solid ${props.theme.borderLight};
    
    &:hover {
      border-color: ${props.theme.primary};
      color: ${props.theme.primary};
    }
  `}
`;

const genres = [
  'fiction',
  'non-fiction',
  'Action/Adventure',
  'fantasy',
  'graphic novel',
  'horror',
  'mystery',
  'romance',
  'supernatural',
  'comedy',
  'sci-fi',
  'thriller/suspense',
  'drama',
  'children',
  'young adult',
  'adult',
  'art/photography',
  'biography',
  'culinary/food',
  'poetry',
  'history',
  'math',
  'language',
  'science',
  'social science',
  'essay',
  'how-to/guide',
  'informative',
  'technology',
  'travel'
];

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    genre: 'all'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [userCollections, setUserCollections] = useState([]);
  const { user } = useAuth();

  const searchHandler = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchMedia(searchTerm, filters.type);
      const filteredResults = filters.genre === 'all' 
        ? searchResults
        : searchResults.filter(item => 
            Array.isArray(item.genres) 
              ? item.genres.includes(filters.genre)
              : item.genre === filters.genre
          );
      setResults(filteredResults);
    } catch (err) {
      setError('Failed to fetch search results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.genre]);

  const debouncedSearch = useDebounce(searchHandler, 500);

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  useEffect(() => {
    const fetchUserCollections = async () => {
      try {
        const collectionsRef = collection(db, 'collections');
        const q = query(collectionsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const collectionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    if (user) {
      fetchUserCollections();
    }
  }, [user]);

  const handleViewMedia = (item) => {
    if (!user) {
      navigate('/login', { state: { from: `/media/${item.id}` } });
      return;
    }
    navigate(`/media/${item.id}`);
  };

  const handleAddToCollection = (item) => {
    if (!user) {
      navigate('/login', { state: { from: '/search' } });
      return;
    }
    setSelectedMedia(item);
    setShowAddToCollection(true);
  };

  return (
    <SearchWrapper>
      <SearchHeader>
        <h1>Search</h1>
        <SearchForm onSubmit={(e) => e.preventDefault()}>
          <SearchInput
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, description..."
          />
          <StyledSelect
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="all">All Types</option>
            <option value="book">Books</option>
            <option value="video">Videos</option>
            <option value="article">Articles</option>
          </StyledSelect>
          <StyledSelect
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          >
            <option value="all">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </StyledSelect>
          <ActionButton onClick={() => searchHandler('')}>
            Enter
          </ActionButton>
        </SearchForm>
      </SearchHeader>

      {loading && <Loading />}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ResultsGrid>
        {results.map((item) => (
          <MediaCard key={item.id}>
            <MediaThumbnail style={{ backgroundImage: `url(${item.coverUrl})` }}>
              {!item.coverUrl && (
                item.type === 'book' ? <Book size={32} /> : <Video size={32} />
              )}
            </MediaThumbnail>
            <MediaInfo>
              <MediaTitle>{item.title}</MediaTitle>
              <MediaMeta>
                {item.type === 'book' ? <Book size={16} /> : <Video size={16} />}
                <span>{item.author}</span>
                {item.year && (
                  <>
                    <span>•</span>
                    <span>{item.year}</span>
                  </>
                )}
              </MediaMeta>
              <MediaActions>
                <ActionButton primary onClick={() => handleViewMedia(item)}>
                  View
                </ActionButton>
                <ActionButton onClick={() => handleAddToCollection(item)}>
                  Add to Collection
                </ActionButton>
              </MediaActions>
            </MediaInfo>
          </MediaCard>
        ))}
      </ResultsGrid>

      {showAddToCollection && selectedMedia && (
        <AddToCollection
          mediaItem={selectedMedia}
          onClose={() => {
            setShowAddToCollection(false);
            setSelectedMedia(null);
          }}
          collections={userCollections}
        />
      )}
    </SearchWrapper>
  );
};

export default Search;
