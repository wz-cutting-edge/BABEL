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
`;

const SearchHeader = styled.div`
  margin-bottom: 2rem;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  font-size: 1rem;
  background-color: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.secondaryBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  cursor: pointer;
  color: ${props => props.theme.text};

  &:hover {
    background-color: ${props => props.theme.background};
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
`;

const StyledSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.text};
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const MediaCard = styled.div`
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  overflow: hidden;
  padding: 1rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const MediaInfo = styled.div`
  padding: 1rem;
`;

const MediaTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const MediaAuthor = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
`;

const MediaYear = styled.span`
  color: ${props => props.theme.textSecondary};
  font-size: 0.8rem;
`;

const MediaImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const MediaType = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.textSecondary};
  background: ${props => props.theme.background};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0.5rem;
`;

const MediaActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.primary ? props.theme.primary : props.theme.secondaryBackground};
  color: ${props => props.primary ? 'white' : props.theme.text};
  
  &:hover {
    background: ${props => props.primary ? props.theme.primaryHover : props.theme.border};
  }
`;

const MediaThumbnail = styled.div`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
  position: relative;

  &:before {
    content: '';
    display: ${props => props.image ? 'none' : 'block'};
    background-color: ${props => props.theme.background};
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: white;
    font-size: 0.8rem;
  }
`;

const MediaMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
`;

const EnterButton = styled(ActionButton)`
  margin-left: auto;
  background: ${props => props.theme.primary};
  color: white;
  
  &:hover {
    background: ${props => props.theme.primaryHover};
  }
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
          <EnterButton onClick={() => searchHandler('')}>
            Enter
          </EnterButton>
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
