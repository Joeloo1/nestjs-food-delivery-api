import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common';

import { RestaurantsService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-items.dto';
import { UpdateMenuItemDto } from './dto/update-menu-items.dto';
import { CreateCategoryDto } from './dto/create.category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';

@ApiTags('Restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all open restaurants (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of restaurants' })
  findAll(@Query() pagination: PaginationDto) {
    return this.restaurantsService.findAll(pagination);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single restaurant with categories and menu' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Public()
  @Get(':id/menu')
  @ApiOperation({ summary: 'Get all available menu items for a restaurant' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getMenu(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.getMenu(id);
  }

  // ─── Owner-only restaurant CRUD ───────────────────────────────────────────

  @ApiBearerAuth()
  @Roles(UserRole.RESTAURANT_OWNER)
  @Post()
  @ApiOperation({ summary: 'Create a new restaurant (restaurant_owner only)' })
  @ApiResponse({ status: 201, description: 'Restaurant created' })
  @ApiResponse({ status: 409, description: 'Duplicate restaurant name' })
  create(@Body() dto: CreateRestaurantDto, @CurrentUser() user: User) {
    return this.restaurantsService.create(dto, user);
  }

  @ApiBearerAuth()
  @Roles(UserRole.RESTAURANT_OWNER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update your restaurant (owner only)' })
  @ApiResponse({ status: 200, description: 'Restaurant updated' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.update(id, dto, user);
  }

  @ApiBearerAuth()
  @Roles(UserRole.RESTAURANT_OWNER)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 — success with no body
  @ApiOperation({ summary: 'Delete your restaurant (owner only)' })
  @ApiResponse({ status: 204, description: 'Restaurant deleted' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.restaurantsService.remove(id, user);
  }

  // ─── Menu item routes ─────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Roles(UserRole.RESTAURANT_OWNER)
  @Post(':id/menu')
  @ApiOperation({ summary: 'Add a menu item to your restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID', format: 'uuid' })
  addMenuItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMenuItemDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.addMenuItem(id, dto, user);
  }

  @ApiBearerAuth()
  @Roles(UserRole.RESTAURANT_OWNER)
  @Patch(':restaurantId/menu/:itemId')
  @ApiOperation({ summary: 'Update a menu item (owner only)' })
  updateMenuItem(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.updateMenuItem(
      restaurantId,
      itemId,
      dto,
      user,
    );
  }

  @ApiBearerAuth()
  @Roles(UserRole.RESTAURANT_OWNER)
  @Delete(':restaurantId/menu/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu item (owner only)' })
  removeMenuItem(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.removeMenuItem(restaurantId, itemId, user);
  }

  // ─── Category routes ──────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Roles(UserRole.RESTAURANT_OWNER)
  @Post(':id/categories')
  @ApiOperation({ summary: 'Add a menu category to your restaurant' })
  addCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.addCategory(id, dto, user);
  }

  @ApiBearerAuth()
  @Roles(UserRole.RESTAURANT_OWNER)
  @Delete(':restaurantId/categories/:categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a category (items become uncategorised, not deleted)',
  })
  removeCategory(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.removeCategory(
      restaurantId,
      categoryId,
      user,
    );
  }
}
