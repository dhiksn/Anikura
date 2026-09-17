# Deployment Guide - Separated Backend & Frontend

## Architecture
- **Backend**: Node.js/Express API deployed to `anikuraz-api.vercel.app`
- **Frontend**: Next.js application deployed to `anikuraz.vercel.app`

## Backend Deployment (anikuraz-api.vercel.app)

### 1. Configure Environment Variables
Set these in Vercel project settings:
```
BASE_URL=https://animasu.love
AUTHOR=dhiksn
NODE_ENV=production
CORS_ORIGIN=https://anikuraz.vercel.app
PORT=3000
```

### 2. Deploy to Vercel
```bash
# From root directory
vercel --prod
```

The backend will be deployed using the `vercel.json` configuration in the root.

## Frontend Deployment (anikuraz.vercel.app)

### 1. Configure Environment Variables
Set these in Vercel project settings:
```
NEXT_PUBLIC_API_URL=https://anikuraz-api.vercel.app
NEXT_PUBLIC_SOURCE_BASE_URL=https://animasu.love
AUTHOR=dhiksn
```

### 2. Deploy to Vercel
```bash
# From client directory
cd client
vercel --prod
```

The frontend will be deployed using the `vercel.json` configuration in the client folder.

## Local Development

### Backend
```bash
# From root directory
npm install
npm run dev
# Backend runs on http://localhost:3000
```

### Frontend
```bash
# From client directory
cd client
npm install
# Create .env.local with:
NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev
# Frontend runs on http://localhost:3000
```

## Important Notes

1. **CORS Configuration**: The backend is configured to allow requests from the frontend domain. Update `CORS_ORIGIN` in backend environment variables if needed.

2. **API Communication**: The frontend now calls the backend API via the `NEXT_PUBLIC_API_URL` environment variable instead of doing scraping directly.

3. **Service Dependencies**: The frontend no longer needs the scraper services locally. They can be removed from the frontend codebase if desired.

4. **Health Check**: Both deployments have health endpoints:
   - Backend: `https://anikuraz-api.vercel.app/health`
   - Frontend: `https://anikuraz.vercel.app/api/health`

## Verification Steps

1. Deploy backend first and verify it's accessible:
   ```bash
   curl https://anikuraz-api.vercel.app/health
   ```

2. Update frontend environment variable with backend URL

3. Deploy frontend and verify it can call backend:
   ```bash
   curl https://anikuraz.vercel.app/api/health
   ```

4. Test the application by visiting `https://anikuraz.vercel.app`

## Troubleshooting

- **CORS Errors**: Ensure the backend `CORS_ORIGIN` includes the frontend domain
- **API Connection Issues**: Verify `NEXT_PUBLIC_API_URL` is set correctly in frontend
- **Build Failures**: Check that all dependencies are installed in both projects
