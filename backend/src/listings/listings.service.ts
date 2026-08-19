import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateListingDto, UpdateListingDto } from './listing.dto.js';
import Multer from 'multer';
@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  findAll(category?: string) {
    return this.prisma.listing.findMany({
      where: category ? { category: { slug: category } } : undefined,
      include: {
        category: true,
        images: true,
        sizeStocks: true,
      },
    });
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        sizeStocks: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async create(body: Record<string, string>, files: Express.Multer.File[]) {
    if (files.length === 0) {
      throw new BadRequestException('Add at least one product image.');
    }

    if (files.length > 5) {
      throw new BadRequestException('You can upload up to 5 images.');
    }

    const dto: CreateListingDto = {
      name: body.name,
      description: body.description,
      categoryId: body.categoryId,
      price: Number(body.price),
      sizes: this.parseSizes(body.sizes),
    };
    const imageUrls = await Promise.all(
      files.map((file) => this.uploadImage(file)),
    );
    const { sizes, ...rest } = dto;

    return this.prisma.listing.create({
      data: {
        ...rest,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
        sizeStocks: {
          create: Object.entries(sizes).map(([size, quantity]) => ({
            size: Number(size),
            quantity,
          })),
        },
      },
      include: {
        category: true,
        images: true,
        sizeStocks: true,
      },
    });
  }

  private parseSizes(rawSizes?: string): Record<string, number> {
    if (!rawSizes?.trim()) {
      throw new BadRequestException('Add sizes and quantities.');
    }

    let sizes: Record<string, number>;

    try {
      const parsed = JSON.parse(rawSizes) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') {
        sizes = Object.fromEntries(
          Object.entries(parsed).map(([size, quantity]) => [
            size,
            Number(quantity),
          ]),
        );
      } else {
        sizes = {};
      }
    } catch {
      // Support the dashboard's size:quantity shorthand as well as JSON.
      sizes = rawSizes
        .split(',')
        .reduce<Record<string, number>>((parsedSizes, item) => {
          const [size, quantity] = item.split(':').map((part) => part.trim());
          if (size && quantity) parsedSizes[size] = Number(quantity);
          return parsedSizes;
        }, {});
    }

    const invalidSize = Object.entries(sizes).find(
      ([size, quantity]) =>
        !/^\d+$/.test(size) ||
        !Number.isInteger(Number(size)) ||
        !Number.isInteger(quantity) ||
        quantity < 0,
    );

    if (invalidSize) {
      throw new BadRequestException(
        'Sizes must be numeric shoe sizes with whole-number stock, for example: 36:5, 37:5, 38:20.',
      );
    }

    return sizes;
  }

  private uploadImage(file: Express.Multer.File): Promise<string> {
    const cloudinaryUrl = this.config.get<string>('CLOUDINARY_URL');
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
      throw new BadRequestException(
        'Cloudinary is not configured. Add CLOUDINARY_URL or the Cloudinary cloud name, API key, and API secret.',
      );
    }

    if (cloudinaryUrl) {
      cloudinary.config();
    } else {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: this.config.get('CLOUDINARY_FOLDER') ?? 'tintin/listings' },
        (error, result) => {
          if (error || !result) {
            reject(new BadRequestException('Image upload failed.'));
            return;
          }
          resolve(result.secure_url);
        },
      );
      stream.end(file.buffer);
    });
  }

  async update(id: string, dto: UpdateListingDto) {
    const { images, sizes, ...rest } = dto;

    const existing = await this.prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Listing not found');
    }

    return this.prisma.listing.update({
      where: { id },
      data: {
        ...rest,
        ...(images
          ? {
              images: {
                deleteMany: {},
                create: images.map((url) => ({ url })),
              },
            }
          : {}),
        ...(sizes
          ? {
              sizeStocks: {
                deleteMany: {},
                create: Object.entries(sizes).map(([size, quantity]) => ({
                  size: Number(size),
                  quantity,
                })),
              },
            }
          : {}),
      },
      include: {
        category: true,
        images: true,
        sizeStocks: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Listing not found');
    }

    return this.prisma.listing.delete({
      where: { id },
      include: {
        category: true,
        images: true,
        sizeStocks: true,
      },
    });
  }
}
