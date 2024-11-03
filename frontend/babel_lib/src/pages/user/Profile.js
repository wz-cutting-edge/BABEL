import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../services/firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Book, Video, Heart, AlertTriangle } from 'lucide-react';
import { Button, Loading, ErrorMessage } from '../../components/common';
import Post from '../../components/posts/Post';

const ProfileWrapper = styled.div`
  padding: 6rem 2rem 2rem;
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

  h2 {
    margin-bottom: 0.5rem;
    font-size: 1.75rem;
  }

  .email {
    color: ${props => props.theme.textSecondary};
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .bio {
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
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

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const MediaCard = styled.div`
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

const MediaThumbnail = styled.div`
  width: 100%;
  height: 200px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  overflow: hidden;
  position: relative;

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 2rem;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;

  &:hover {
    background: ${props => props.theme.hover};
  }
`;

const BanButton = styled(ActionButton)`
  margin-top: 1rem;
  width: 100%;
  justify-content: center;
  color: ${props => props.theme.error};
  background: ${props => props.theme.error}20;
  padding: 0.5rem 1rem;
  
  &:hover {
    background: ${props => props.theme.error}40;
  }
`;

const Profile = () => {
  const { userId } = useParams(); // Get userId from URL
  const { user, isAdmin } = useAuth();
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
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  const isOwnProfile = user?.uid === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user profile
        const profileDoc = await getDoc(doc(db, 'users', userId));
        console.log('Profile Data:', {
          exists: profileDoc.exists(),
          data: profileDoc.data(),
          userId: userId
        });
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

  useEffect(() => {
    if (!userId) return;
    
    const favoritesRef = collection(db, `users/${userId}/favorites`);
    const q = query(favoritesRef, orderBy('addedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favoritesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFavorites(favoritesData);
    });
    
    return () => unsubscribe();
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
          {isAdmin && !isOwnProfile && (
            <BanButton>
              <AlertTriangle size={16} />
              Ban User
            </BanButton>
          )}
        </AvatarSection>

        <ProfileInfo>
          <h2>{profile.username}</h2>
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
          <MediaGrid>
            {favorites.map(favorite => (
              <MediaCard 
                key={favorite.id}
                onClick={() => navigate(`/media/${favorite.id}`)}
              >
                <MediaThumbnail image={favorite.thumbnail}>
                  {favorite.type === 'book' ? <Book size={24} /> : <Video size={24} />}
                </MediaThumbnail>
                <div style={{ padding: '1rem' }}>
                  <h3>{favorite.title}</h3>
                  <small>{favorite.type}</small>
                </div>
              </MediaCard>
            ))}
            {favorites.length === 0 && <p>No favorites yet</p>}
          </MediaGrid>
        )}
      </TabsContainer>
    </ProfileWrapper>
  );
};

export default Profile;
