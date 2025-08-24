import mongoose from 'mongoose';

const bulkDiscountSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  tiers: [{
    quantity: {
      type: Number,
      required: [true, 'Quantity threshold is required'],
      min: [1, 'Quantity must be at least 1']
    },
    discountPercentage: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    maxDiscount: {
      type: Number,
      min: [0, 'Max discount cannot be negative']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  minOrderValue: {
    type: Number,
    min: [0, 'Min order value cannot be negative']
  },
  maxOrderValue: {
    type: Number,
    min: [0, 'Max order value cannot be negative']
  },
  applicableUserTypes: [{
    type: String,
    enum: ['all', 'premium', 'wholesale', 'retail'],
    default: 'all'
  }],
  description: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
bulkDiscountSchema.index({ product: 1, category: 1, isActive: 1 });
bulkDiscountSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if discount is currently active
bulkDiscountSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && (!this.endDate || now <= this.endDate);
});

// Method to get applicable discount for a given quantity
bulkDiscountSchema.methods.getDiscountForQuantity = function(quantity) {
  if (!this.isCurrentlyActive) return { percentage: 0, maxDiscount: 0 };
  
  // Sort tiers by quantity in descending order to find the best applicable tier
  const sortedTiers = [...this.tiers].sort((a, b) => b.quantity - a.quantity);
  
  for (const tier of sortedTiers) {
    if (quantity >= tier.quantity) {
      return {
        percentage: tier.discountPercentage,
        maxDiscount: tier.maxDiscount || 0
      };
    }
  }
  
  return { percentage: 0, maxDiscount: 0 };
};

// Method to calculate final price with bulk discount
bulkDiscountSchema.methods.calculateFinalPrice = function(quantity, unitPrice) {
  const discount = this.getDiscountForQuantity(quantity);
  if (discount.percentage === 0) return unitPrice * quantity;
  
  const totalPrice = unitPrice * quantity;
  const discountAmount = (totalPrice * discount.percentage) / 100;
  const finalDiscount = discount.maxDiscount ? Math.min(discountAmount, discount.maxDiscount) : discountAmount;
  
  return totalPrice - finalDiscount;
};

// Method to check if user is eligible for this discount
bulkDiscountSchema.methods.isUserEligible = function(userType) {
  return this.applicableUserTypes.includes('all') || this.applicableUserTypes.includes(userType);
};

// Pre-save middleware to validate tiers
bulkDiscountSchema.pre('save', function(next) {
  if (this.tiers.length === 0) {
    return next(new Error('At least one discount tier is required'));
  }
  
  // Validate that tiers are in ascending order by quantity
  for (let i = 1; i < this.tiers.length; i++) {
    if (this.tiers[i].quantity <= this.tiers[i-1].quantity) {
      return next(new Error('Tier quantities must be in ascending order'));
    }
  }
  
  next();
});

const BulkDiscount = mongoose.model('BulkDiscount', bulkDiscountSchema);

export default BulkDiscount;
