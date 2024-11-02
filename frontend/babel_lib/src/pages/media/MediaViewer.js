//media viewer
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { db, storage } from '../../services/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { Loading, ErrorMessage } from '../../components/common';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useAuth } from '../../contexts/AuthContext';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const ViewerWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ContentWrapper = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 2rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PDFWrapper = styled.div`
  width: 100%;
  max-width: ${props => props.doublePage ? '1600px' : '1200px'};
  margin: 0 auto;
  overflow-y: auto;
  height: calc(100vh - 300px);
  
  .react-pdf__Document {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 24px;
  }

  .react-pdf__Page {
    margin-bottom: 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const ViewControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  justify-content: center;
  width: 100%;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VideoPlayer = styled.video`
  max-width: 100%;
  max-height: 80vh;
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
        await setDoc(bookmarkRef, {
          page,
          mediaId: media.id,
          title: media.title,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving bookmark:', error);
      }
    }
  };

  const handlePageChange = async (newPage) => {
    // Ensure we land on odd-numbered pages when in double page mode
    if (doublePage && newPage > 1) {
      newPage = newPage % 2 === 0 ? newPage - 1 : newPage;
    }
    setPageNumber(newPage);
    await saveBookmark(newPage);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!media) return null;

  return (
    <ViewerWrapper>
      <h2>{media?.title}</h2>
      <ContentWrapper>
        {media?.type === 'book' ? (
          <>
            <ViewControls>
              <Button onClick={() => setDoublePage(!doublePage)}>
                {doublePage ? 'Single Page' : 'Double Page'}
              </Button>
              <Button onClick={loadBookmark}>Go to Bookmark</Button>
              <Button onClick={() => setZoom(zoom + 0.1)}>Zoom In</Button>
              <Button onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 0.5}>Zoom Out</Button>
            </ViewControls>
            <PDFWrapper doublePage={doublePage}>
              <Document
                file={mediaUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<Loading />}
                error={<ErrorMessage>Failed to load PDF</ErrorMessage>}
              >
                {doublePage ? (
                  <div style={{ display: 'flex', gap: '24px' }}>
                    {pageNumber % 2 === 0 ? (
                      <>
                        <Page 
                          pageNumber={pageNumber - 1}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          scale={zoom}
                          width={500}
                        />
                        <Page 
                          pageNumber={pageNumber}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          scale={zoom}
                          width={500}
                        />
                      </>
                    ) : (
                      <>
                        <Page 
                          pageNumber={pageNumber}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          scale={zoom}
                          width={500}
                        />
                        {pageNumber < numPages && (
                          <Page 
                            pageNumber={pageNumber + 1}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            scale={zoom}
                            width={500}
                          />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <Page 
                    pageNumber={pageNumber}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    scale={zoom}
                    width={800}
                  />
                )}
              </Document>
            </PDFWrapper>
            <Controls>
              <Button 
                onClick={() => handlePageChange(Math.max(1, pageNumber - (doublePage ? 2 : 1)))}
                disabled={pageNumber <= 1}
              >
                Previous
              </Button>
              <span>
                Page {pageNumber}{doublePage && pageNumber < numPages && `-${pageNumber + 1}`} of {numPages}
              </span>
              <Button 
                onClick={() => handlePageChange(Math.min(numPages, pageNumber + (doublePage ? 2 : 1)))}
                disabled={pageNumber >= numPages}
              >
                Next
              </Button>
            </Controls>
          </>
        ) : (
          <VideoPlayer controls>
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </VideoPlayer>
        )}
      </ContentWrapper>
    </ViewerWrapper>
  );
};

export default MediaViewer; 