import React, { useCallback } from 'react';
import { useDebounceSearch } from '../../../hooks/useDebounceSearch';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { cacheService } from '../services/CacheService';
import styled from 'styled-components';

const MediaInfo = styled.div`
  padding: 1rem;
`;

const MediaTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const MediaMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
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

const Search = () => {
  const {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error
  } = useDebounceSearch({
    collectionName: 'items',
    searchFields: ['title', 'description', 'tags'],
    debounceTime: 300
  });

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  return (
    <SearchWrapper>
      <SearchInput
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <ResultsContainer>
        {results.map(item => (
          <SearchResult key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.tags?.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </SearchResult>
        ))}
      </ResultsContainer>
    </SearchWrapper>
  );
};

export default React.memo(Search);
