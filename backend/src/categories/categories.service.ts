import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const defaultCategories = [
      { name: 'Men', slug: 'men' },
      { name: 'Women', slug: 'women' },
      { name: 'Kids', slug: 'kids' },
    ];

    await Promise.all(
      defaultCategories.map((category) =>
        this.prisma.category.upsert({
          where: { slug: category.slug },
          update: {},
          create: category,
        }),
      ),
    );
  }

  findAll() {
    return this.prisma.category.findMany({
      include: { listings: true },
    });
  }

  async findOne(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { listings: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  create(data: { name: string; slug: string }) {
    return this.prisma.category.create({ data });
  }
}
