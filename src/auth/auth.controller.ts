import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request as ExpressRequest, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered, tokens issued' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, res);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Access token returned, refresh token set in cookie' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }

  @Public()
  @Post('refresh')
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Get a new access token using the refresh token cookie' })
  @ApiResponse({ status: 200, description: 'New access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');
    return this.authService.refresh(refreshToken, res);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and clear the refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(user.id, res);
  }
}
