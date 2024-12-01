# MakeMates - Social Networking Platform

<div align="center">
  <img src="frontend/public/logo.png" alt="MakeMates Logo" width="200"/>
  <p>Connect, Share, and Collaborate</p>
</div>

## 🌟 Features

- **User Authentication**

  - Secure login and registration
  - JWT-based authentication
  - Password encryption

- **Profile Management**

  - Profile picture upload
  - Personal information updates
  - Privacy settings

- **Social Features**

  - Post creation and sharing
  - Real-time chat
  - Friend connections
  - Feed customization

- **Modern UI/UX**
  - Responsive design
  - Dark/Light mode
  - Intuitive navigation

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **State Management**: React Query, Context API
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: FontAwesome, Lucide React
- **Form Handling**: React Hook Form
- **API Client**: Axios

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **File Storage**: MinIO
- **Authentication**: JWT
- **Logging**: Winston

### DevOps

- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitLab CI
- **Cloud**: AWS/GCP

## 🛠️ Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- MinIO Server
- Docker (optional)

### Frontend Setup

\```bash

# Clone the repository

git clone https://gitlab.com/archer/makemates-2024.git

# Navigate to frontend directory

cd makemates-2024/frontend

# Install dependencies

npm install

# Create .env.local file

cp .env.example .env.local

# Start development server

npm run dev
\```

### Backend Setup

\```bash

# Navigate to backend directory

cd makemates-2024/backend

# Install dependencies

npm install

# Set up environment variables

cp .env.example .env

# Run database migrations

npx prisma migrate dev

# Start development server

npm run dev
\```

### Docker Setup

\```bash

# Build and run with Docker Compose

docker-compose up -d
\```

## 📝 Environment Variables

### Frontend (.env.local)

\```env
NEXT_PUBLIC_API_URL=http://localhost:3000
\```

### Backend (.env)

\```env
DATABASE_URL=postgresql://user:password@localhost:5432/makemates
JWT_SECRET=your-jwt-secret
MINIO_ENDPOINT=your-minio-endpoint
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
\```

## 🔨 Scripts

### Frontend

- \`npm run dev\`: Start development server
- \`npm run build\`: Build production bundle
- \`npm run start\`: Start production server
- \`npm run lint\`: Run ESLint

### Backend

- \`npm run dev\`: Start development server
- \`npm run build\`: Build TypeScript
- \`npm run start\`: Start production server
- \`npm run migrate\`: Run database migrations

## 🌐 API Documentation

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout

### Users

- GET /api/users/profile
- PUT /api/users/update
- POST /api/users/upload-avatar

### Posts

- GET /api/posts
- POST /api/posts/create
- PUT /api/posts/:id
- DELETE /api/posts/:id

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Arush Sharma - Backend & DevOps Engineer

## 📞 Contact

- Project Link: [https://gitlab.com/rogueModer/makemates-2024](https://gitlab.com/rogueModer/makemates-2024)
- Website: [makemates.com](https://makemates.com)
<!-- - Email: [archer@makemates.com](mailto:archer@makemates.com) -->

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
