import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../services/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Edit2, Book, Video, Heart } from 'lucide-react';
import { Button, Loading, ErrorMessage } from '../../components/common';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

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

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  background-color: ${props => props.theme.background};
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

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('collections');
  const [stats, setStats] = useState({
    collections: 0,
    favorites: 0,
    contributions: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }

        // Fetch user stats
        // This would typically involve multiple queries to count collections, favorites, etc.
        // For now, using placeholder data
        setStats({
          collections: 5,
          favorites: 12,
          contributions: 3
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', user.uid), {
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
          <AvatarUpload>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <Camera size={20} />
          </AvatarUpload>
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
              <h3>{stats.favorites}</h3>
              <p>Favorites</p>
            </StatCard>
            <StatCard>
              <h3>{stats.contributions}</h3>
              <p>Contributions</p>
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
            active={activeTab === 'favorites'}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart size={20} />
            Favorites
          </Tab>
          <Tab
            active={activeTab === 'contributions'}
            onClick={() => setActiveTab('contributions')}
          >
            <Video size={20} />
            Contributions
          </Tab>
        </TabList>

        {/* Tab content would go here */}
        {/* This would typically be implemented as separate components */}
        {/* for collections, favorites, and contributions lists */}
      </TabsContainer>
    </ProfileWrapper>
  );
};

export default Profile;
