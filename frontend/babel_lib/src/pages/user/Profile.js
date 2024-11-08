import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../services/firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, onSnapshot, deleteDoc, setDoc, serverTimestamp, increment, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Book, Video, Heart, AlertTriangle, Trash2 } from 'lucide-react';
import { Button, Loading, ErrorMessage } from '../../components/common';
import Post from '../../components/posts/Post';

const ProfileWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 4rem 1rem 1rem;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 2.5rem;
  margin-bottom: 2rem;
  padding: 2.5rem;
  background: ${props => props.theme.surfaceColor};
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadowMd};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const AvatarSection = styled.div`
  position: relative;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const Avatar = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid ${props => props.theme.background};
  box-shadow: ${props => props.theme.shadowLg};
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    border-width: 3px;
  }
`;

const AvatarUpload = styled.label`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: ${props => props.theme.primary};
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.shadowMd};
  
  input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    bottom: 4px;
    right: 4px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    bottom: 2px;
    right: 2px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
  
  &:active {
    transform: scale(0.95);
    background: ${props => props.theme.primaryHover};
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FollowButton = styled(Button)`
  align-self: flex-start;
  background: ${props => props.following ? props.theme.secondaryBackground : props.theme.primary};
  color: ${props => props.following ? props.theme.text : 'white'};
  border: 1px solid ${props => props.following ? props.theme.border : 'transparent'};

  &:hover {
    background: ${props => props.following ? props.theme.error : props.theme.primaryHover};
    color: white;
    border-color: transparent;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-top: 1rem;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.background};
  padding: 1.25rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid ${props => props.theme.borderLight};
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 1rem;
    
    h3 {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
    }
    
    p {
      font-size: 0.8rem;
    }
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const TabsContainer = styled.div`
  margin-bottom: 2rem;
  background: ${props => props.theme.surfaceColor};
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadowSm};
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }
`;

const TabList = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid ${props => props.theme.borderLight};
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.25rem;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: ${props => props.active ? props.theme.primary : props.theme.textSecondary};
  border-bottom: 2px solid ${props => props.active ? props.theme.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
`;

const CollectionCard = styled.div`
  background: ${props => props.theme.surfaceColor};
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 1rem;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      font-size: 0.9rem;
    }
    
    &:hover {
      transform: none;
      box-shadow: ${props => props.theme.shadowSm};
    }
  }
`;

const CollectionPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const PreviewThumbnail = styled.div`
  aspect-ratio: 1;
  border-radius: 4px;
  background: ${props => props.image ? `url(${props.image})` : props.theme.backgroundAlt};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${props => props.theme.textSecondary};
    opacity: 0.5;
  }
  
  @media (max-width: 768px) {
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MediaCard = styled.div`
  position: relative;
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
    
    h3 {
      font-size: 0.9rem;
    }
    
    small {
      font-size: 0.75rem;
    }
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${props => props.theme.error}CC;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 1;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    top: 6px;
    right: 6px;
    
    svg {
      width: 18px;
      height: 18px;
    }
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

  @media (max-width: 768px) {
    height: 160px;
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

const BanModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.background};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 90%;
  max-width: 400px;
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

const BanOption = styled(Button)`
  width: 100%;
  margin-bottom: 0.5rem;
  background: ${props => props.theme.error}20;
  color: ${props => props.theme.error};
  
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
    posts: 0,
    followers: 0,
    following: 0
  });
  const [collections, setCollections] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const [showBanModal, setShowBanModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = user?.uid === userId;

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

        // Count followers and following
        const followersQuery = query(collection(db, `users/${userId}/followers`));
        const followingQuery = query(collection(db, `users/${userId}/following`));
        
        const [followersSnapshot, followingSnapshot, postsSnapshot, collectionsSnapshot] = await Promise.all([
          getDocs(followersQuery),
          getDocs(followingQuery),
          getDocs(query(collection(db, 'posts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'collections'), where('userId', '==', userId)))
        ]);

        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const collectionsData = collectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCollections(collectionsData);
        setPosts(postsData);

        setStats({
          collections: collectionsSnapshot.size,
          posts: postsData.length,
          favorites: profileDoc.data().favorites?.length ?? 0,
          followers: followersSnapshot.size,
          following: followingSnapshot.size
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error fetching profile');
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

  useEffect(() => {
    // If user is logged out and this isn't a public profile view, redirect to home
    if (!user && !userId) {
      navigate('/');
    }
  }, [user, userId, navigate]);

  useEffect(() => {
    if (!user || !userId || userId === user.uid) return;
    
    const followRef = doc(db, `users/${user.uid}/following/${userId}`);
    const unsubscribe = onSnapshot(followRef, (doc) => {
      setIsFollowing(doc.exists());
    });
    
    return () => unsubscribe();
  }, [user, userId]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collectionsRef = collection(db, 'collections');
        const q = query(collectionsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const collectionsData = await Promise.all(querySnapshot.docs.map(async doc => {
          const collection = { id: doc.id, ...doc.data() };
          
          if (collection.items && collection.items.length > 0) {
            const mediaPromises = collection.items.map(mediaId => 
              getDoc(doc(db, 'media', mediaId))
            );
            
            const mediaResults = await Promise.all(mediaPromises);
            const mediaItems = mediaResults
              .filter(doc => doc.exists())
              .map(doc => ({ id: doc.id, ...doc.data() }));
              
            collection.mediaItems = mediaItems;
            collection.itemCount = mediaItems.length;
          } else {
            collection.mediaItems = [];
            collection.itemCount = 0;
          }
          
          return collection;
        }));
        
        setCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    if (userId) {
      fetchCollections();
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

  const handleBanUser = async (days) => {
    if (!isAdmin || isOwnProfile) return;
    
    try {
      const banEndDate = days === 'permanent' 
        ? 'permanent'
        : new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      await updateDoc(doc(db, 'users', userId), {
        banned: true,
        banEndDate: banEndDate,
        banStartDate: new Date()
      });

      setShowBanModal(false);
      setError(`User has been banned ${days === 'permanent' ? 'permanently' : `for ${days} days`}`);
    } catch (err) {
      console.error('Error banning user:', err);
      setError('Failed to ban user');
    }
  };

  const handleFollow = async () => {
    if (!user || !userId) return;
    
    try {
      const followRef = doc(db, `users/${user.uid}/following/${userId}`);
      const followedRef = doc(db, `users/${userId}/followers/${user.uid}`);
      const userRef = doc(db, 'users', userId);
      const currentUserRef = doc(db, 'users', user.uid);
      
      if (isFollowing) {
        // Unfollow
        await deleteDoc(followRef);
        await deleteDoc(followedRef);
        
        // Update follower/following counts
        await updateDoc(userRef, {
          followers: Math.max((profile.followers ?? 0) - 1, 0)
        });
        await updateDoc(currentUserRef, {
          following: Math.max((user.following ?? 0) - 1, 0)
        });

        // Update local state
        setProfile(prev => ({
          ...prev,
          followers: Math.max((prev.followers ?? 0) - 1, 0)
        }));
        setStats(prev => ({
          ...prev,
          followers: Math.max((prev.followers ?? 0) - 1, 0)
        }));
      } else {
        // Follow
        await setDoc(followRef, {
          timestamp: serverTimestamp()
        });
        await setDoc(followedRef, {
          timestamp: serverTimestamp()
        });
        
        // Update follower/following counts
        await updateDoc(userRef, {
          followers: Math.max((profile.followers ?? 0) + 1, 0)
        });
        await updateDoc(currentUserRef, {
          following: Math.max((user.following ?? 0) + 1, 0)
        });

        // Update local state
        setProfile(prev => ({
          ...prev,
          followers: Math.max((prev.followers ?? 0) + 1, 0)
        }));
        setStats(prev => ({
          ...prev,
          followers: Math.max((prev.followers ?? 0) + 1, 0)
        }));
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleRemoveFavorite = async (e, favoriteId) => {
    e.stopPropagation();
    
    if (!user || !isOwnProfile) return;

    try {
      const batch = writeBatch(db);
      
      // Remove from user's favorites
      const favoriteRef = doc(db, `users/${user.uid}/favorites/${favoriteId}`);
      batch.delete(favoriteRef);
      
      // Update media's favorite count
      const mediaRef = doc(db, 'media', favoriteId);
      batch.update(mediaRef, {
        favorites: increment(-1)
      });

      await batch.commit();
      
      // Update local state
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
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
            <BanButton onClick={() => setShowBanModal(true)}>
              <AlertTriangle size={16} />
              Ban User
            </BanButton>
          )}
        </AvatarSection>

        <ProfileInfo>
          <h2>{profile.username}</h2>
          <p>{profile.email}</p>
          <p>{profile.bio || 'No bio yet'}</p>

          {user && userId !== user.uid && (
            <FollowButton 
              following={isFollowing}
              onClick={handleFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </FollowButton>
          )}

          <Stats>
            <StatCard>
              <h3>{stats.collections}</h3>
              <p>Collections</p>
            </StatCard>
            <StatCard>
              <h3>{stats.followers || 0}</h3>
              <p>Followers</p>
            </StatCard>
            <StatCard>
              <h3>{stats.following || 0}</h3>
              <p>Following</p>
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
                <CollectionPreview>
                  {collection.mediaItems?.slice(0, 4).map((media) => (
                    <PreviewThumbnail 
                      key={media.id}
                      image={media.coverUrl}
                    >
                      {!media.coverUrl && (
                        <Book size={24} />
                      )}
                    </PreviewThumbnail>
                  ))}
                </CollectionPreview>
              </CollectionCard>
            ))}
          </CollectionsGrid>
        )}

        {activeTab === 'posts' && (
          <PostsContainer>
            {posts.map(post => (
              <Post 
                key={post.id} 
                post={post} 
                authorData={profile}
              />
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
                {user && userId === user.uid && (
                  <RemoveButton onClick={(e) => handleRemoveFavorite(e, favorite.id)}>
                    <Trash2 size={16} />
                  </RemoveButton>
                )}
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

      {showBanModal && (
        <>
          <Overlay onClick={() => setShowBanModal(false)} />
          <BanModal>
            <h3>Select Ban Duration</h3>
            <BanOption onClick={() => handleBanUser(3)}>3 Days</BanOption>
            <BanOption onClick={() => handleBanUser(7)}>7 Days</BanOption>
            <BanOption onClick={() => handleBanUser(14)}>14 Days</BanOption>
            <BanOption onClick={() => handleBanUser(28)}>28 Days</BanOption>
            <BanOption onClick={() => handleBanUser('permanent')}>Permanent Ban</BanOption>
            <Button onClick={() => setShowBanModal(false)}>Cancel</Button>
          </BanModal>
        </>
      )}
    </ProfileWrapper>
  );
};

export default Profile;
