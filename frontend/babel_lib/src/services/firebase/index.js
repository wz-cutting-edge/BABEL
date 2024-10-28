export * from './config';

// Add any additional Firebase utility functions here
export const getErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No user found with this email address';
    case 'auth/wrong-password':
      return 'Invalid password';
    case 'auth/email-already-in-use':
      return 'Email address is already registered';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address';
    default:
      return error.message;
  }
};

export const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};
