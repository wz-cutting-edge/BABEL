//media viewer
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { db, storage } from '../../services/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { Loading, ErrorMessage, Button } from '../../components/common';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useAuth } from '../../contexts/AuthContext';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const ViewerWrapper = styled.div`
  padding: 4rem 0 0;
  min-height: 100vh;
  background: ${props => props.theme.background};
  position: relative;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PDFWrapper = styled.div`
  width: 100%;
  max-width: ${props => props.doublePage ? '1120px' : '840px'};
  margin: 0 auto;
  display: flex;
  justify-content: center;
  
  .react-pdf__Document {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .react-pdf__Page {
    max-width: 100%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    
    canvas {
      max-width: 100%;
      height: auto !important;
    }
  }
  
  @media (max-width: 768px) {
    padding: 0;
    max-width: 100%;
    overflow: visible;
  }
`;

const Controls = styled.div`
  position: fixed;
  bottom: ${props => props.isRetracted ? '-60px' : '2rem'};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  background: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 1000;
  transition: bottom 0.3s ease-in-out;
  
  @media (max-width: 768px) {
    width: 90%;
    padding: 0.75rem;
    gap: 0.5rem;
    flex-wrap: wrap;
    background: ${props => props.theme.background};
    border: 1px solid ${props => props.theme.border};
  }
`;

const MobileControlGroup = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    width: 100%;
    justify-content: space-between;
    gap: 0.5rem;
  }
`;

const TabIndicator = styled.div`
  position: absolute;
  top: ${props => props.isRetracted ? '36px' : '-24px'};
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 24px;
  background: ${props => props.theme.secondaryBackground};
  border-radius: ${props => props.isRetracted ? '0 0 8px 8px' : '8px 8px 0 0'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.isRetracted ? '0 2px 10px rgba(0,0,0,0.1)' : '0 -2px 10px rgba(0,0,0,0.1)'};
  
  &::after {
    content: '';
    width: 30px;
    height: 4px;
    background: ${props => props.theme.border};
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    width: 48px;
    height: 20px;
  }
`;

const VideoPlayer = styled.video`
  max-width: 100%;
  max-height: calc(100vh - 2rem);
  width: 95%;
  height: auto;
  display: block;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    max-height: unset;
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }
`;

const PageInfo = styled.span`
  min-width: 100px;
  text-align: center;
  color: ${props => props.theme.text};
`;

const StyledButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: ${props => props.theme.primary}20;
  color: ${props => props.theme.primary};
  border: 1px solid ${props => props.theme.primary};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 100px;

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    min-width: unset;
    flex: 1;
    font-size: 0.875rem;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${props => props.theme.border};
`;

const FavoriteButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.isFavorited ? props.theme.error : props.theme.primary};
  
  &:hover {
    opacity: 0.9;
  }
`;

const ViewerLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1500px;
  margin: 0 auto;
  padding: 6rem 2rem 2rem;
  height: 100vh;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
    height: auto;
    overflow: visible;
  }
`;

const MediaPanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background: none;
  padding: 0;
  
  @media (max-width: 768px) {
    padding: 0;
    overflow: visible;
  }
`;

const InfoPanel = styled.div`
  padding: 1rem;
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  
  @media (max-width: 768px) {
    margin-bottom: 5rem;
  }
`;

const MediaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const InfoMeta = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
`;

const InfoDescription = styled.p`
  margin: 1rem 0;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    
    > button {
      flex: 1;
      min-width: 150px;
    }
  }
`;

const MediaViewer = () => {
  // Existing state and hooks
  const { mediaId } = useParams();
  const { user } = useAuth();
  const [media, setMedia] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doublePage, setDoublePage] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isControlsRetracted, setIsControlsRetracted] = useState(false);
  const [infoRetracted, setInfoRetracted] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const mediaDoc = await getDoc(doc(db, 'media', mediaId));
        if (!mediaDoc.exists()) {
          setError('Media not found');
          return;
        }
        const mediaData = { id: mediaDoc.id, ...mediaDoc.data() };
        setMedia(mediaData);

        // Get the download URL using the storagePath from Firestore
        if (mediaData.storagePath) {
          const mediaRef = ref(storage, mediaData.storagePath);
          const url = await getDownloadURL(mediaRef);
          setMediaUrl(url);
        } else {
          throw new Error('Media storage path not found');
        }
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Failed to load media');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [mediaId]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (user && media) {
        const favoriteRef = doc(db, `users/${user.uid}/favorites/${media.id}`);
        const favoriteDoc = await getDoc(favoriteRef);
        setIsFavorited(favoriteDoc.exists());
      }
    };
    checkFavorite();
  }, [user, media]);

  const loadBookmark = async () => {
    if (user && media?.type === 'book') {
      try {
        const bookmarkRef = doc(db, `users/${user.uid}/bookmarks/${media.id}`);
        const bookmarkDoc = await getDoc(bookmarkRef);
        if (bookmarkDoc.exists()) {
          const bookmarkData = bookmarkDoc.data();
          setPageNumber(bookmarkData.page);
        }
      } catch (error) {
        console.error('Error loading bookmark:', error);
      }
    }
  };

  const saveBookmark = async (page) => {
    if (user && media?.type === 'book') {
      try {
        const bookmarkRef = doc(db, `users/${user.uid}/bookmarks/${media.id}`);
        const bookmarkDoc = await getDoc(bookmarkRef);
        
        // Only update if current page is higher than bookmarked page
        if (!bookmarkDoc.exists() || page > bookmarkDoc.data().page) {
          await setDoc(bookmarkRef, {
            page,
            mediaId: media.id,
            title: media.title,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Error saving bookmark:', error);
      }
    }
  };

  const isMobile = window.innerWidth <= 768;

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > numPages) return;

    if (isMobile && doublePage) {
      setDoublePage(false);
    }

    if (doublePage && !isMobile) {
      if (newPage >= numPages) {
        newPage = numPages - 1;
      }
      if (newPage > 1) {
        newPage = newPage % 2 === 0 ? newPage - 1 : newPage;
      }
    }

    setPageNumber(newPage);
    await saveBookmark(newPage);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleFavorite = async () => {
    if (!user || !media) return;
    try {
      const favoriteRef = doc(db, `users/${user.uid}/favorites/${media.id}`);
      const favoriteDoc = await getDoc(favoriteRef);
      
      if (favoriteDoc.exists()) {
        // Remove from favorites
        await deleteDoc(favoriteRef);
        setIsFavorited(false);
      } else {
        // Add to favorites
        await setDoc(favoriteRef, {
          mediaId: media.id,
          title: media.title,
          type: media.type,
          thumbnail: media.coverUrl || null,
          addedAt: serverTimestamp()
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleControls = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsControlsRetracted(!isControlsRetracted);
  };

  const renderControls = () => (
    <Controls isRetracted={isControlsRetracted}>
      <TabIndicator 
        onClick={() => setIsControlsRetracted(!isControlsRetracted)}
      />
      <StyledButton 
        onClick={() => handlePageChange(pageNumber - 1)}
        disabled={pageNumber <= 1}
      >
        Prev
      </StyledButton>
      <PageInfo>
        {pageNumber}/{numPages}
      </PageInfo>
      <StyledButton 
        onClick={() => handlePageChange(pageNumber + (doublePage && !isMobile ? 2 : 1))}
        disabled={doublePage ? pageNumber >= (numPages - 1) : pageNumber >= numPages}
      >
        Next
      </StyledButton>
      {!isMobile && (
        <>
          <Divider />
          <StyledButton onClick={() => setDoublePage(!doublePage)}>
            {doublePage ? '1 Page' : '2 Page'}
          </StyledButton>
        </>
      )}
      <StyledButton onClick={() => setZoom(zoom + 0.2)}>
        +
      </StyledButton>
      <StyledButton onClick={() => setZoom(Math.max(0.6, zoom - 0.2))}>
        -
      </StyledButton>
    </Controls>
  );

  useEffect(() => {
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const touchEndY = e.touches[0].clientY;
      const diff = touchEndY - touchStartY;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          setIsControlsRetracted(true);
          setInfoRetracted(true);
        } else {
          setIsControlsRetracted(false);
          setInfoRetracted(false);
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!media) return null;

  return (
    <ViewerLayout>
      <MediaPanel isVideo={media?.type === 'video'}>
        {media?.type === 'video' ? (
          <>
            <VideoPlayer controls src={mediaUrl} />
            <Controls 
              isRetracted={isControlsRetracted} 
              onClick={toggleControls}
              onMouseEnter={() => setIsControlsRetracted(false)}
            >
              <TabIndicator 
                onClick={toggleControls}
                isRetracted={isControlsRetracted}
              />
              <FavoriteButton isFavorited={isFavorited} onClick={handleFavorite}>
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </FavoriteButton>
            </Controls>
          </>
        ) : (
          <>
            <PDFWrapper doublePage={doublePage}>
              <Document file={mediaUrl} onLoadSuccess={onDocumentLoadSuccess}>
                {doublePage ? (
                  <div style={{ 
                    display: 'flex', 
                    gap: '24px',
                    justifyContent: 'center',
                    maxWidth: '100%'
                  }}>
                    <Page 
                      pageNumber={pageNumber} 
                      scale={zoom}
                      width={window.innerWidth > 768 ? undefined : window.innerWidth - 32}
                    />
                    {pageNumber + 1 <= numPages && (
                      <Page 
                        pageNumber={pageNumber + 1} 
                        scale={zoom}
                        width={window.innerWidth > 768 ? undefined : window.innerWidth - 32}
                      />
                    )}
                  </div>
                ) : (
                  <Page 
                    pageNumber={pageNumber} 
                    scale={zoom}
                    width={window.innerWidth > 768 ? undefined : window.innerWidth - 32}
                  />
                )}
              </Document>
            </PDFWrapper>
            {renderControls()}
          </>
        )}
      </MediaPanel>

      <InfoPanel>
        <MediaInfo>
          <InfoTitle>{media.title}</InfoTitle>
          <InfoMeta>
            {media.author && <div>Author: {media.author}</div>}
            <div>Type: {media.type}</div>
            {media.year && <div>Year: {media.year}</div>}
          </InfoMeta>
          {media.description && (
            <InfoDescription>{media.description}</InfoDescription>
          )}
          <ButtonGroup>
            <FavoriteButton isFavorited={isFavorited} onClick={handleFavorite}>
              {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
            </FavoriteButton>
            <StyledButton onClick={loadBookmark}>
              Load Bookmark
            </StyledButton>
          </ButtonGroup>
        </MediaInfo>
      </InfoPanel>
    </ViewerLayout>
  );
};

export default MediaViewer; 