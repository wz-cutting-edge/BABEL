import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export const searchMedia = async (searchTerm, type = 'all') => {
  try {
    const mediaRef = collection(db, 'media');
    let constraints = [];

    // Add type filter if specified
    if (type !== 'all') {
      constraints.push(where('type', '==', type));
    }

    // Search in multiple fields
    const searchFields = ['title', 'author', 'description', 'genre', 'tags'];
    const searchTermLower = searchTerm.toLowerCase();

    // Get all documents that match any of the search fields
    const querySnapshot = await getDocs(query(
      mediaRef,
      ...constraints,
      orderBy('createdAt', 'desc')
    ));

    // Filter results client-side for multiple field search
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(doc => 
        searchFields.some(field => {
          const value = doc[field];
          if (Array.isArray(value)) {
            // Handle arrays (tags)
            return value.some(tag => 
              tag.toLowerCase().includes(searchTermLower)
            );
          }
          return value && 
            value.toString().toLowerCase().includes(searchTermLower);
        })
      );
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};
