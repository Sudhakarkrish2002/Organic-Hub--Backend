# Organic Hub Backend API

A comprehensive backend API for the Organic Hub e-commerce platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization** - JWT-based user management with role-based access control
- **Product Management** - CRUD operations for organic products with categories and seasonal promotions
- **Order Management** - Complete order lifecycle with status tracking
- **Cart System** - Shopping cart with bulk discounts and seasonal offers
- **Payment Integration** - Razorpay payment gateway integration
- **File Upload** - Cloudinary integration for product images
- **Seasonal Promotions** - Dynamic seasonal product recommendations
- **Admin Dashboard** - Comprehensive admin panel for business management
- **API Security** - Rate limiting, CORS, and input validation
- **Logging & Monitoring** - Comprehensive logging and error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary
- **Payment**: Razorpay
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd Organic-Hub--Backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/organic-hub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay Configuration (for payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/

# Security
BCRYPT_SALT_ROUNDS=12
```

### 4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Product Endpoints
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Order Endpoints
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove item from cart

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/users/:id` - Update user (Admin only)

## 🔧 Configuration

### Database Configuration
The application supports both local MongoDB and MongoDB Atlas:

```javascript
// Local MongoDB
MONGODB_URI=mongodb://localhost:27017/organic-hub

// MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/organic-hub
```

### Cloudinary Configuration
For image uploads, configure Cloudinary:

```javascript
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Razorpay Configuration
For payment processing, configure Razorpay:

```javascript
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
└── app.js          # Express app setup
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin and user role management
- **Input Validation** - Request data validation using Joi
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Protection** - Cross-origin resource sharing configuration
- **Helmet Security** - Security headers middleware
- **Password Hashing** - Bcrypt password encryption

## 📊 Logging

The application uses Winston for comprehensive logging:

- **Access Logs** - HTTP request logs
- **Error Logs** - Application error logs
- **Combined Logs** - All logs combined
- **Log Levels** - Configurable log levels (error, warn, info, debug)

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:

```bash
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

### PM2 Process Manager
For production deployment, use PM2:

```bash
npm install -g pm2
pm2 start start.js --name "organic-hub-backend"
pm2 startup
pm2 save
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Core API functionality
- Authentication system
- Product management
- Order processing
- Payment integration
