const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   POST /api/reviews/:productId
// @desc    Create a review
// @access  Private
router.post('/:productId', protect, async (req, res) => {
    try {
        const { rating, title, comment } = req.body;

        // Check if user already reviewed
        const existingReview = await Review.findOne({
            user: req.user._id,
            product: req.params.productId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Check if user purchased this product
        const hasPurchased = await Order.findOne({
            user: req.user._id,
            'orderItems.product': req.params.productId,
            orderStatus: 'Delivered'
        });

        const review = new Review({
            user: req.user._id,
            product: req.params.productId,
            rating,
            title,
            comment,
            isVerifiedPurchase: !!hasPurchased
        });

        await review.save();

        // Update product rating
        const reviews = await Review.find({ product: req.params.productId });
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

        await Product.findByIdAndUpdate(req.params.productId, {
            rating: Math.round(avgRating * 10) / 10,
            numReviews: reviews.length
        });

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name avatar');

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/reviews/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/:productId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ product: req.params.productId });

        // Rating breakdown
        const ratingBreakdown = await Review.aggregate([
            { $match: { product: require('mongoose').Types.ObjectId(req.params.productId) } },
            { $group: { _id: '$rating', count: { $sum: 1 } } }
        ]);

        res.json({
            reviews,
            page,
            pages: Math.ceil(total / limit),
            total,
            ratingBreakdown
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        review.rating = req.body.rating || review.rating;
        review.title = req.body.title || review.title;
        review.comment = req.body.comment || review.comment;

        await review.save();

        // Update product rating
        const reviews = await Review.find({ product: review.product });
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

        await Product.findByIdAndUpdate(review.product, {
            rating: Math.round(avgRating * 10) / 10
        });

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const productId = review.product;
        await review.deleteOne();

        // Update product rating
        const reviews = await Review.find({ product: productId });
        const avgRating = reviews.length > 0 
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
            : 0;

        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(avgRating * 10) / 10,
            numReviews: reviews.length
        });

        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

