import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../hooks/useFirebase';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Loading, ErrorMessage } from '../components/common';

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
  const { user } = useAuth();
  const { queryDocuments, loading, error } = useFirebase();
  const [collections, setCollections] = useState([]);

  const fetchCollections = useCallback(async () => {
    if (!user) return;
    
    const userCollections = await queryDocuments('collections', [
      { field: 'userId', operator: '==', value: user.uid }
    ]);
    setCollections(userCollections);
  }, [user, queryDocuments]);

  const CollectionCell = React.memo(({ columnIndex, rowIndex, style, data }) => {
    const index = rowIndex * 3 + columnIndex;
    const collection = data[index];
    
    if (!collection) return null;

    return (
      <div style={style}>
        <CollectionCard>
          <h3>{collection.name}</h3>
          <p>{collection.description}</p>
        </CollectionCard>
      </div>
    );
  });

  return (
    <CollectionsWrapper>
      <h2>My Collections</h2>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeGrid
              columnCount={3}
              columnWidth={width / 3}
              height={height}
              rowCount={Math.ceil(collections.length / 3)}
              rowHeight={200}
              width={width}
              itemData={collections}
            >
              {CollectionCell}
            </FixedSizeGrid>
          )}
        </AutoSizer>
      )}
    </CollectionsWrapper>
  );
};

export default Collections;
