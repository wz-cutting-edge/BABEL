
# BABEL - Digital Library Archive & Social Platform

## Overview
**BABEL** is a digital library archive and social platform for books, textbooks, movies, videos, and more. Join our community to discover, share, and discuss your favorite content.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Features

### Authentication & User Management
- User registration and login
- Profile customization
- Role-based access control
- Admin dashboard with moderation tools
- Ban system for content moderation

### Content Management
- Book and media browsing
- PDF viewer integration with `react-pdf`
- Media collections and favorites system
- Post creation with text, images, and videos
- Reporting system for inappropriate content
- Nested comment threads for discussions

### Social Features
- Follow/unfollow users
- Activity feed based on followed users
- Forum discussions and user interactions
- Infinite scrolling for feeds and search results

### Performance & UX
- Optimistic updates for real-time feedback
- Debounced search for responsive queries
- Responsive design using Tailwind CSS

## Project Structure
```plaintext
babel/
├── LICENSE
├── README.md
├── firebase-storage-rules.txt
├── firestore-rules.txt
└── frontend/
    └── babel_lib/
        ├── public/             # Static assets
        └── src/
            ├── components/     # UI components organized by functionality
            │   ├── admin/      # Admin-specific components
            │   ├── common/     # Reusable components
            │   ├── features/   # Feature-specific components
            │   ├── headers/    # Header components
            │   ├── layouts/    # Layout components
            │   ├── modals/     # Modal components
            │   ├── notifications/ # Notification components
            │   ├── posts/      # Post-related components
            │   └── support/    # Support components
            ├── contexts/       # React contexts
            ├── hooks/          # Custom hooks
            │   ├── data/       # Data-related hooks
            │   ├── form/       # Form-related hooks
            │   ├── search/     # Search-related hooks
            │   └── ui/         # UI-related hooks
            ├── pages/          # Application pages
            ├── routes/         # Routing configuration
            ├── services/       # External services
            ├── styles/         # Global styles
            ├── tests/          # Test files
            ├── theme/          # Theme configuration
            └── utils/          # Utility functions
```

## Technology Stack

### Frontend
- **React 18**: Core framework for building the UI
- **Styled Components**: For dynamic styling of components
- **React Router v6**: For client-side routing and navigation
- **Lucide React**: Icon library for user interface components

### Backend & Infrastructure
- **Firebase Authentication**: Manages secure user authentication
- **Cloud Firestore**: NoSQL database for storing users, posts, comments, likes, follows, and other user interactions
- **Firebase Storage**: Stores media files, including profile pictures and post attachments
- **Firebase Security Rules**: Enforces read/write permissions based on user roles and actions

### Additional Libraries
- **react-pdf**: Renders PDF files in the browser
- **Tailwind CSS**: For responsive, utility-first styling
- **dotenv**: Manages environment variables securely

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/wz-cutting-edge/BABEL.git
   cd babel
   ```

2. **Install dependencies**:
   ```bash
   cd frontend/babel_lib
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the `frontend/babel_lib` directory:
   ```plaintext
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

The app will run locally at `http://localhost:3000`.

## Environment Configuration
- Ensure your Firebase project is set up with Authentication, Firestore, and Storage enabled.
- Keep `.env` files secure and listed in `.gitignore` to avoid exposing sensitive data.

## Testing
Run the test suite:
```bash
npm test
```

## Contributing
We welcome contributions to enhance BABEL. To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear and concise messages.
4. Push the branch to your forked repository.
5. Open a pull request with a detailed description of your changes.

### Original Contributors
- William Zheng
- Brooke Harris
- Meissen Hsu
- Ify Ojiaku
- Michelle Duong

## License
This project is Unlicensed. See the [LICENSE](LICENSE) file for details.

## Support
For support, please open an issue or contact the development team.
