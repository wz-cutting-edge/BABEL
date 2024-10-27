import React, { useState } from 'react';
import styled from 'styled-components';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Search as SearchIcon, Tag as TagIcon } from 'lucide-react';
import { Button } from '../components/common';
import { useAuth } from '../contexts/AuthContext';

const SearchWrapper = styled.div`
  padding: 2rem;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.accent};
  border-radius: 5px;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.accent};
  border-radius: 5px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ResultCard = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 5px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.secondary};
`;

const NoResults = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.secondary};
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
`;

const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  background: ${props => props.theme.primary}20;
  color: ${props => props.theme.primary};
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Search = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const archiveRef = collection(db, 'archive'); // Changed from 'content' to 'archive'
      let constraints = [];
      
      // Only add isPublic constraint for non-authenticated users
      if (!user) {
        constraints.push(where('isPublic', '==', true));
      }

      // Add type filter if not 'all'
      if (mediaType !== 'all') {
        constraints.push(where('type', '==', mediaType));
      }

      const searchTermLower = searchTerm.toLowerCase();
      
      let searchQuery = query(
        archiveRef,
        ...constraints,
        orderBy('title'),
        where('title', '>=', searchTermLower),
        where('title', '<=', searchTermLower + '\uf8ff')
      );

      let querySnapshot = await getDocs(searchQuery);
      let searchResults = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only include public content or if user is authenticated
        if (data.isPublic || user) {
          searchResults.push({
            id: doc.id,
            ...data
          });
        }
      });

      // Then, try description and tags search if no results
      if (searchResults.length === 0) {
        searchQuery = query(archiveRef, ...constraints);
        querySnapshot = await getDocs(searchQuery);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.isPublic && !user) return;
          
          const descriptionMatch = data.description?.toLowerCase().includes(searchTermLower);
          const tagsMatch = data.tags?.some(tag => tag.toLowerCase().includes(searchTermLower));
          
          if (descriptionMatch || tagsMatch) {
            searchResults.push({
              id: doc.id,
              ...data
            });
          }
        });
      }

      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchWrapper>
      <h2>Search BABEL</h2>
      <SearchForm onSubmit={handleSearch}>
        <SearchInput
          type="text"
          placeholder="Search by title, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="book">Books</option>
          <option value="movie">Movies</option>
          <option value="textbook">Textbooks</option>
        </FilterSelect>
        <StyledButton type="submit" disabled={loading}>
          <SearchIcon size={16} />
          Search
        </StyledButton>
      </SearchForm>

      {loading && <LoadingSpinner>Searching...</LoadingSpinner>}
      {error && <NoResults>{error}</NoResults>}
      
      <ResultsGrid>
        {results.length === 0 && !loading && !error ? (
          <NoResults>No results found. Try adjusting your search terms.</NoResults>
        ) : (
          results.map(result => (
            <ResultCard key={result.id}>
              {result.thumbnail && (
                <img 
                  src={result.thumbnail} 
                  alt={result.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                />
              )}
              <h3>{result.title}</h3>
              {result.author && <p>Author: {result.author}</p>}
              <p>Type: {result.type}</p>
              {result.description && <p>{result.description}</p>}
              {result.tags && result.tags.length > 0 && (
                <TagsWrapper>
                  {result.tags.map((tag, index) => (
                    <Tag key={index}>
                      <TagIcon size={12} />
                      {tag}
                    </Tag>
                  ))}
                </TagsWrapper>
              )}
            </ResultCard>
          ))
        )}
      </ResultsGrid>
    </SearchWrapper>
  );
};

export default Search;
