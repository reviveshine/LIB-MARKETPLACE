export class ProductController {
  async createListing(req, res) {
    const { title, description, price, category, images } = req.body;
    const sellerId = req.user.userId;

    const listing = {
      id: crypto.randomUUID(),
      sellerId,
      title,
      description,
      price,
      category,
      images: await this.processImages(images),
      status: 'active',
      createdAt: new Date(),
      views: 0,
      likes: 0
    };

    await this.productService.createListing(listing);
    res.status(201).json({ success: true, listing });
  }

  async searchProducts(req, res) {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      sortBy,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      query,
      category,
      priceRange: { min: minPrice, max: maxPrice },
      sortBy: sortBy || 'relevance'
    };

    const results = await this.productService.searchProducts(filters, page, limit);
    res.json({
      success: true,
      results: results.items,
      pagination: {
        page,
        limit,
        total: results.total,
        pages: Math.ceil(results.total / limit)
      }
    });
  }

  async trackProductView(req, res) {
    const { productId } = req.params;
    const viewerId = req.user?.userId || req.ip;

    await this.analyticsService.trackView({
      productId,
      viewerId,
      timestamp: new Date(),
      referrer: req.headers.referer
    });

    res.json({ success: true });
  }
}