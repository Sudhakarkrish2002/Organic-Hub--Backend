# Organic Mart Backend API

A comprehensive Node.js/Express.js backend API for the Organic Mart e-commerce platform, built with the MERN stack.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: CRUD operations for products with categories, seasonal support, and organic certification
- **Shopping Cart**: Full cart functionality with bulk discounts and coupon support
- **Order Management**: Complete order lifecycle from creation to delivery
- **Payment Integration**: Razorpay payment gateway integration with webhook support
- **Review System**: Product reviews and ratings with moderation
- **Admin Dashboard**: Comprehensive admin panel with analytics and user management
- **Security**: Rate limiting, input validation, CORS, and security headers
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit
- **Security**: helmet
- **Logging**: winston
- **Payment**: Razorpay
- **File Upload**: Multer + Cloudinary

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/organic_mart

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/logout` - User logout

### Products
- `GET /api/v1/products` - Get all products (with filtering and pagination)
- `GET /api/v1/products/:id` - Get single product
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/seasonal/:season` - Get seasonal products
- `GET /api/v1/products/search` - Search products
- `POST /api/v1/products` - Create product (Admin only)
- `PUT /api/v1/products/:id` - Update product (Admin only)
- `DELETE /api/v1/products/:id` - Delete product (Admin only)

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get single category
- `GET /api/v1/categories/featured` - Get featured categories
- `GET /api/v1/categories/slug/:slug` - Get category by slug
- `POST /api/v1/categories` - Create category (Admin only)
- `PUT /api/v1/categories/:id` - Update category (Admin only)
- `DELETE /api/v1/categories/:id` - Delete category (Admin only)

### Cart
- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update/:productId` - Update cart item quantity
- `DELETE /api/v1/cart/remove/:productId` - Remove item from cart
- `DELETE /api/v1/cart/clear` - Clear cart
- `POST /api/v1/cart/apply-coupon` - Apply coupon to cart
- `DELETE /api/v1/cart/remove-coupon` - Remove coupon from cart

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get single order
- `PUT /api/v1/orders/:id/cancel` - Cancel order
- `PUT /api/v1/orders/:id/status` - Update order status (Admin only)
- `GET /api/v1/orders/admin/all` - Get all orders (Admin only)

### Payments
- `POST /api/v1/payments/create-order` - Create Razorpay payment order
- `POST /api/v1/payments/verify` - Verify payment signature
- `GET /api/v1/payments/:paymentId` - Get payment details
- `POST /api/v1/payments/:paymentId/refund` - Refund payment (Admin only)
- `GET /api/v1/payments/methods` - Get available payment methods
- `POST /api/v1/payments/webhook` - Razorpay webhook handler

### Reviews
- `GET /api/v1/reviews/product/:productId` - Get product reviews
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review
- `GET /api/v1/reviews/user` - Get user reviews
- `POST /api/v1/reviews/:id/report` - Report review
- `GET /api/v1/reviews/admin/all` - Get all reviews (Admin only)

### Admin
- `GET /api/v1/admin/dashboard` - Get dashboard statistics
- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/:id/status` - Update user status
- `PUT /api/v1/admin/users/:id/role` - Update user role
- `DELETE /api/v1/admin/users/:id` - Delete user

## Database Models

- **User**: User accounts with authentication and profile information
- **Product**: Products with categories, pricing, stock, and seasonal information
- **Category**: Product categories with hierarchical support
- **Cart**: Shopping cart with items and discount calculations
- **Order**: Orders with status tracking and payment information
- **Review**: Product reviews and ratings
- **Coupon**: Discount coupons and promotional codes

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration
- Security headers with helmet
- Role-based access control
- Payment signature verification

## Error Handling

- Centralized error handling middleware
- Consistent error response format
- Input validation errors
- Database error handling
- JWT error handling

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Search: 30 requests per minute
- File uploads: 10 requests per 15 minutes

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### File Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

## Testing

Run the test suite:
```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure all environment variables are properly configured
3. Use a process manager like PM2
4. Set up proper logging and monitoring
5. Configure MongoDB for production use
6. Set up SSL/TLS certificates

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

This project is licensed under the MIT License.
