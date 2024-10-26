import React from 'react';
import styled from 'styled-components';

const CollectionsWrapper = styled.div`
  padding: 2rem;
`;

const CollectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const CollectionCard = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 5px;
`;

const Collections = () => {
  // Mock data for demonstration
  const collections = [
    { id: 1, name: 'Favorite Books', itemCount: 15 },
    { id: 2, name: 'Must-Watch Movies', itemCount: 8 },
    { id: 3, name: 'Computer Science Textbooks', itemCount: 5 },
    { id: 4, name: 'Classic Literature', itemCount: 12 },
  ];

  return (
    <CollectionsWrapper>
      <h2>My Collections</h2>
      <CollectionGrid>
        {collections.map(collection => (
          <CollectionCard key={collection.id}>
            <h3>{collection.name}</h3>
            <p>{collection.itemCount} items</p>
            <button>View Collection</button>
          </CollectionCard>
        ))}
      </CollectionGrid>
    </CollectionsWrapper>
  );
};

export default Collections;