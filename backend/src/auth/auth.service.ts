import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PaymentMethod, Role } from '../generated/prisma/enums.js';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';

export type RegisterDto = {
  email: string;
  password: string;
  name: string;
  address?: string;
  paymentMethods?: PaymentMethod[];
};

export type LoginDto = {
  email: string;
  password: string;
};

export type UpdateProfileDto = {
  name?: string;
  address?: string;
  paymentMethods?: PaymentMethod[];
};

export type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    address: string | null;
    paymentMethods: PaymentMethod[];
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    if (!email || !dto.password || !dto.name) {
      throw new BadRequestException('Email, password, and name are required.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('A user with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: dto.name,
        address: dto.address ?? null,
        paymentMethods: dto.paymentMethods ?? [PaymentMethod.CARD],
        role: Role.USER,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.buildAuthResponse(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    role: Role;
    address: string | null;
    paymentMethods: PaymentMethod[];
  }> {
    const data: {
      name?: string;
      address?: string | null;
      paymentMethods?: PaymentMethod[];
    } = {};

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (!trimmedName) {
        throw new BadRequestException('Name is required.');
      }
      data.name = trimmedName;
    }

    if (dto.address !== undefined) {
      data.address = dto.address.trim() || null;
    }

    if (dto.paymentMethods !== undefined) {
      data.paymentMethods = dto.paymentMethods;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        paymentMethods: true,
      },
    });

    return user;
  }

  async validateUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        paymentMethods: true,
      },
    });
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    address: string | null;
    paymentMethods: PaymentMethod[];
    password: string;
  }): AuthResponse {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address,
        paymentMethods: user.paymentMethods,
      },
    };
  }
}
