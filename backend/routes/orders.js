const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, couponCode } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Check stock and prepare order items
        const orderItems = [];
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Not enough stock for ${item.product.name}` 
                });
            }

            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                image: item.product.thumbnail,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            });
        }

        // Calculate prices
        const itemsPrice = cart.totalAmount;
        const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST
        let shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping over ₹500
        let discountAmount = 0;

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({ 
                code: couponCode.toUpperCase(),
                isActive: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() }
            });

            if (coupon && itemsPrice >= coupon.minOrderAmount) {
                if (coupon.discountType === 'percentage') {
                    discountAmount = Math.round(itemsPrice * (coupon.discountValue / 100));
                    if (coupon.maxDiscount) {
                        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                    }
                } else {
                    discountAmount = coupon.discountValue;
                }
                
                coupon.usedCount += 1;
                await coupon.save();
            }
        }

        const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;

        // Create order
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountAmount,
            couponCode,
            totalPrice,
            isPaid: paymentMethod === 'COD' ? false : false,
            orderStatus: 'Pending',
            statusHistory: [{ status: 'Pending', comment: 'Order placed' }],
            expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        const createdOrder = await order.save();

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear cart
        await Cart.findOneAndDelete({ user: req.user._id });

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order belongs to user or user is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/track/:trackingNumber
// @desc    Track order by tracking number
// @access  Public
router.get('/track/:trackingNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ trackingNumber: req.params.trackingNumber })
            .select('orderStatus statusHistory expectedDelivery trackingNumber orderItems createdAt');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.post('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
        }

        order.orderStatus = 'Cancelled';
        order.statusHistory.push({ status: 'Cancelled', comment: req.body.reason || 'Cancelled by user' });

        // Restore stock
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/orders/validate-coupon
// @desc    Validate coupon code
// @access  Private
router.post('/validate-coupon', protect, async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        });

        if (!coupon) {
            return res.status(400).json({ message: 'Invalid or expired coupon' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        if (cartTotal < coupon.minOrderAmount) {
            return res.status(400).json({ 
                message: `Minimum order amount is ₹${coupon.minOrderAmount}` 
            });
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = Math.round(cartTotal * (coupon.discountValue / 100));
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else {
            discount = coupon.discountValue;
        }

        res.json({
            valid: true,
            discount,
            message: `Coupon applied! You save ₹${discount}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

