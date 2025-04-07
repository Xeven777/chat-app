# Ghibli Styled Chat Application

A real-time chat application built with Node.js, Express, Socket.IO, React, and TypeScript.

![ss](frontend/public/og-img.jpg)

## Technology Stack 🛠️

### Frontend 🖥️

- ⚛️ React 19 - UI library
- ⚡ Vite - Build tool and dev server
- 🧩 TypeScript - Type safety
- 🧵 Tailwind CSS - Styling
- 🔌 Socket.io Client - Real-time communication
- 🎭 Shadcn UI - Component library

### Backend 🔧

- 🏃‍♂️ Bun - JavaScript runtime
- 🛣️ Express - Web framework
- 🔄 Socket.IO - Real-time bidirectional event-based communication
- 🧩 TypeScript - Type safety

### Infrastructure ☁️

- 🌱 AWS Elastic Beanstalk - PaaS solution for deployment
- 🔒 AWS Certificate Manager (ACM) - SSL certificate management
- 🌐 Custom Domain - User-friendly access point

## Project Structure

- `frontend/`: React frontend built with Vite
- `backend/`: Node.js backend with Socket.IO

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment to AWS Elastic Beanstalk

### Prerequisites

1. Install the AWS CLI and Elastic Beanstalk CLI
2. Configure AWS credentials with `aws configure`

### Backend Deployment

```bash
cd backend
npm install
npm run build
eb init  # First time only
eb deploy
```

### Frontend Deployment

1. Update the API URL in `.env.production` with your Elastic Beanstalk URL
2. Build the frontend:

```bash
cd frontend
npm install
npm run build
```

3. Deploy the `dist` folder to your preferred static hosting service (AWS S3, Netlify, Vercel, etc.)

## Environment Variables

### Backend

- `PORT`: The port the server will run on (default: 4000)

### Frontend

- `VITE_API_URL`: The URL of the backend API
