import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where, getDocs, limit, startAfter, getDoc } from 'firebase/firestore';
import { Loading, ErrorMessage } from '../../components/common/common';
import CreatePost from '../../components/posts/CreatePost';
import Post from '../../components/posts/Post';
import { AlertTriangle, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForumsWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const AdminBanner = styled.div`
  background-color: ${props => props.theme.warning}20;
  color: ${props => props.theme.warning};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchContainer = styled.div`
  margin: 1rem 0;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.textSecondary};
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  margin-top: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
`;

const UserResult = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.hover};
  }

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const Forums = () => {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [usersData, setUsersData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const userIds = [...new Set(postsData.map(post => post.userId))];
        
        const usersSnapshot = await Promise.all(
          userIds.map(userId => getDoc(doc(db, 'users', userId)))
        );
        
        const userData = {};
        usersSnapshot.forEach(doc => {
          if (doc.exists()) {
            userData[doc.id] = doc.data();
          }
        });
        
        setUsersData(userData);
        setPosts(postsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDeletePost = async (postId) => {
    if (!isAdmin) return;
    
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  };

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('username', '>=', value),
        where('username', '<=', value + '\uf8ff'),
        limit(5)
      );
      
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length >= 2) {
      handleSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <ForumsWrapper>
      <h2>Community Forum</h2>
      
      {isAdmin && (
        <AdminBanner>
          <AlertTriangle size={20} />
          Admin Mode: You can delete any post by clicking the delete button
        </AdminBanner>
      )}
      
      <SearchContainer>
        <SearchIcon>
          <Search size={20} />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchResults.length > 0 && (
          <SearchResults>
            {searchResults.map(user => (
              <UserResult key={user.id} onClick={() => handleUserClick(user.id)}>
                <img src={user.photoURL || '/default-avatar.png'} alt={user.username} />
                <div>
                  <strong>{user.username}</strong>
                  {user.email && <div>{user.email}</div>}
                </div>
              </UserResult>
            ))}
          </SearchResults>
        )}
      </SearchContainer>
      
      {user && <CreatePost />}
      
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <PostsList>
          {posts.map(post => (
            <Post 
              key={post.id} 
              post={post} 
              userData={usersData[post.userId]}
              isAdmin={isAdmin}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))}
        </PostsList>
      )}
    </ForumsWrapper>
  );
};

export default Forums;
