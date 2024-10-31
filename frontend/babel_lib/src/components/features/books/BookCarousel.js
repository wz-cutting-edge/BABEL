import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CarouselWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  margin: 2rem 0;
`;

const CarouselTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease;
  transform: translateX(${props => props.offset}px);
`;

const CarouselItem = styled.div`
  flex: 0 0 300px;
  height: 400px;
  padding: 1rem;
  position: relative;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const BookTitle = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
`;

const CarouselButton = styled.button`
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
  
  &:left {
    left: 1rem;
  }
  
  &:right {
    right: 1rem;
  }
`;

const BookCarousel = () => {
  const [books, setBooks] = useState([]);
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksRef = collection(db, 'media');
        const q = query(
          booksRef, 
          where('type', '==', 'book'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const booksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBooks(booksData);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const handlePrevious = () => {
    setOffset(prev => Math.min(prev + 300, 0));
  };

  const handleNext = () => {
    setOffset(prev => Math.max(prev - 300, -(books.length - 1) * 300));
  };

  return (
    <CarouselWrapper>
      <CarouselButton style={{ left: '1rem' }} onClick={handlePrevious}>
        <ChevronLeft size={24} />
      </CarouselButton>
      
      <CarouselTrack offset={offset}>
        {books.map(book => (
          <CarouselItem key={book.id}>
            <img src={book.coverUrl || '/default-book-cover.jpg'} alt={book.title} />
            <BookTitle>{book.title}</BookTitle>
          </CarouselItem>
        ))}
      </CarouselTrack>
      
      <CarouselButton style={{ right: '1rem' }} onClick={handleNext}>
        <ChevronRight size={24} />
      </CarouselButton>
    </CarouselWrapper>
  );
};

export default BookCarousel; 