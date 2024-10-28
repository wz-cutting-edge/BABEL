import React, { useState } from 'react';
import styled from 'styled-components';
import { collection, addDoc, serverTimestamp, doc, writeBatch, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './common';

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.background};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.accent};
  border-radius: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const AddToCollection = ({ mediaItem, onClose, collections }) => {
  const { user } = useAuth();
  const [selectedCollection, setSelectedCollection] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCollection) return;

    setLoading(true);
    try {
      // Create a batch write to update both the item and the collection
      const batch = writeBatch(db);
      
      // Add the item to the collection
      const itemRef = doc(collection(db, 'collections', selectedCollection, 'items'));
      batch.set(itemRef, {
        mediaId: mediaItem.id,
        userId: user.uid,
        addedAt: serverTimestamp(),
        type: mediaItem.type,
        title: mediaItem.title,
        fileUrl: mediaItem.fileUrl,
        addedBy: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonymous'
        }
      });

      // Update the collection metadata
      const collectionRef = doc(db, 'collections', selectedCollection);
      batch.update(collectionRef, {
        itemCount: increment(1),
        lastUpdated: serverTimestamp()
      });

      await batch.commit();
      onClose();
    } catch (error) {
      console.error('Error adding to collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <Modal>
        <h3>Add to Collection</h3>
        <Form onSubmit={handleSubmit}>
          <Select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            required
          >
            <option value="">Select a collection...</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </Select>
          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add to Collection'}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </>
  );
};

export default AddToCollection;
