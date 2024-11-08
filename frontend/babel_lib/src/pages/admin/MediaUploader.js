import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ChevronDown } from 'lucide-react';
import { uploadMedia } from '../../services/api/media';
import { Button, ErrorMessage } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

const UploaderWrapper = styled.div`
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 4rem 1rem 1rem;
    gap: 1.5rem;
  }

  h2 {
    color: ${props => props.theme.text};
    font-size: 2rem;
    text-align: center;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
  }

  h3 {
    color: ${props => props.theme.text};
    font-size: 1.25rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
  }
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.theme.border};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 100%;
  background: ${props => props.theme.secondaryBackground};
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    width: 100%;
    margin: 0 auto;
    
    svg {
      width: 32px;
      height: 32px;
    }
    
    p {
      font-size: 0.875rem;
      margin: 0.5rem 0;
      word-wrap: break-word;
    }
    
    small {
      font-size: 0.75rem;
      display: block;
      width: 100%;
      word-wrap: break-word;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  background: ${props => props.theme.surfaceColor};
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.borderLight};
  box-shadow: ${props => props.theme.shadowMd};
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
    width: calc(100% - 2rem);
    margin: 0 auto;
  }
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;

  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 1rem;
    min-height: 44px;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primaryAlpha};
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const Select = styled.select`
  padding: 0.875rem 1rem;
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  cursor: pointer;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 1rem;
    min-height: 44px;
    
    option {
      font-size: 1rem;
      padding: 0.5rem;
    }
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem 1rem;
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  min-height: 120px;
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;

  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 1rem;
    min-height: 100px;
  }
`;

const Preview = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    max-width: 200px;
  }
  
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  
  button {
    position: absolute;
    top: -8px;
    right: -8px;
    padding: 4px;
    
    @media (max-width: 768px) {
      padding: 2px;
      top: -4px;
      right: -4px;
      
      svg {
        width: 12px;
        height: 12px;
      }
    }
  }
`;

const ImagePreview = styled.div`
  width: 200px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    padding: 0.25rem;
    cursor: pointer;
    color: white;
  }
`;

const CoverDropZone = styled(DropZone)`
  height: 200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  
  img {
    max-height: 100px;
    max-width: 200px;
    width: auto;
    object-fit: contain;
  }
  
  @media (max-width: 768px) {
    height: 160px;
    margin-bottom: 1rem;
    
    img {
      max-height: 100px;
      max-width: 160px;
    }
  }
  
  svg {
    margin-bottom: 1rem;
  }
  
  p {
    margin: 0.5rem 0;
  }
`;

const genres = [
  'fiction',
  'non-fiction',
  'Action/Adventure',
  'fantasy',
  'graphic novel',
  'horror',
  'mystery',
  'romance',
  'supernatural',
  'comedy',
  'sci-fi',
  'thriller/suspense',
  'drama',
  'children',
  'young adult',
  'adult',
  'art/photography',
  'biography',
  'culinary/food',
  'poetry',
  'history',
  'math',
  'language',
  'science',
  'social science',
  'essay',
  'how-to/guide',
  'informative',
  'technology',
  'travel'
];

const GenreSection = styled.div`
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 768px) {
    max-height: none;
  }
`;

const GenreHeader = styled.div`
  padding: 0.875rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  min-height: 44px;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
`;

const GenreList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${props => props.theme.background};
  height: ${props => props.isExpanded ? 'auto' : '0'};
  max-height: ${props => props.isExpanded ? '400px' : '0'};
  overflow-y: auto;
  transition: all 0.3s ease;
  opacity: ${props => props.isExpanded ? '1' : '0'};
  visibility: ${props => props.isExpanded ? 'visible' : 'hidden'};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    padding: ${props => props.isExpanded ? '0.5rem' : '0'};
    max-height: ${props => props.isExpanded ? '200px' : '0'};
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 4px;
  }
`;

const GenreItem = styled.div`
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  background: ${props => props.isSelected ? props.theme.primary + '20' : 'transparent'};
  border: 1px solid ${props => props.isSelected ? props.theme.primary : props.theme.borderLight};
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:active {
    background: ${props => props.theme.primary + '40'};
  }
`;

const MediaUploader = () => {
  const { user, isAdmin } = useAuth();
  
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Is admin?", isAdmin);
    if (user) {
      // Fetch and log the user's Firestore document
      const fetchUserDoc = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        console.log("User Firestore data:", userDoc.data());
      };
      fetchUserDoc();
    }
  }, [user, isAdmin]);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    type: 'book',
    genres: [],
    description: '',
    author: '',
    year: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isGenreExpanded, setIsGenreExpanded] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      // Only create preview for images
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false,
    validator: (file) => {
      if (!file.type.match(/(application\/pdf|video\/.*)/)) {
        return {
          code: 'wrong-file-type',
          message: 'Only PDF and video files are allowed'
        };
      }
      return null;
    }
  });

  const onCoverDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }, []);

  const {
    getRootProps: getCoverRootProps,
    getInputProps: getCoverInputProps,
    isDragActive: isCoverDragActive
  } = useDropzone({
    onDrop: onCoverDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await uploadMedia(
        file,
        coverImage,
        {
          ...metadata,
          tags: metadata.tags
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(Boolean)
        },
        user,
        isAdmin
      );

      // Reset form
      setFile(null);
      setPreview(null);
      setMetadata({
        title: '',
        type: 'book',
        genres: [],
        description: '',
        author: '',
        year: '',
        tags: ''
      });

      // Show success message
      alert('Media uploaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload media. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UploaderWrapper>
      <h2>Upload Media</h2>
      
      <div>
        <h3>Cover Image</h3>
        {coverPreview ? (
          <CoverDropZone {...getCoverRootProps()}>
            <input {...getCoverInputProps()} />
            <img src={coverPreview} alt="Cover preview" />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCoverImage(null);
                setCoverPreview(null);
              }}
            >
              <X size={16} />
            </button>
          </CoverDropZone>
        ) : (
          <CoverDropZone {...getCoverRootProps()}>
            <input {...getCoverInputProps()} />
            {isCoverDragActive ? (
              <p>Drop the cover image here...</p>
            ) : (
              <div>
                <Upload size={48} />
                <p>Drag and drop a cover image here, or click to select</p>
                <small>Supported formats: JPG, PNG</small>
              </div>
            )}
          </CoverDropZone>
        )}
      </div>

      <div>
        <h3>Media File</h3>
        <DropZone {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <div>
              <Upload size={48} />
              <p>Drag and drop a file here, or click to select</p>
              <small>Supported formats: PDF, MP4, MOV, AVI, MKV</small>
              <small>Maximum size: 500MB</small>
            </div>
          )}
        </DropZone>
      </div>

      {preview && (
        <Preview>
          <img src={preview} alt="Preview" />
          <button onClick={() => {
            setFile(null);
            setPreview(null);
          }}>
            <X size={16} />
          </button>
        </Preview>
      )}

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Title"
          value={metadata.title}
          onChange={e => setMetadata({ ...metadata, title: e.target.value })}
          required
        />
        
        <Select
          value={metadata.type}
          onChange={e => setMetadata({ ...metadata, type: e.target.value })}
          required
        >
          <option value="book">Book</option>
          <option value="video">Video</option>
          <option value="article">Article</option>
        </Select>
        
        <GenreSection>
          <GenreHeader onClick={() => setIsGenreExpanded(!isGenreExpanded)}>
            <span>Select Genres ({metadata.genres.length} selected)</span>
            <ChevronDown 
              size={20} 
              style={{ 
                transform: isGenreExpanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }} 
            />
          </GenreHeader>
          <GenreList isExpanded={isGenreExpanded}>
            {genres.map(genre => (
              <GenreItem
                key={genre}
                isSelected={metadata.genres.includes(genre)}
                onClick={() => {
                  const newGenres = metadata.genres.includes(genre)
                    ? metadata.genres.filter(g => g !== genre)
                    : [...metadata.genres, genre];
                  setMetadata({ ...metadata, genres: newGenres });
                }}
              >
                {genre}
              </GenreItem>
            ))}
          </GenreList>
        </GenreSection>
        
        <TextArea
          placeholder="Description"
          value={metadata.description}
          onChange={e => setMetadata({ ...metadata, description: e.target.value })}
          required
        />
        
        <Input
          type="text"
          placeholder="Author"
          value={metadata.author}
          onChange={e => setMetadata({ ...metadata, author: e.target.value })}
          required
        />
        
        <Input
          type="number"
          placeholder="Year"
          value={metadata.year}
          onChange={e => setMetadata({ ...metadata, year: e.target.value })}
          required
        />
        
        <Input
          type="text"
          placeholder="Tags (comma-separated)"
          value={metadata.tags}
          onChange={e => setMetadata({ ...metadata, tags: e.target.value })}
        />
        
        <Button type="submit" disabled={!file || loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </UploaderWrapper>
  );
};

export default MediaUploader;
