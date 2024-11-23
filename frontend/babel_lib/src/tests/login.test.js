import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/auth/Login';
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as router from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }) => <div>{children}</div>
}));

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn()
}));

// Mock Firebase firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    data: () => ({ role: 'user' }),
    exists: () => true
  }))
}));

const renderLogin = () => {
  return render(
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
};

describe('Login Component', () => {
  let consoleLogSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log');
    mockNavigate.mockClear();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('displays success message in console when login is successful', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'test-uid', email: 'test@example.com' }
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Login successful');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
