# BABEL - Social Media Platform

## Overview
**BABEL** is a social media platform that enables users to create and share posts, engage with others' content, and build communities. With a robust user system, content moderation tools, and media integration, BABEL offers a dynamic and secure environment for social interaction.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

### Authentication
- User registration and login
- Profile management
- Ban system for content moderation

### Posts
- Text and image post creation
- Like and comment functionality
- Media attachment support
- Reporting system for content moderation

### Social Features
- Follow/unfollow users
- User profiles with customizable information
- Activity feed based on followed users
- Nested comment threads

### Content Moderation
- Admin dashboard with management tools
- User banning system for handling violations
- Report handling for posts and comments

### Media Integration
- Image and video attachments for posts
- Collections system to organize favorite posts
- Ability to mark favorites for quick access

## Project Structure
Here’s an overview of the project's structure:

```plaintext
babel/
├── frontend/
│   ├── babel_lib/
│   │   ├── src/
│   │   │   ├── components/           # UI components organized by functionality
│   │   │   │   ├── posts/            # Components related to post functionality
│   │   │   │   ├── common/           # Reusable common components
│   │   │   │   └── features/         # Specialized feature components
│   │   │   ├── contexts/             # Context API for global state management (e.g., auth)
│   │   │   ├── pages/                # Main pages of the application (Home, Profile, Admin, etc.)
│   │   │   └── services/             # Firebase services and API interactions
│   │   └── public/                   # Static assets and metadata
│   └── package.json
└── firestore-rules.txt               # Firebase Security Rules for Firestore and Storage
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

## Installation

To set up BABEL locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/wz-cutting-edge/BABEL.git
   cd babel
   ```

2. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

The app will run locally at `http://localhost:3000`.

## Environment Configuration

1. **Set up Firebase**:
   - Create a Firebase project and enable Authentication, Firestore, and Storage.
   - Add your Firebase credentials to a `.env` file in the `frontend` directory:

   ```plaintext
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

2. **Security**: Ensure `.env` is listed in `.gitignore`.

## Contributing

We welcome contributions to enhance BABEL. To contribute:
1. Fork this repository.
2. Create a new branch for your feature or bug fix.
3. Open a pull request with a detailed description of your changes.

### Original Contributors
- William Zheng

## License

BABEL is [Unlicensed](LICENSE). You’re free to copy, modify, publish, use, compile, sell, or distribute this software.
