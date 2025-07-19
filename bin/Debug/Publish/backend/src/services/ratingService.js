export class RatingService {
  async addReview(buyerId, orderId, rating, comment) {
    const order = await this.getOrder(orderId);
    
    if (order.buyerId !== buyerId) {
      throw new Error('Unauthorized to review this order');
    }

    const review = {
      id: crypto.randomUUID(),
      orderId,
      sellerId: order.sellerId,
      buyerId,
      rating, // 1-5 stars
      comment,
      verified: true, // Since they actually purchased
      createdAt: new Date(),
      helpful: 0,
      reported: false
    };

    await this.storeReview(review);
    await this.updateSellerRating(order.sellerId);
    
    return review;
  }

  async calculateTrustScore(userId) {
    const factors = await Promise.all([
      this.getAverageRating(userId),
      this.getCompletionRate(userId),
      this.getResponseTime(userId),
      this.getDisputeRate(userId),
      this.getVerificationStatus(userId)
    ]);

    // Weighted trust score calculation
    const trustScore = 
      factors[0] * 0.3 +  // Average rating (30%)
      factors[1] * 0.25 + // Completion rate (25%)
      factors[2] * 0.15 + // Response time (15%)
      factors[3] * 0.2 +  // Dispute rate (20%)
      factors[4] * 0.1;   // Verification (10%)

    return Math.round(trustScore * 100) / 100;
  }
}