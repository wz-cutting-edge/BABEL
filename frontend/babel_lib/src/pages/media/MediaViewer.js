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
  overflow-y: auto;
  min-height: 100vh;
  padding: 2rem;
  
  .react-pdf__Document {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 24px;
  }

  .react-pdf__Page {
    margin-bottom: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    background: ${props => props.theme.mode === 'dark' ? '#2f2f2f' : 'white'};
  }
`;

const Controls = styled.div`
  position: fixed;
  bottom: ${props => props.isRetracted ? '-80px' : '2rem'};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  background: ${props => props.theme.secondaryBackground};
  padding: 1rem 3rem 1rem 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: auto;
  min-width: 500px;
  transition: bottom 0.3s ease-in-out;
`;

const TabIndicator = styled.div`
  position: absolute;
  top: ${props => props.isRetracted ? '-15px' : '-35px'};
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 4px;
  background: ${props => props.theme.border};
  border-radius: 2px;
  cursor: pointer;
`;

const VideoPlayer = styled.video`
  max-width: 100%;
  max-height: calc(100vh - 2rem);
  width: 95%;
  height: auto;
  display: block;
  margin: 0 auto;
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

  &:hover {
    background: ${props => props.theme.primary};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
`;

const MediaPanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: ${props => props.isVideo ? 'flex-start' : 'center'};
  overflow: hidden;
  background: ${props => props.theme.background};
  border-radius: 8px;
  padding: 2rem;
  padding-top: ${props => props.isVideo ? '2rem' : '8rem'};
`;

const InfoPanel = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 2rem;
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

const RetractButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
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

  const handlePageChange = async (newPage) => {
    // Check if the new page is within valid range
    if (newPage < 1 || newPage > numPages) return;

    // For double page mode, ensure we don't exceed the last valid page pair
    if (doublePage) {
      if (newPage >= numPages) {
        newPage = numPages - 1;
      }
      // Ensure we land on odd-numbered pages in double page mode
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
              <RetractButton
                onClick={(e) => {
                  e.stopPropagation();
                  setIsControlsRetracted(true);
                }}
              >
                ▼
              </RetractButton>
            </Controls>
          </>
        ) : (
          <>
            <PDFWrapper doublePage={doublePage}>
              <Document file={mediaUrl} onLoadSuccess={onDocumentLoadSuccess}>
                {doublePage ? (
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <Page pageNumber={pageNumber} scale={zoom} />
                    {pageNumber + 1 <= numPages && (
                      <Page pageNumber={pageNumber + 1} scale={zoom} />
                    )}
                  </div>
                ) : (
                  <Page pageNumber={pageNumber} scale={zoom} />
                )}
              </Document>
            </PDFWrapper>
            <Controls isRetracted={isControlsRetracted}>
              <TabIndicator 
                isRetracted={isControlsRetracted}
                onClick={() => setIsControlsRetracted(false)}
              />
              <StyledButton 
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber <= 1}
              >
                Previous
              </StyledButton>
              <PageInfo>
                Page {pageNumber} of {numPages}
              </PageInfo>
              <StyledButton 
                onClick={() => handlePageChange(pageNumber + (doublePage ? 2 : 1))}
                disabled={doublePage ? pageNumber >= (numPages - 1) : pageNumber >= numPages}
              >
                Next
              </StyledButton>
              <Divider />
              <StyledButton onClick={() => setZoom(zoom + 0.2)} title="Zoom In">
                Zoom In
              </StyledButton>
              <StyledButton onClick={() => setZoom(Math.max(0.6, zoom - 0.2))} title="Zoom Out">
                Zoom Out
              </StyledButton>
              <Divider />
              <StyledButton onClick={() => setDoublePage(!doublePage)}>
                {doublePage ? 'Single Page' : 'Double Page'}
              </StyledButton>
              <StyledButton onClick={loadBookmark}>
                Load Bookmark
              </StyledButton>
              <RetractButton
                onClick={(e) => {
                  e.stopPropagation();
                  setIsControlsRetracted(true);
                }}
              >
                ▼
              </RetractButton>
            </Controls>
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
          <FavoriteButton isFavorited={isFavorited} onClick={handleFavorite}>
            {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
          </FavoriteButton>
        </MediaInfo>
      </InfoPanel>
    </ViewerLayout>
  );
};

export default MediaViewer; 