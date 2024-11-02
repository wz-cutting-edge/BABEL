import React, { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import styled from 'styled-components';
import { Loading, ErrorMessage } from './common';
import { getAuth } from 'firebase/auth';

const PDFContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  position: relative;
  margin-bottom: 80px;
  min-height: calc(100vh - 100px);
`;

const PDFContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 2rem 0;

  .react-pdf__Page {
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background: white;
    max-width: 90vw;
    height: auto;
  }

  .react-pdf__Document {
    margin: 0 auto;
    max-width: 100%;
  }
`;

const Controls = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  background: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: auto;
  min-width: 300px;
`;

const PageInfo = styled.span`
  min-width: 100px;
  text-align: center;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PDFViewer = ({ url }) => {
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageRef = useRef(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch PDF');

        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        setPdfData(pdfUrl);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();
    return () => {
      if (pdfData) URL.revokeObjectURL(pdfData);
    };
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    scrollPositionRef.current = window.scrollY;
    const newPage = pageNumber + offset;
    
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
      
      // Use a more reliable way to restore scroll position
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
      }, 100);
    }
  };

  // Prevent scroll restoration on page changes
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <PDFContainer>
      <PDFContent>
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Loading />}
          error={<ErrorMessage>Failed to load PDF</ErrorMessage>}
        >
          <Page 
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={794}
            onRenderSuccess={() => {
              window.scrollTo({
                top: scrollPositionRef.current,
                behavior: 'auto'
              });
            }}
          />
        </Document>
      </PDFContent>
      <Controls>
        <Button 
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
        >
          Previous
        </Button>
        <PageInfo>Page {pageNumber} of {numPages}</PageInfo>
        <Button 
          onClick={() => changePage(1)}
          disabled={pageNumber >= numPages}
        >
          Next
        </Button>
      </Controls>
    </PDFContainer>
  );
};

export default PDFViewer;
