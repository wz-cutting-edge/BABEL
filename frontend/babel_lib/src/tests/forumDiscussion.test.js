import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import Forums from '../pages/user/Forums';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import '@testing-library/jest-dom';

// Mock Firebase auth
jest.mock('../services/firebase/config', () => ({
  db: {},
  storage: {},
  auth: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      username: 'testuser',
      role: 'user',
      banned: false
    })
  })),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn()
}));

// Mock Auth Context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
    isAdmin: false
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

const renderForums = () => {
  return render(
    <AuthProvider>
      <Forums />
    </AuthProvider>
  );
};

describe('Forum Discussion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create post form when user is logged in', () => {
    renderForums();
    
    expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
  });

  test('allows user to create a text post', async () => {
    addDoc.mockResolvedValueOnce({ id: 'new-post-id' });
    
    renderForums();
    
    const postContent = 'This is a test post';
    fireEvent.change(screen.getByPlaceholderText(/share your thoughts/i), {
      target: { value: postContent }
    });

    fireEvent.click(screen.getByRole('button', { name: /post/i }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined, // collection ref will be undefined in test
        expect.objectContaining({
          content: postContent,
          authorId: 'test-user-id'
        })
      );
    });
  });

  test('shows error message when post creation fails', async () => {
    const errorMessage = 'Failed to create post';
    addDoc.mockRejectedValueOnce(new Error(errorMessage));
    
    renderForums();
    
    fireEvent.change(screen.getByPlaceholderText(/share your thoughts/i), {
      target: { value: 'Test post content' }
    });

    fireEvent.click(screen.getByRole('button', { name: /post/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('disables post button when content is empty', () => {
    renderForums();
    
    const postButton = screen.getByRole('button', { name: /post/i });
    expect(postButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/share your thoughts/i), {
      target: { value: 'Some content' }
    });
    expect(postButton).not.toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/share your thoughts/i), {
      target: { value: '' }
    });
    expect(postButton).toBeDisabled();
  });
});
