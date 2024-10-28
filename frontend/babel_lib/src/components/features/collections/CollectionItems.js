import React from 'react';
import styled from 'styled-components';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { Loading, ErrorMessage } from '../../common';
import { Trash2 } from 'lucide-react';

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ItemCard = ({ item }) => (
  <StyledItemCard>
    <DeleteButton onClick={() => handleDeleteItem(item.id)}>
      <Trash2 size={20} />
    </DeleteButton>
    <h4>{item.title}</h4>
    <ItemMetadata>
      <p>Added by: {item.addedBy?.displayName || 'Anonymous'}</p>
      <p>Added: {new Date(item.addedAt?.toDate()).toLocaleDateString()}</p>
    </ItemMetadata>
  </StyledItemCard>
);

const ItemMetadata = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.theme.textSecondary};
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.theme.error};
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${ItemCard}:hover & {
    opacity: 1;
  }
`;

const CollectionItems = ({ collectionId }) => {
  const { data: items, loading, error } = useRealtimeUpdates(
    `collections/${collectionId}/items`,
    [],
    { enabled: !!collectionId }
  );

  if (loading) return <Loading />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <ItemsGrid>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </ItemsGrid>
  );
};

export default CollectionItems;
