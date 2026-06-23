import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return null;

    const { password: _, ...safeUser } = user as any;
    return safeUser as User;
  }

  async login(user: User, res: Response) {
    const { accessToken, refreshToken } = this.generateTokens(user);

    await this.storeRefreshToken(user.id, refreshToken);

    this.setRefreshCookie(res, refreshToken);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto, res: Response) {
    const user = await this.usersService.create(registerDto);
    return this.login(user, res);
  }

  async refresh(refreshToken: string, res: Response) {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);
    if (!user?.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Access denied');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      this.generateTokens(user);
    await this.storeRefreshToken(user.id, newRefreshToken);
    this.setRefreshCookie(res, newRefreshToken);

    return { access_token: accessToken };
  }

  async logout(userId: string, res: Response) {
    await this.usersService.updateRefreshToken(userId, null);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: (this.configService.get<string>('jwt.expiresIn') ??
        '15m') as any,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') ??
          '7d') as any,
      },
    );

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
  ): Promise<void> {
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    const hashed = await bcrypt.hash(token, saltRounds);
    await this.usersService.updateRefreshToken(userId, hashed);
  }

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
