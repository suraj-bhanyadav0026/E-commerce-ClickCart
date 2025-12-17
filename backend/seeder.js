const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

mongoose.connect(process.env.MONGO_URI);

// Sample Users
const users = [
    {
        name: 'Admin User',
        email: 'admin@clickcart.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    }
];

// Sample Products
const products = [
    {
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality 100% cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
        price: 599,
        originalPrice: 999,
        discount: 40,
        category: 'clothing',
        subcategory: 'tshirts',
        brand: 'StyleCraft',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
        stock: 50,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
        rating: 4.5,
        numReviews: 128,
        isFeatured: true,
        tags: ['cotton', 'casual', 'summer']
    },
    {
        name: 'Classic Denim Jeans',
        description: 'Timeless denim jeans with a modern slim fit. Made with premium quality denim.',
        price: 1299,
        originalPrice: 1999,
        discount: 35,
        category: 'clothing',
        subcategory: 'jeans',
        brand: 'DenimCo',
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
        thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300',
        stock: 35,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Blue', hex: '#1E40AF' }, { name: 'Black', hex: '#000000' }],
        rating: 4.3,
        numReviews: 89,
        isFeatured: true,
        tags: ['denim', 'casual', 'jeans']
    },
    {
        name: 'Leather Chronograph Watch',
        description: 'Elegant leather strap watch with chronograph functionality. Water-resistant up to 50m.',
        price: 2999,
        originalPrice: 4999,
        discount: 40,
        category: 'accessories',
        subcategory: 'watches',
        brand: 'TimeMaster',
        images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'],
        thumbnail: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300',
        stock: 20,
        sizes: ['Free Size'],
        colors: [{ name: 'Brown', hex: '#8B4513' }, { name: 'Black', hex: '#000000' }],
        rating: 4.7,
        numReviews: 56,
        isFeatured: true,
        tags: ['watch', 'leather', 'formal']
    },
    {
        name: 'Wireless Bluetooth Earbuds',
        description: 'True wireless earbuds with noise cancellation and 24-hour battery life.',
        price: 1499,
        originalPrice: 2499,
        discount: 40,
        category: 'electronics',
        subcategory: 'audio',
        brand: 'SoundPro',
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'],
        thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300',
        stock: 100,
        sizes: ['Free Size'],
        colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
        rating: 4.4,
        numReviews: 234,
        isFeatured: true,
        tags: ['wireless', 'bluetooth', 'audio']
    },
    {
        name: 'Running Sports Shoes',
        description: 'Lightweight running shoes with advanced cushioning technology for maximum comfort.',
        price: 2499,
        originalPrice: 3999,
        discount: 38,
        category: 'footwear',
        subcategory: 'sports',
        brand: 'SpeedRun',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
        stock: 45,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Red', hex: '#DC2626' }, { name: 'Blue', hex: '#2563EB' }],
        rating: 4.6,
        numReviews: 178,
        isFeatured: true,
        tags: ['sports', 'running', 'shoes']
    },
    {
        name: 'Designer Sunglasses',
        description: 'UV400 protected sunglasses with polarized lenses and premium metal frame.',
        price: 899,
        originalPrice: 1499,
        discount: 40,
        category: 'accessories',
        subcategory: 'eyewear',
        brand: 'VisionStyle',
        images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
        thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
        stock: 60,
        sizes: ['Free Size'],
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Gold', hex: '#D4AF37' }],
        rating: 4.2,
        numReviews: 67,
        isFeatured: false,
        tags: ['sunglasses', 'uv', 'fashion']
    },
    {
        name: 'Casual Hoodie',
        description: 'Cozy cotton-blend hoodie with kangaroo pocket. Perfect for cool weather.',
        price: 999,
        originalPrice: 1599,
        discount: 37,
        category: 'clothing',
        subcategory: 'hoodies',
        brand: 'ComfortWear',
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
        thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300',
        stock: 40,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Grey', hex: '#6B7280' }, { name: 'Navy', hex: '#1E3A5F' }],
        rating: 4.5,
        numReviews: 92,
        isFeatured: true,
        tags: ['hoodie', 'casual', 'winter']
    },
    {
        name: 'Leather Wallet',
        description: 'Genuine leather bi-fold wallet with RFID protection and multiple card slots.',
        price: 699,
        originalPrice: 999,
        discount: 30,
        category: 'accessories',
        subcategory: 'wallets',
        brand: 'LeatherCraft',
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'],
        thumbnail: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300',
        stock: 75,
        sizes: ['Free Size'],
        colors: [{ name: 'Brown', hex: '#8B4513' }, { name: 'Black', hex: '#000000' }],
        rating: 4.4,
        numReviews: 143,
        isFeatured: false,
        tags: ['wallet', 'leather', 'rfid']
    }
];

// Sample Coupons
const coupons = [
    {
        code: 'WELCOME10',
        description: '10% off on first order',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 500,
        maxDiscount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        code: 'FLAT100',
        description: 'Flat ₹100 off',
        discountType: 'fixed',
        discountValue: 100,
        minOrderAmount: 999,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        code: 'SUMMER25',
        description: '25% off on summer collection',
        discountType: 'percentage',
        discountValue: 25,
        minOrderAmount: 1500,
        maxDiscount: 500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true
    }
];

const importData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();
        await Coupon.deleteMany();

        // Insert users (password will be hashed by pre-save hook)
        await User.create(users);
        
        // Insert products
        await Product.insertMany(products);
        
        // Insert coupons
        await Coupon.insertMany(coupons);

        console.log('✅ Data imported successfully!');
        console.log('📧 Admin: admin@clickcart.com / admin123');
        console.log('📧 User: john@example.com / password123');
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();
        await Coupon.deleteMany();

        console.log('✅ Data destroyed!');
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}

