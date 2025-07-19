export class AdminController {
  async getDashboardStats(req, res) {
    const stats = await this.adminService.getStats();
    
    res.json({
      users: {
        total: stats.totalUsers,
        verified: stats.verifiedUsers,
        pending: stats.pendingVerifications,
        suspended: stats.suspendedUsers
      },
      transactions: {
        total: stats.totalTransactions,
        volume: stats.transactionVolume,
        averageOrderValue: stats.avgOrderValue,
        disputes: stats.activeDisputes
      },
      products: {
        total: stats.totalProducts,
        active: stats.activeListings,
        reported: stats.reportedListings
      },
      revenue: {
        total: stats.totalRevenue,
        fees: stats.platformFees,
        monthly: stats.monthlyRevenue
      }
    });
  }

  async manageUser(req, res) {
    const { userId } = req.params;
    const { action, reason } = req.body;

    switch (action) {
      case 'suspend':
        await this.userService.suspendUser(userId, reason);
        break;
      case 'verify':
        await this.kycService.approveVerification(userId);
        break;
      case 'delete':
        await this.userService.deleteUser(userId);
        break;
    }

    res.json({ success: true, action, userId });
  }

  async moderateContent(req, res) {
    const { contentId, contentType } = req.params;
    const { action, reason } = req.body;

    const moderation = {
      contentId,
      contentType,
      action, // 'approve', 'reject', 'flag'
      moderatorId: req.user.userId,
      reason,
      timestamp: new Date()
    };

    await this.moderationService.moderate(moderation);
    res.json({ success: true, moderation });
  }
}