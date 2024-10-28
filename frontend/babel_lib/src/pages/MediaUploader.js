import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { Upload, AlertCircle, X } from 'lucide-react';
import { Loading, ErrorMessage, Button } from '../components/common';
import { Alert, AlertDescription } from '../components/ui/alert';

const UploaderWrapper = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const StyledButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.variant === 'secondary' ? '#f1f1f1' : '#2563eb'};
  color: ${props => props.variant === 'secondary' ? '#333' : 'white'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #f1f1f1;
  border-radius: 2px;
`;

const Progress = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: #2563eb;
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const MediaUploader = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'book',
    tags: '',
    isPublic: true,
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const allowedTypes = {
    book: ['application/pdf', 'application/epub+zip', '.pdf', '.epub'],
    video: ['video/mp4', 'video/webm', 'video/quicktime', '.mp4', '.webm', '.mov'],
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    const fileType = formData.type;
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
    const mimeType = selectedFile.type;
    
    if (!allowedTypes[fileType].some(type => 
      type === mimeType || type === `.${fileExtension}`
    )) {
      setError(`Invalid file type. Allowed types for ${fileType}: ${allowedTypes[fileType].join(', ')}`);
      setFile(null);
      return;
    }

    // Validate file size (100MB max)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const uploadFile = useCallback(async () => {
    if (!file) return null;

    console.log('Starting upload process...');
    
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const finalFileName = `${timestamp}-${sanitizedFileName}`;
    
    console.log('Upload path:', `archive/${formData.type}/${finalFileName}`);
    
    const storageRef = ref(storage, `archive/${formData.type}/${finalFileName}`.replace(/"/g, ''));
    
    try {
      console.log('Creating upload task...');
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload progress:', progress);
            setProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            setError(`Upload failed: ${error.message}`);
            setUploading(false);
            reject(error);
          },
          async () => {
            try {
              console.log('Upload completed, getting download URL...');
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Download URL obtained:', downloadURL);
              resolve(downloadURL);
            } catch (error) {
              console.error('GetDownloadURL error:', error);
              setError(`Failed to get download URL: ${error.message}`);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Upload task creation error:', error);
      throw error;
    }
  }, [file, formData.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Upload file to Firebase Storage
      const downloadURL = await uploadFile();
      if (!downloadURL) throw new Error('Failed to get download URL');

      // Create document in Firestore
      const mediaDoc = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPublic: formData.isPublic,
        fileUrl: downloadURL,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: serverTimestamp(),
        uploadedBy: user.uid,
        status: 'active'
      };

      await addDoc(collection(db, 'archive'), mediaDoc);

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'book',
        tags: '',
        isPublic: true,
      });
      setFile(null);
      setProgress(0);
      
      navigate('/admin-dashboard');
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <UploaderWrapper>
      <StyledButton variant="secondary" onClick={() => navigate('/admin-dashboard')}>
        Back to Dashboard
      </StyledButton>
      
      <h2 className="text-2xl font-bold mb-6">Upload Media</h2>

      {error && (
        <Alert variant="destructive">
          <AlertCircle size={16} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="type">Media Type</label>
          <Select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
          >
            <option value="book">Book/PDF</option>
            <option value="video">Video</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <label htmlFor="title">Title</label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="description">Description</label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="tags">Tags (comma-separated)</label>
          <Input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="education, learning, tutorial"
          />
        </FormGroup>

        <FormGroup>
          <label>
            <Input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
            />
            Make this media public
          </label>
        </FormGroup>

        <FormGroup>
          <label htmlFor="file">File Upload</label>
          <Input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept={allowedTypes[formData.type].join(',')}
          />
          {file && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFile(null)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </FormGroup>

        {progress > 0 && progress < 100 && (
          <ProgressBar>
            <Progress progress={progress} />
          </ProgressBar>
        )}

        <Button
          type="submit"
          disabled={uploading || !file}
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Media'}
        </Button>
      </Form>
    </UploaderWrapper>
  );
};

export default MediaUploader;
