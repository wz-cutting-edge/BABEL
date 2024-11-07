import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import VerticalCarousel from './VerticalCarousel';
import styled from 'styled-components';

const Layout = styled.div`
  position: relative;
  min-height: calc(100vh - 64px);
`;

const ContentGrid = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 2rem;
  position: relative;
`;

const ScrollableArea = styled.div`
  padding: 2rem 0;
`;

const CarouselContainer = styled.div`
  position: fixed;
  ${props => props.side === 'left' ? 'left: 0' : 'right: 0'};
  top: 0;
  height: 100vh;
  width: 320px;
  background: ${props => props.theme.secondaryBackground};
  transform: translateX(${props => 
    props.isRetracted 
      ? (props.side === 'left' ? '-320px' : '320px') 
      : '0'
  });
  transition: transform 0.3s ease-in-out;
  padding-top: 0.5rem;
  box-shadow: ${props => 
    props.side === 'left' 
      ? '2px 0 10px rgba(0,0,0,0.1)' 
      : '-2px 0 10px rgba(0,0,0,0.1)'
  };
`;

const RetractTab = styled.div`
  position: absolute;
  ${props => props.side === 'left' ? 'right: -20px' : 'left: -20px'};
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  background: ${props => props.theme.secondaryBackground};
  border-radius: ${props => props.side === 'left' ? '0 8px 8px 0' : '8px 0 0 8px'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadowMd};

  &:hover {
    background: ${props => props.theme.primary}20;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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
  const [books, setBooks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leftCarouselRetracted, setLeftCarouselRetracted] = useState(false);
  const [rightCarouselRetracted, setRightCarouselRetracted] = useState(false);

  useEffect(() => {
    if (!userId) {
      setBooks([]);
      setVideos([]);
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
          setBooks(recommendedBooks);
          setVideos(recommendedVideos);
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
      setBooks([]);
      setVideos([]);
    };
  }, [userId]);

  return (
    <Layout>
      <ContentGrid>
        <CarouselContainer isRetracted={leftCarouselRetracted} side="left">
          <RetractTab 
            side="left"
            onClick={() => setLeftCarouselRetracted(!leftCarouselRetracted)}
          >
            {leftCarouselRetracted ? '►' : '◄'}
          </RetractTab>
          <VerticalCarousel items={books} type="book" />
        </CarouselContainer>

        <CarouselContainer isRetracted={rightCarouselRetracted} side="right">
          <RetractTab 
            side="right"
            onClick={() => setRightCarouselRetracted(!rightCarouselRetracted)}
          >
            {rightCarouselRetracted ? '◄' : '►'}
          </RetractTab>
          <VerticalCarousel items={videos} type="video" />
        </CarouselContainer>
      </ContentGrid>
    </Layout>
  );
};

export default RecommendedMedia; 