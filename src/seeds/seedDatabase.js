import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../modules/products/models/Category.js';
import User from '../modules/users/models/User.js';
import Product from '../modules/products/models/Product.js';
import Order from '../modules/orders/models/Order.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Sample data
const categories = [
  {
    name: 'Vegetables',
    description: 'Fresh organic vegetables',
    icon: '🥦',
    featured: true,
    sortOrder: 1
  },
  {
    name: 'Fruits',
    description: 'Fresh organic fruits',
    icon: '🍎',
    featured: true,
    sortOrder: 2
  },
  {
    name: 'Dairy',
    description: 'Fresh dairy products',
    icon: '🥛',
    featured: true,
    sortOrder: 3
  },
  {
    name: 'Grains',
    description: 'Organic grains and cereals',
    icon: '🌾',
    featured: true,
    sortOrder: 4
  },
  {
    name: 'Natural',
    description: 'Natural and organic products',
    icon: '🍯',
    featured: true,
    sortOrder: 5
  }
];

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '9876543210',
    role: 'user',
    address: {
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '9876543211',
    role: 'admin',
    address: {
      street: '456 Oak Ave',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    }
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    phone: '9876543212',
    role: 'user',
    address: {
      street: '789 Pine Rd',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    }
  }
];

const products = [
  {
    name: 'Fresh Organic Tomatoes',
    description: 'Fresh, juicy organic tomatoes rich in lycopene and antioxidants',
    price: 120,
    weight: 500,
    weightUnit: 'g',
    stock: 50,
    isOrganic: true,
    isSeasonal: true,
    season: 'summer',
    rating: 4.8,
    numReviews: 156,
    discount: 20,
    tags: ['organic', 'fresh', 'antioxidants'],
    featured: true,
    nutritionalInfo: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      fiber: 1.2
    },
    images: [{
      url: 'https://image.pollinations.ai/prompt/fresh%20organic%20red%20tomatoes%2C%20high%20quality%2C%20natural%20lighting%2C%20studio%20photography?width=600&height=600&nologo=true&seed=301',
      publicId: 'tomatoes_1'
    }]
  },
  {
    name: 'Organic Bananas',
    description: 'Sweet organic bananas packed with potassium and natural energy',
    price: 80,
    weight: 1,
    weightUnit: 'kg',
    stock: 100,
    isOrganic: true,
    isSeasonal: false,
    season: 'all-year',
    rating: 4.6,
    numReviews: 89,
    discount: 20,
    tags: ['organic', 'energy', 'potassium'],
    featured: true,
    nutritionalInfo: {
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      fiber: 2.6
    },
    images: [{
      url: 'https://image.pollinations.ai/prompt/organic%20yellow%20bananas%2C%20fresh%2C%20natural%2C%20high%20detail%20photography?width=600&height=600&nologo=true&seed=302',
      publicId: 'bananas_1'
    }]
  },
  {
    name: 'Fresh Spinach Leaves',
    description: 'Nutrient-rich organic spinach with iron and vitamins',
    price: 60,
    weight: 250,
    weightUnit: 'g',
    stock: 75,
    isOrganic: true,
    isSeasonal: true,
    season: 'winter',
    rating: 4.9,
    numReviews: 203,
    discount: 20,
    tags: ['organic', 'iron', 'vitamins'],
    featured: true,
    nutritionalInfo: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2
    },
    images: [{
      url: 'https://image.pollinations.ai/prompt/fresh%20organic%20spinach%20leaves%2C%20green%2C%20crisp%2C%20macro%20photography?width=600&height=600&nologo=true&seed=303',
      publicId: 'spinach_1'
    }]
  },
  {
    name: 'Organic Apples',
    description: 'Crisp organic apples with natural sweetness and fiber',
    price: 200,
    weight: 1,
    weightUnit: 'kg',
    stock: 40,
    isOrganic: true,
    isSeasonal: true,
    season: 'winter',
    rating: 4.7,
    numReviews: 134,
    discount: 20,
    tags: ['organic', 'fiber', 'antioxidants'],
    featured: true,
    nutritionalInfo: {
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4
    },
    images: [{
      url: 'https://image.pollinations.ai/prompt/organic%20red%20apples%2C%20fresh%2C%20crisp%2C%20natural%20lighting%2C%20food%20photography?width=600&height=600&nologo=true&seed=304',
      publicId: 'apples_1'
    }]
  },
  {
    name: 'Fresh Carrots',
    description: 'Sweet organic carrots rich in beta-carotene and fiber',
    price: 90,
    weight: 500,
    weightUnit: 'g',
    stock: 60,
    isOrganic: true,
    isSeasonal: true,
    season: 'winter',
    rating: 4.5,
    numReviews: 78,
    discount: 18,
    tags: ['organic', 'beta-carotene', 'fiber'],
    featured: false,
    nutritionalInfo: {
      calories: 41,
      protein: 0.9,
      carbs: 10,
      fat: 0.2,
      fiber: 2.8
    },
    images: [{
      url: 'https://image.pollinations.ai/prompt/fresh%20organic%20carrots%2C%20orange%2C%20crisp%2C%20natural%20background?width=600&height=600&nologo=true&seed=305',
      publicId: 'carrots_1'
    }]
  },
  {
    name: 'Organic Milk',
    description: 'Fresh organic milk rich in calcium and protein',
    price: 120,
    weight: 1,
    weightUnit: 'l',
    stock: 30,
    isOrganic: true,
    isSeasonal: false,
    season: 'all-year',
    rating: 4.8,
    numReviews: 167,
    discount: 15,
    tags: ['organic', 'calcium', 'protein'],
    featured: true,
    nutritionalInfo: {
      calories: 42,
      protein: 3.4,
      carbs: 5.0,
      fat: 1.0,
      fiber: 0
    },
    images: [{
      url: 'https://image.pollinations.ai/prompt/fresh%20organic%20milk%20in%20glass%20bottle%2C%20dairy%20farm%2C%20natural%20lighting?width=600&height=600&nologo=true&seed=306',
      publicId: 'milk_1'
    }]
  },
  {
    name: 'Brown Rice',
    description: 'Organic brown rice rich in fiber and nutrients',
    price: 150,
    weight: 1,
    weightUnit: 'kg',
    stock: 45,
    isOrganic: true,
    isSeasonal: false,
    season: 'all-year',
    rating: 4.6,
    numReviews: 92,
    discount: 10,
    tags: ['organic', 'fiber', 'grains'],
    featured: false,
    nutritionalInfo: {
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8
    },
    images: [{
      url: 'https://image.pollinations.ai/prompt/organic%20brown%20rice%20in%20bowl%2C%20grains%2C%20natural%20lighting?width=600&height=600&nologo=true&seed=307',
      publicId: 'rice_1'
    }]
  },
  {
    name: 'Raw Honey',
    description: 'Pure raw honey with natural sweetness and antioxidants',
    price: 320,
    weight: 500,
    weightUnit: 'g',
    stock: 25,
    isOrganic: true,
    isSeasonal: false,
    season: 'all-year',
    rating: 4.8,
    numReviews: 204,
    discount: 16,
    tags: ['organic', 'antioxidants', 'raw'],
    featured: true,
    nutritionalInfo: {
      calories: 304,
      protein: 0.3,
      carbs: 82,
      fat: 0,
      fiber: 0.2
    },
    images: [{
      url: 'https://image.pollinations.ai/prompt/jar%20of%20raw%20organic%20honey%20with%20honey%20dipper%2C%20golden%20glow%2C%20sunlight%2C%20high%20detail?width=600&height=600&nologo=true&seed=308',
      publicId: 'honey_1'
    }]
  }
];

// Connect to database
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/organic-hub';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB Connected for seeding');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Seed categories
const seedCategories = async () => {
  try {
    await Category.deleteMany({});
    const createdCategories = await Category.insertMany(categories);
    logger.info(`✅ Seeded ${createdCategories.length} categories`);
    return createdCategories;
  } catch (error) {
    logger.error('Error seeding categories:', error);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  try {
    await User.deleteMany({});
    const createdUsers = await User.insertMany(users);
    logger.info(`✅ Seeded ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
};

// Seed products
const seedProducts = async (categories) => {
  try {
    await Product.deleteMany({});
    
    // Map products to categories
    const productsWithCategories = products.map((product, index) => {
      const categoryIndex = index % categories.length;
      return {
        ...product,
        category: categories[categoryIndex]._id
      };
    });
    
    const createdProducts = await Product.insertMany(productsWithCategories);
    logger.info(`✅ Seeded ${createdProducts.length} products`);
    return createdProducts;
  } catch (error) {
    logger.error('Error seeding products:', error);
    throw error;
  }
};

// Seed orders
const seedOrders = async (users, products) => {
  try {
    await Order.deleteMany({});
    
    const orders = [];
    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const paymentStatuses = ['pending', 'completed'];
    
    // Create sample orders for each user
    users.forEach((user, userIndex) => {
      for (let i = 0; i < 3; i++) {
        const orderItems = [];
        const numItems = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          
          orderItems.push({
            product: product._id,
            name: product.name,
            quantity: quantity,
            price: product.price,
            weight: product.weight,
            weightUnit: product.weightUnit
          });
        }
        
        const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = subtotal >= 500 ? 0 : 50;
        const tax = subtotal * 0.18; // 18% GST
        const discount = subtotal * 0.1; // 10% discount
        const totalAmount = subtotal + shippingCost + tax - discount;
        
        const order = {
          user: user._id,
          orderNumber: `ORD${Date.now()}${userIndex}${i}`,
          items: orderItems,
          shippingAddress: user.address,
          paymentMethod: ['razorpay', 'cod'][Math.floor(Math.random() * 2)],
          paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
          orderStatus: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
          subtotal: subtotal,
          shippingCost: shippingCost,
          tax: tax,
          discount: discount,
          totalAmount: totalAmount,
          notes: `Sample order ${i + 1} for ${user.name}`,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        };
        
        orders.push(order);
      }
    });
    
    const createdOrders = await Order.insertMany(orders);
    logger.info(`✅ Seeded ${createdOrders.length} orders`);
    return createdOrders;
  } catch (error) {
    logger.error('Error seeding orders:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Seed in order (categories -> users -> products -> orders)
    const categories = await seedCategories();
    const users = await seedUsers();
    const products = await seedProducts(categories);
    const orders = await seedOrders(users, products);
    
    logger.info('🎉 Database seeding completed successfully!');
    logger.info(`📊 Summary:`);
    logger.info(`   - Categories: ${categories.length}`);
    logger.info(`   - Users: ${users.length}`);
    logger.info(`   - Products: ${products.length}`);
    logger.info(`   - Orders: ${orders.length}`);
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
