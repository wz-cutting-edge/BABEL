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
  padding: 4rem 1rem 1rem;
  max-width: 800px;
  margin: 0 auto;
  overflow-x: hidden;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 3rem 0 0.5rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
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
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.875rem;
    margin: 0 0.5rem 1rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 400px;
  width: 100%;
  margin: 1rem auto;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: ${props => props.theme.background};
    padding: 0.75rem;
    margin: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    
    > * {
      width: 100%;
      max-width: 400px;
    }
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 1.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1002;
  pointer-events: none;
  
  @media (max-width: 768px) {
    right: calc(50% - 180px);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  background: ${props => props.theme.surfaceColor};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  -webkit-appearance: none;
  margin: 0 auto;
  position: relative;
  z-index: 1001;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primaryAlpha};
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }

  @media (max-width: 768px) {
    max-width: 400px;
    font-size: 16px;
    padding: 0.625rem 2.5rem 0.625rem 1rem;
    border-radius: 20px;
    background: ${props => props.theme.backgroundAlt};
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    touch-action: manipulation;
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.surfaceColor};
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  margin-top: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1003;
  box-shadow: ${props => props.theme.shadowMd};

  @media (max-width: 768px) {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    max-height: 75vh;
    border-radius: 16px 16px 0 0;
    border-bottom: none;
    box-shadow: ${props => props.theme.shadowLg};
  }
`;

const UserResult = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid ${props => props.theme.borderLight};

  &:hover {
    background: ${props => props.theme.backgroundAlt};
  }

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .username {
    font-weight: 500;
    color: ${props => props.theme.text};
  }

  .email {
    font-size: 0.875rem;
    color: ${props => props.theme.textSecondary};
  }

  @media (max-width: 768px) {
    padding: 1rem;
    
    img {
      width: 48px;
      height: 48px;
    }
    
    .username {
      font-size: 1rem;
    }
    
    .email {
      font-size: 0.875rem;
    }
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
        try {
          const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            userId: doc.data().userId || doc.data().authorId
          }));
          
          const validPosts = postsData.filter(post => post.userId);
          const userIds = [...new Set(validPosts.map(post => post.userId))];
          
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
          setPosts(validPosts);
        } catch (err) {
          console.error('Error processing posts:', err);
          setError('Failed to load posts');
        } finally {
          setLoading(false);
        }
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

  console.log('Admin status:', isAdmin);

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
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt={user.username} 
                />
                <div className="user-info">
                  <span className="username">{user.username}</span>
                  {user.email && <span className="email">{user.email}</span>}
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
