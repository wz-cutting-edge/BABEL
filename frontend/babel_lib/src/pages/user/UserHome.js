import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, getDocs, limit, startAfter, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase/config';
import { signOut } from 'firebase/auth';
import { useDataFetching } from '../../hooks/data/useDataFetching';
import { usePerformance } from '../../hooks/ui/usePerformance';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { Loading, ErrorMessage, Button } from '../../components/common/common';

const UserHomeWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem 2rem 2rem; // Added top padding to account for Navigation
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const LogoutButton = styled(Button)`
  background-color: ${props => props.theme.error};
  &:hover {
    opacity: 0.9;
  }
`;

const FeedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Post = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 5px;
`;

const BanNotification = styled.div`
  background-color: ${props => props.theme.error}20;
  color: ${props => props.theme.error};
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.error};
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

const UserHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBanMessage, setShowBanMessage] = useState(true);
  const [userData, setUserData] = useState(null);
  const { data: posts, loading, error, refetch } = useDataFetching(
    ['posts', user?.uid],
    async () => {
      const POSTS_PER_PAGE = 10;
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    { deps: [user] }
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    };
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  usePerformance('UserHome');

  return (
    <ErrorBoundary>
      <UserHomeWrapper>
        {userData?.banned && showBanMessage && (
          <BanNotification>
            <span>
              Your account has been banned 
              {userData.banEndDate === 'permanent' 
                ? ' permanently.' 
                : ` until ${new Date(userData.banEndDate.toDate()).toLocaleDateString()}.`}
            </span>
            <CloseButton onClick={() => setShowBanMessage(false)}>✕</CloseButton>
          </BanNotification>
        )}
        <h3>Recent Activity</h3>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <FeedWrapper>
            {posts?.map(post => (
              <Post key={post.id}>
                <strong>{post.user}</strong>
                <p>{post.content}</p>
              </Post>
            ))}
          </FeedWrapper>
        )}
      </UserHomeWrapper>
    </ErrorBoundary>
  );
};

export default React.memo(UserHome);
