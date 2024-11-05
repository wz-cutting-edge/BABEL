import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const BookCarousel = ({ books = [], type = 'book' }) => {
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();

  if (!Array.isArray(books)) {
    console.warn('BookCarousel: books prop is not an array');
    return null;
  }

  if (books.length === 0) {
    return (
      <CarouselWrapper>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          No {type}s available
        </div>
      </CarouselWrapper>
    );
  }

  const handlePrevious = () => {
    setOffset(Math.min(offset + 300, 0));
  };

  const handleNext = () => {
    const maxOffset = -(books.length * 300 - 300);
    setOffset(Math.max(offset - 300, maxOffset));
  };

  return (
    <CarouselWrapper>
      {offset < 0 && (
        <CarouselButton style={{ left: '1rem' }} onClick={handlePrevious}>
          <ChevronLeft />
        </CarouselButton>
      )}
      <CarouselTrack offset={offset}>
        {books.map(book => (
          <CarouselItem 
            key={book.id}
            onClick={() => navigate(`/media/${book.id}`)}
          >
            <img src={book.coverUrl || '/placeholder.jpg'} alt={book.title} />
            <BookTitle>{book.title}</BookTitle>
          </CarouselItem>
        ))}
      </CarouselTrack>
      {offset > -(books.length * 300 - 300) && (
        <CarouselButton style={{ right: '1rem' }} onClick={handleNext}>
          <ChevronRight />
        </CarouselButton>
      )}
    </CarouselWrapper>
  );
};

export default BookCarousel; 