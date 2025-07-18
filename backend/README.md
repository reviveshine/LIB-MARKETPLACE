# LIB MARKETPLACE - Backend API

This is the backend API server for LIB MARKETPLACE, a secure multi-vendor marketplace platform.

## Features

- **User Authentication**: Registration and login with JWT tokens
- **Password Security**: Bcrypt hashing for password protection
- **API Endpoints**: RESTful API structure ready for frontend integration
- **CORS Support**: Cross-origin requests enabled for frontend communication
- **Environment Configuration**: Secure configuration management

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile

### Health Check
- `GET /api/health` - API health status
- `GET /` - API information

## Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "userType": "buyer"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **CORS**: cors middleware
- **Environment Variables**: dotenv

## Development

- **Hot Reload**: `npm run dev` (uses nodemon)
- **Debugging**: Console logging enabled
- **Error Handling**: Comprehensive error middleware

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- CORS configuration
- Input validation
- Error handling middleware

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Email verification system
- KYC document upload and verification
- Real-time chat functionality
- Payment processing integration
- File upload handling
- Rate limiting
- API documentation with Swagger

---

**Status**: Backend foundation completed ✅  
**Next**: Database integration and advanced features