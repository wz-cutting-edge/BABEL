import React, { useState } from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.secondaryBackground};
  border-radius: 20px;
  padding: 0.5rem 1rem;
  margin: 0 1rem;
  
  @media (max-width: 768px) {
    margin: 0.5rem;
    padding: 0.75rem 1rem;
  }
`;

const Input = styled.input`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  flex-grow: 1;
  font-size: 1rem;
  outline: none;
  width: 100%;
  
  @media (max-width: 768px) {
    font-size: 16px; // Prevents zoom on iOS
  }

  &::placeholder {
    color: ${props => props.theme.text}aa;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <SearchWrapper>
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchButton type="submit">
          <Search size={20} />
        </SearchButton>
      </SearchWrapper>
    </form>
  );
};

export default SearchBar;