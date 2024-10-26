import React, { useState } from 'react';
import styled from 'styled-components';

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

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('all');
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulated search results
    const mockResults = [
      { id: 1, title: 'The Great Gatsby', type: 'book' },
      { id: 2, title: 'Inception', type: 'movie' },
      { id: 3, title: 'Introduction to Psychology', type: 'textbook' },
    ];
    setResults(mockResults);
  };

  return (
    <SearchWrapper>
      <h2>Search BABEL</h2>
      <SearchForm onSubmit={handleSearch}>
        <SearchInput
          type="text"
          placeholder="Search for books, movies, textbooks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="book">Books</option>
          <option value="movie">Movies</option>
          <option value="textbook">Textbooks</option>
        </FilterSelect>
        <button type="submit">Search</button>
      </SearchForm>
      <ResultsGrid>
        {results.map(result => (
          <ResultCard key={result.id}>
            <h3>{result.title}</h3>
            <p>Type: {result.type}</p>
          </ResultCard>
        ))}
      </ResultsGrid>
    </SearchWrapper>
  );
};

export default Search;
