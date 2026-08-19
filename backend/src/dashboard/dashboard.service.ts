import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData() {
    const [totalUsers, totalProducts, totalOrders, topCategories] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.listing.count(),
        this.prisma.order.count(),
        this.prisma.category.groupBy({
          by: ['name'],
          _count: { id: true },
        }),
      ]);

    return {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
      },
      categories: topCategories,
    };
  }
}
