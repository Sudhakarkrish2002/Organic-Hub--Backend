import mongoose from 'mongoose';

const seasonalPromotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Promotion name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  season: {
    type: String,
    required: [true, 'Season is required'],
    enum: ['spring', 'summer', 'monsoon', 'winter'],
    lowercase: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  discountPercentage: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  bannerImage: {
    type: String,
    required: [true, 'Banner image is required']
  },
  terms: {
    type: String,
    trim: true
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Max discount cannot be negative']
  },
  minOrderValue: {
    type: Number,
    min: [0, 'Min order value cannot be negative']
  }
}, {
  timestamps: true
});

// Index for efficient queries
seasonalPromotionSchema.index({ season: 1, isActive: 1 });
seasonalPromotionSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if promotion is currently active
seasonalPromotionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Method to check if promotion is valid for a given date
seasonalPromotionSchema.methods.isValidForDate = function(date) {
  return this.isActive && date >= this.startDate && date <= this.endDate;
};

// Method to get applicable discount for a product
seasonalPromotionSchema.methods.getDiscountForProduct = function(productId, productPrice) {
  if (!this.isCurrentlyActive) return 0;
  
  const isApplicable = this.applicableProducts.includes(productId) || 
                      this.applicableCategories.some(catId => 
                        productId.category && productId.category.equals(catId)
                      );
  
  if (!isApplicable) return 0;
  
  const discount = (productPrice * this.discountPercentage) / 100;
  return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
};

const SeasonalPromotion = mongoose.model('SeasonalPromotion', seasonalPromotionSchema);

export default SeasonalPromotion;
