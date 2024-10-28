import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import { Button, Loading } from '../../common/common';

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

const AddToCollection = ({ mediaItem, onClose }) => {
  const { user } = useAuth();
  const [selectedCollection, setSelectedCollection] = useState('');
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collectionsRef = collection(db, 'collections');
        const q = query(collectionsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const collectionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    if (user) {
      fetchCollections();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCollection) return;

    setLoading(true);
    try {
      // Update the collection with the new media item
      const collectionRef = doc(db, 'collections', selectedCollection);
      await updateDoc(collectionRef, {
        items: arrayUnion(mediaItem.id),
        updatedAt: serverTimestamp()
      });

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
            <option value="">Select a collection</option>
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </Select>
          <ButtonGroup>
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !selectedCollection}>
              {loading ? 'Adding...' : 'Add to Collection'}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </>
  );
};

export default AddToCollection;
