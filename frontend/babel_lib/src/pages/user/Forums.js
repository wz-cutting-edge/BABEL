import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Loading, ErrorMessage } from '../../components/common/common';

const ForumsWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ForumsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ForumCard = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Forums = () => {
  const { user } = useAuth();
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const forumsRef = collection(db, 'forums');
    const q = query(forumsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const forumsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setForums(forumsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching forums:', err);
        setError('Failed to load forums');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <ForumsWrapper>
      <h2>Forums</h2>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <ForumsList>
          {forums.map(forum => (
            <ForumCard key={forum.id}>
              <h3>{forum.title}</h3>
              <p>{forum.description}</p>
            </ForumCard>
          ))}
        </ForumsList>
      )}
    </ForumsWrapper>
  );
};

export default Forums;
