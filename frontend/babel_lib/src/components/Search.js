import React, { useCallback } from 'react';
import { useDebounceSearch } from '../hooks/useDebounceSearch';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { cacheService } from '../services/CacheService';

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
