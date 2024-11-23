import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import Post from '../components/posts/Post';
import { addDoc, collection } from 'firebase/firestore';
import '@testing-library/jest-dom';

// Mock Firebase config
jest.mock('../services/firebase/config', () => ({
  db: {},
  auth: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      username: 'testuser',
      role: 'user'
    })
  })),
  updateDoc: jest.fn(),
  increment: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

// Mock Auth Context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
    isAdmin: false
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

const mockPost = {
  id: 'test-post-id',
  content: 'Test post content',
  authorId: 'author-id',
  createdAt: new Date(),
};

const mockUserData = {
  username: 'testuser',
  photoURL: '/default-avatar.png'
};

const renderPost = () => {
  return render(
    <AuthProvider>
      <Post post={mockPost} userData={mockUserData} />
    </AuthProvider>
  );
};

describe('Post Reporting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens report modal when report button is clicked', async () => {
    renderPost();
    
    // Open post options menu
    const menuButton = screen.getByLabelText(/post options/i);
    fireEvent.click(menuButton);
    
    // Click report option
    const reportButton = screen.getByText(/report post/i);
    fireEvent.click(reportButton);
    
    // Check if report modal is opened
    expect(screen.getByText(/report this post/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /report reason/i })).toBeInTheDocument();
  });

  test('submits report successfully', async () => {
    addDoc.mockResolvedValueOnce({ id: 'report-id' });
    
    renderPost();
    
    // Open report modal
    const menuButton = screen.getByLabelText(/post options/i);
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText(/report post/i));
    
    // Fill report form
    fireEvent.change(screen.getByRole('combobox', { name: /report reason/i }), {
      target: { value: 'inappropriate' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/additional details/i), {
      target: { value: 'This post contains inappropriate content' }
    });
    
    // Submit report
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined, // collection ref will be undefined in test
        expect.objectContaining({
          postId: 'test-post-id',
          reporterId: 'test-user-id',
          reason: 'inappropriate',
          details: 'This post contains inappropriate content',
          status: 'pending'
        })
      );
    });
    
    // Check success message
    expect(screen.getByText(/report submitted successfully/i)).toBeInTheDocument();
  });

  test('shows error message when report submission fails', async () => {
    const errorMessage = 'Failed to submit report';
    addDoc.mockRejectedValueOnce(new Error(errorMessage));
    
    renderPost();
    
    // Open report modal
    const menuButton = screen.getByLabelText(/post options/i);
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText(/report post/i));
    
    // Fill and submit report
    fireEvent.change(screen.getByRole('combobox', { name: /report reason/i }), {
      target: { value: 'spam' }
    });
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('prevents submitting report without selecting reason', () => {
    renderPost();
    
    // Open report modal
    const menuButton = screen.getByLabelText(/post options/i);
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText(/report post/i));
    
    // Try to submit without selecting reason
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    expect(submitButton).toBeDisabled();
    
    // Select reason
    fireEvent.change(screen.getByRole('combobox', { name: /report reason/i }), {
      target: { value: 'spam' }
    });
    expect(submitButton).not.toBeDisabled();
  });
}); 