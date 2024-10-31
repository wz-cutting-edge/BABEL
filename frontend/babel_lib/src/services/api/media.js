import { db, storage } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where,
  doc, 
  getDoc,
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadMedia = async (file, coverImage, metadata, user, isAdmin) => {
  if (!user || !isAdmin) {
    throw new Error('Unauthorized: Only admins can upload media.');
  }

  try {
    // Upload cover image if provided
    let coverUrl = null;
    if (coverImage) {
      const timestamp = Date.now();
      const extension = coverImage.name.split('.').pop();
      const coverFileName = `${timestamp}_${metadata.title}_cover.${extension}`;
      const coverRef = ref(storage, `covers/${coverFileName}`);
      await uploadBytes(coverRef, coverImage);
      coverUrl = await getDownloadURL(coverRef);
    }

    // Determine file type and storage path
    let fileType;
    if (file.type === 'application/pdf') {
      fileType = 'books';
    } else if (file.type.startsWith('video/')) {
      fileType = 'videos';
    } else {
      throw new Error('Unsupported file type');
    }

    // Create unique filename with original extension
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const uniqueFileName = `${timestamp}_${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
    const storagePath = `uploads/${fileType}/${uniqueFileName}`;
    const storageRef = ref(storage, storagePath);
    
    // Upload the file with metadata
    const uploadResult = await uploadBytes(storageRef, file, {
      customMetadata: {
        uploadedBy: user.uid,
        originalName: file.name,
        type: metadata.type,
        timestamp: timestamp.toString()
      }
    });

    // Get the download URL
    const downloadUrl = await getDownloadURL(uploadResult.ref);

    // Add entry to Firestore
    const mediaDoc = await addDoc(collection(db, 'media'), {
      ...metadata,
      fileUrl: downloadUrl,
      coverUrl, // Add the cover image URL
      storagePath,
      uploadedBy: user.uid,
      createdAt: serverTimestamp(),
      fileName: uniqueFileName,
      fileType: file.type,
      size: file.size,
      status: 'active',
      views: 0,
      downloads: 0
    });

    return mediaDoc.id;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const searchMedia = async (searchTerm, type = 'all') => {
  try {
    const mediaRef = collection(db, 'media');
    let constraints = [];

    if (type !== 'all') {
      constraints.push(where('type', '==', type));
    }

    // Add orderBy constraint
    constraints.push(orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(query(mediaRef, ...constraints));
    const searchTermLower = searchTerm.toLowerCase();

    // Filter results client-side for multiple field search
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(doc => {
        const searchFields = ['title', 'author', 'description', 'genre', 'tags'];
        return searchFields.some(field => {
          const value = doc[field];
          if (!value) return false;
          
          if (Array.isArray(value)) {
            return value.some(item => 
              item.toString().toLowerCase().includes(searchTermLower)
            );
          }
          
          return value.toString().toLowerCase().includes(searchTermLower);
        });
      });

  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getMediaUrl = async (mediaDoc) => {
  if (!mediaDoc?.storagePath) {
    throw new Error('Invalid media document');
  }

  const storageRef = ref(storage, mediaDoc.storagePath);
  return await getDownloadURL(storageRef);
};




