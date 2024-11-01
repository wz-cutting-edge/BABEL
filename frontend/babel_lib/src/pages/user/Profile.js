import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../services/firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Book, Video, Heart } from 'lucide-react';
import { Button, Loading, ErrorMessage } from '../../components/common';
import Post from '../../components/posts/Post';

const ProfileWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const AvatarSection = styled.div`
  position: relative;
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarUpload = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: ${props => props.theme.primary};
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.primaryHover};
  }

  input {
    display: none;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.background};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;

  h3 {
    font-size: 1.5rem;
    color: ${props => props.theme.primary};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${props => props.theme.textSecondary};
    font-size: 0.875rem;
  }
`;

const TabsContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: ${props => props.active ? props.theme.primary : props.theme.textSecondary};
  border-bottom: 2px solid ${props => props.active ? props.theme.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${props => props.theme.primary};
  }
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const CollectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const CollectionCard = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  h3 {
    margin-bottom: 0.5rem;
  }

  p {
    color: ${props => props.theme.textSecondary};
    font-size: 0.875rem;
  }
`;

const Profile = () => {
  const { userId } = useParams(); // Get userId from URL
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('collections');
  const [stats, setStats] = useState({
    collections: 0,
    favorites: 0,
    posts: 0
  });
  const [collections, setCollections] = useState([]);
  const navigate = useNavigate();

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user profile
        const profileDoc = await getDoc(doc(db, 'users', userId));
        if (!profileDoc.exists()) {
          setError('User not found');
          return;
        }
        setProfile(profileDoc.data());

        // Fetch user's posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsData);

        // Fetch collections count
        const collectionsQuery = query(
          collection(db, 'collections'),
          where('userId', '==', userId)
        );
        const collectionsSnapshot = await getDocs(collectionsQuery);
        const collectionsData = collectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCollections(collectionsData);

        setStats({
          collections: collectionsSnapshot.size,
          posts: postsData.length,
          favorites: profileDoc.data().favorites?.length || 0
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleAvatarChange = async (e) => {
    if (!isOwnProfile) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const storageRef = ref(storage, `avatars/${userId}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', userId), {
        photoURL: downloadURL
      });

      setProfile(prev => ({
        ...prev,
        photoURL: downloadURL
      }));
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError('Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!profile) return null;

  return (
    <ProfileWrapper>
      <ProfileHeader>
        <AvatarSection>
          <Avatar src={profile.photoURL || '/default-avatar.png'} />
          {isOwnProfile && (
            <AvatarUpload>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <Camera size={20} />
            </AvatarUpload>
          )}
        </AvatarSection>

        <ProfileInfo>
          <h2>{profile.displayName}</h2>
          <p>{profile.email}</p>
          <p>{profile.bio || 'No bio yet'}</p>

          <Stats>
            <StatCard>
              <h3>{stats.collections}</h3>
              <p>Collections</p>
            </StatCard>
            <StatCard>
              <h3>{stats.posts}</h3>
              <p>Posts</p>
            </StatCard>
            <StatCard>
              <h3>{stats.favorites}</h3>
              <p>Favorites</p>
            </StatCard>
          </Stats>
        </ProfileInfo>
      </ProfileHeader>

      <TabsContainer>
        <TabList>
          <Tab
            active={activeTab === 'collections'}
            onClick={() => setActiveTab('collections')}
          >
            <Book size={20} />
            Collections
          </Tab>
          <Tab
            active={activeTab === 'posts'}
            onClick={() => setActiveTab('posts')}
          >
            <Video size={20} />
            Posts
          </Tab>
          <Tab
            active={activeTab === 'favorites'}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart size={20} />
            Favorites
          </Tab>
        </TabList>

        {activeTab === 'collections' && (
          <CollectionsGrid>
            {collections.map(collection => (
              <CollectionCard
                key={collection.id}
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <h3>{collection.name}</h3>
                <p>{collection.items?.length || 0} items</p>
              </CollectionCard>
            ))}
          </CollectionsGrid>
        )}

        {activeTab === 'posts' && (
          <PostsContainer>
            {posts.map(post => (
              <Post key={post.id} post={post} />
            ))}
            {posts.length === 0 && <p>No posts yet</p>}
          </PostsContainer>
        )}

        {activeTab === 'favorites' && (
          <PostsContainer>
            <p>No favorites yet</p>
          </PostsContainer>
        )}
      </TabsContainer>
    </ProfileWrapper>
  );
};

export default Profile;
