import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import VerticalCarousel from './VerticalCarousel';
import PostFeed from '../../posts/PostFeed';
import styled from 'styled-components';

const Layout = styled.div`
  position: relative;
  padding-top: 64px;
  min-height: calc(100vh - 64px);
`;

const ContentGrid = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 2rem;
`;

const ScrollableArea = styled.div`
  padding: 2rem 0;
`;

const CarouselContainer = styled.div`
  position: sticky;
  top: 80px;
  height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 1rem 0;

  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;
  scrollbar-width: none;
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
        <CarouselContainer>
          <VerticalCarousel items={books} type="book" />
        </CarouselContainer>
        <ScrollableArea>
          <PostFeed userId={userId} />
        </ScrollableArea>
        <CarouselContainer>
          <VerticalCarousel items={videos} type="video" />
        </CarouselContainer>
      </ContentGrid>
    </Layout>
  );
};

export default RecommendedMedia; 