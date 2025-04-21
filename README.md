# MakeMates

<div align="center">
  <a href="https://makemates.vercel.app" target="_blank">
    <img src="frontend/public/logo.png" alt="MakeMates Logo" width="200"/>
  </a>
  <h3 align="center">Connect, Share, Collaborate</h3>
  
  <p align="center">
    <a href="https://makemates.vercel.app"><strong>🌐 Live Demo</strong></a>
    ·
    <a href="#-getting-started">Getting Started</a>
    ·
    <a href="#-features">Features</a>
    ·
    <a href="#-tech-stack">Tech Stack</a>
  </p>
  
  <div align="center">
    <img src="https://img.shields.io/badge/next.js-14.0.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/typescript-5.0.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/prisma-5.0.0-white?style=for-the-badge&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/tailwindcss-3.0.0-38b2ac?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  </div>
</div>

## 📱 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Feed View</strong></td>
      <td align="center"><strong>Profile Page</strong></td>
    </tr>
    <tr>
      <td><img src="frontend/public/screenshots/feed.png" alt="Feed Screenshot" width="400"/></td>
      <td><img src="frontend/public/screenshots/profile.png" alt="Profile Screenshot" width="400"/></td>
    </tr>
    <tr>
      <td align="center"><strong>Chat Interface</strong></td>
      <td align="center"><strong>Video Call</strong></td>
    </tr>
    <tr>
      <td><img src="frontend/public/screenshots/chat.png" alt="Chat Screenshot" width="400"/></td>
      <td><img src="frontend/public/screenshots/video-chat.png" alt="Video Chat Screenshot" width="400"/></td>
    </tr>
  </table>
</div>

## ✨ Features

### Authentication & Security

- **Secure Registration & Login** - Robust user authentication with email verification
- **JWT-based Authentication** - Secure token-based session management
- **Password Encryption** - Advanced password hashing for maximum security

### Social Experience

- **Interactive Feed** - Personalized content stream with infinite scrolling
- **Content Creation** - Rich media posts with images, videos, and formatting
- **Real-time Chat** - Instant messaging between users with typing indicators and read receipts
- **Video Calls** - Face-to-face communication with screen sharing capabilities
- **Connection Management** - Follow/unfollow users and build your network

### User Experience

- **Responsive Design** - Beautiful UI that works seamlessly across all devices
- **Dark/Light Mode** - Customizable theme preferences
- **Notifications** - Real-time alerts for interactions and messages
- **Search Functionality** - Find users, posts, and content easily
- **Accessibility** - WCAG compliant interface for all users

### Profile Management

- **Custom Profiles** - Personalized profile pages with custom information
- **Media Uploads** - Image and avatar uploads with preview
- **Privacy Controls** - Granular settings for content visibility
- **Activity History** - Track and manage your platform interactions

### Coming Soon

- **AI-Powered Caption Suggestions** - Smart content assistance for posts
- **Enhanced Real-time Chat Features** - More interactive messaging tools
- **Improved Commenting System** - Richer interaction options for posts

## 🚀 Tech Stack

### Frontend

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [React Query](https://tanstack.com/query), Context API
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/), FontAwesome
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **API Client**: [Axios](https://axios-http.com/)

### Backend

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **File Storage**: [MinIO](https://min.io/)
- **Authentication**: [JWT](https://jwt.io/)
- **Logging**: [Winston](https://github.com/winstonjs/winston)

### DevOps

- **Containerization**: [Docker](https://www.docker.com/)
- **Orchestration**: [Kubernetes](https://kubernetes.io/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)
- **Cloud**: [Google Cloud Platform](https://cloud.google.com/)
- **Deployment**: [Vercel](https://vercel.com/) (Frontend)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- MinIO Server
- Docker (optional)

### Environment Setup

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/makemates
JWT_SECRET=your-jwt-secret
MINIO_ENDPOINT=your-minio-endpoint
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
```

### Installation

#### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/makemates.git

# Navigate to frontend directory
cd makemates/frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```

#### Backend Setup

```bash
# Navigate to backend directory
cd makemates/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

#### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📝 API Documentation

### Authentication

- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/logout` - End a user session

### Users

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/update` - Update user information
- `POST /api/users/upload-avatar` - Upload profile picture

### Posts

- `GET /api/posts` - Retrieve feed posts
- `POST /api/posts/create` - Create a new post
- `PUT /api/posts/:id` - Update an existing post
- `DELETE /api/posts/:id` - Remove a post

### Chat

- `GET /api/chats` - List user conversations
- `GET /api/chats/:id/messages` - Get messages for a chat
- `POST /api/chats/:id/messages` - Send a new message

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Arush Sharma - Backend & DevOps Engineer

## 📞 Contact

- **Live Site**: [makemates.vercel.app](https://makemates.vercel.app)
- **GitHub Repository**: [github.com/yourusername/makemates](https://github.com/yourusername/makemates)
- **Email**: [contact@makemates.com](mailto:contact@makemates.com)

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
