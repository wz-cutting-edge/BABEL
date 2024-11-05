import React, { useState } from 'react';
import styled from 'styled-components';
import { Book, Video, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CarouselWrapper = styled.div`
  width: 300px;
  height: calc(100vh - 120px);
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  padding: 1rem;
  position: fixed;
  top: 100px;
  display: flex;
  flex-direction: column;
`;

const CarouselContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const MediaList = styled.div`
  transform: translateY(${props => props.offset}px);
  transition: transform 0.3s ease;
`;

const MediaItem = styled.div`
  margin-bottom: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  height: 260px;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const MediaImage = styled.div`
  height: 200px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MediaTitle = styled.div`
  padding: 0.5rem;
  font-weight: 500;
`;

const NavigationButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.5rem 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VerticalCarousel = ({ items, type, style }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const navigate = useNavigate();

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const handleItemClick = (itemId) => {
    navigate(`/media/${itemId}`);
  };

  return (
    <CarouselWrapper style={style}>
      <h2>{type === 'book' ? 'Recommended Books' : 'Recommended Videos'}</h2>
      <NavigationButton 
        onClick={handlePrevious} 
        disabled={currentPage === 0}
      >
        <ChevronUp size={20} />
      </NavigationButton>
      
      <CarouselContent>
        <MediaList offset={-currentPage * (itemsPerPage * 260)}>
          {items.map(item => (
            <MediaItem 
              key={item.id} 
              onClick={() => handleItemClick(item.id)}
            >
              <MediaImage image={item.coverUrl || item.thumbnailUrl || '/default-cover.jpg'}>
                {!item.coverUrl && !item.thumbnailUrl && 
                  (type === 'book' ? <Book size={24} /> : <Video size={24} />)
                }
              </MediaImage>
              <MediaTitle>{item.title}</MediaTitle>
            </MediaItem>
          ))}
        </MediaList>
      </CarouselContent>

      <NavigationButton 
        onClick={handleNext} 
        disabled={currentPage >= totalPages - 1}
      >
        <ChevronDown size={20} />
      </NavigationButton>
    </CarouselWrapper>
  );
};

export default VerticalCarousel; 