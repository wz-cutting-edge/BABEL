import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import styled from 'styled-components';
import { ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import MediaItem from './MediaItem';

const CarouselContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.theme.background};
  transform: translateY(${props => props.isRetracted ? 'calc(100% - 24px)' : '0'});
  transition: transform 0.3s ease-in-out;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
  
  @media (max-width: 768px) {
    transform: translateY(${props => props.isRetracted ? 'calc(100% - 20px)' : '0'});
  }
`;

const RetractTab = styled.div`
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 24px;
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);

  svg {
    transition: transform 0.3s ease;
    transform: rotate(${props => props.isRetracted ? '180deg' : '0deg'});
  }
  
  @media (max-width: 768px) {
    width: 48px;
    height: 20px;
    top: -20px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const CarouselContent = styled.div`
  padding: 1rem 3rem;
  height: 280px;
  position: relative;
  background-color: ${props => props.theme.background};
  
  @media (max-width: 768px) {
    height: 220px;
    padding: 0.75rem 2.5rem;
  }
`;

const CarouselTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease;
  transform: translateX(${props => props.offset}px);
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  ${props => props.direction === 'left' ? 'left: 1rem;' : 'right: 1rem;'}
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const MediaItemWrapper = styled.div`
  flex: 0 0 280px;
  padding: 0 0.5rem;
  
  @media (max-width: 768px) {
    flex: 0 0 240px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 0.75rem 1rem;
  color: ${props => props.theme.text};
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
    margin: 0 0 0.5rem 0.75rem;
  }
`;

const getTagFrequency = (favorites) => {
  const tagCount = {};
  const genreCount = {};

  favorites.forEach(fav => {
    (fav.tags || []).forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
    (fav.genres || []).forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  return {
    tags: Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag),
    genres: Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre)
  };
};

const getRecommendedMedia = async (mediaType, frequentTags, frequentGenres) => {
  const mediaRef = collection(db, 'media');
  const recommendedItems = new Set();
  
  // First try with tags
  if (frequentTags.length > 0) {
    const tagQuery = query(
      mediaRef,
      where('type', '==', mediaType),
      where('tags', 'array-contains-any', frequentTags),
      limit(5)
    );
    
    const snapshot = await getDocs(tagQuery);
    snapshot.docs.forEach(doc => {
      if (recommendedItems.size < 5) {
        recommendedItems.add({ id: doc.id, ...doc.data() });
      }
    });
  }

  // If we still need more items, try with genres
  if (recommendedItems.size < 5 && frequentGenres.length > 0) {
    const genreQuery = query(
      mediaRef,
      where('type', '==', mediaType),
      where('genres', 'array-contains-any', frequentGenres),
      limit(5 - recommendedItems.size)
    );
    
    const snapshot = await getDocs(genreQuery);
    snapshot.docs.forEach(doc => {
      const item = { id: doc.id, ...doc.data() };
      if (recommendedItems.size < 5 && ![...recommendedItems].some(i => i.id === item.id)) {
        recommendedItems.add(item);
      }
    });
  }

  // If still no recommendations, get random items of that type
  if (recommendedItems.size < 5) {
    const defaultQuery = query(
      mediaRef,
      where('type', '==', mediaType),
      limit(5 - recommendedItems.size)
    );
    
    const snapshot = await getDocs(defaultQuery);
    snapshot.docs.forEach(doc => {
      const item = { id: doc.id, ...doc.data() };
      if (recommendedItems.size < 5 && ![...recommendedItems].some(i => i.id === item.id)) {
        recommendedItems.add(item);
      }
    });
  }

  return [...recommendedItems];
};

const RecommendedMedia = ({ userId }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRetracted, setIsRetracted] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!userId) {
      setMedia([]);
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    const favoritesRef = collection(db, `users/${userId}/favorites`);
    
    const unsubscribe = onSnapshot(favoritesRef, async (snapshot) => {
      if (!isSubscribed) return;
      
      try {
        setLoading(true);
        const favorites = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const mediaPromises = favorites.map(fav => 
          getDoc(doc(db, 'media', fav.mediaId))
        );
        
        const mediaSnapshots = await Promise.all(mediaPromises);
        const mediaData = mediaSnapshots
          .filter(snap => snap.exists())
          .map(snap => snap.data());

        const { tags: frequentTags, genres: frequentGenres } = getTagFrequency(mediaData);

        const [recommendedBooks, recommendedVideos] = await Promise.all([
          getRecommendedMedia('book', frequentTags, frequentGenres),
          getRecommendedMedia('video', frequentTags, frequentGenres)
        ]);

        if (isSubscribed) {
          setMedia([...recommendedBooks, ...recommendedVideos]);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
      setMedia([]);
    };
  }, [userId]);

  const handlePrevious = () => {
    setOffset(Math.min(offset + 280, 0));
  };

  const handleNext = () => {
    const maxOffset = -(media.length * 280 - window.innerWidth + 100);
    setOffset(Math.max(offset - 280, maxOffset));
  };

  if (loading || media.length === 0) return null;

  return (
    <CarouselContainer isRetracted={isRetracted}>
      <RetractTab 
        onClick={() => setIsRetracted(!isRetracted)}
        isRetracted={isRetracted}
      >
        <ChevronUp size={20} />
      </RetractTab>
      <CarouselContent>
        <SectionTitle>Recommended for you</SectionTitle>
        {offset < 0 && (
          <NavigationButton direction="left" onClick={handlePrevious}>
            <ChevronLeft size={20} />
          </NavigationButton>
        )}
        <CarouselTrack offset={offset}>
          {media.map(item => (
            <MediaItemWrapper key={item.id}>
              <MediaItem 
                id={item.id}
                type={item.type}
                title={item.title}
                author={item.author}
                coverUrl={item.coverUrl || item.thumbnailUrl}
              />
            </MediaItemWrapper>
          ))}
        </CarouselTrack>
        {offset > -(media.length * 280 - window.innerWidth + 100) && (
          <NavigationButton direction="right" onClick={handleNext}>
            <ChevronRight size={20} />
          </NavigationButton>
        )}
      </CarouselContent>
    </CarouselContainer>
  );
};

export default RecommendedMedia; 