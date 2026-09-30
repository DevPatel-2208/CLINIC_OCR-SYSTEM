# Setup Guide

## Prerequisites

Make sure these are installed:
- **Node.js** 18+ (with npm)
- **Python** 3.9+
- **MongoDB** 6+ (local or Atlas)
- **Tesseract OCR** (system install)
- **Git**

## Installation Steps

### 1. Clone the repository
```bash
git clone <repo-url>
cd ClinicOCR
```

### 2. Install Node.js dependencies
```bash
# Root (for concurrently)
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Install Python dependencies
```bash
cd ../ai-service
pip install -r requirements.txt
```

### 4. Configure environment
```bash
# Copy example env
cp ../.env.example ../server/.env
```

Edit `server/.env` with your values:
```
MONGODB_URI=mongodb://localhost:27017/clinicocr
JWT_SECRET=your-strong-secret-key
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PYTHON_AI_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

### 5. Set Tesseract path
Edit `ai-service/.env`:
```
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

## Running the Application

### Development Mode (all services)
```bash
npm run dev
```

### Individual Services

**Backend:**
```bash
cd server && npm run dev
```
Server starts at http://localhost:5000

**Frontend:**
```bash
cd client && npm run dev
```
Client starts at http://localhost:5173

**Python AI Service:**
```bash
cd ai-service
uvicorn app.main:app --reload --port 8000
```
AI service starts at http://localhost:8000

## Seeding Demo Data

```bash
cd server
node src/seed.js
```

Demo credentials:
- Admin: admin@clinic.com / password123
- Doctor: doctor@clinic.com / password123
- Receptionist: staff@clinic.com / password123

## Verifying Installation

1. Start MongoDB
2. Run `npm run dev` from root
3. Open http://localhost:5173
4. Login with demo credentials
5. Verify doctor dashboard loads
6. Check Python AI service at http://localhost:8000/health