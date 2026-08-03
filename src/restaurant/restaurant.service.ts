import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-items.entity';
import { Category } from './entities/category.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-items.dto';
import { UpdateMenuItemDto } from './dto/update-menu-items.dto';
import { CreateCategoryDto } from './dto/create.category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

// ─── Return types ──────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,

    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // ── Create ────────────────────────────────────────────────────────────────

  async create(dto: CreateRestaurantDto, owner: User): Promise<Restaurant> {
    // Prevent duplicate restaurant names from the same owner in the same city.
    // This is a business rule, not a DB constraint — keeps the error message friendly.
    const duplicate = await this.restaurantRepo.findOne({
      where: { name: dto.name, ownerId: owner.id },
    });

    if (duplicate) {
      throw new ConflictException(
        `You already have a restaurant named "${dto.name}".`,
      );
    }

    const restaurant = this.restaurantRepo.create({
      ...dto,
      ownerId: owner.id,
    });

    return this.restaurantRepo.save(restaurant);
  }

  // ── Read (public list) ────────────────────────────────────────────────────

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Restaurant>> {
    const [data, total] = await this.restaurantRepo.findAndCount({
      where: { isOpen: true },
      // Only load categories here — not menuItems.
      // A list endpoint returning every menu item of every restaurant
      // in one query is a serious over-fetch.
      relations: ['categories'],
      order: { rating: 'DESC' },
      take: pagination.limit,
      skip: pagination.skip,
    });

    return {
      data,
      meta: {
        total,
        page: pagination.page ?? 1,
        limit: pagination.limit ?? 20,
        totalPages: Math.ceil(total / (pagination.limit ?? 20)),
      },
    };
  }

  // ── Read (single — public, full detail) ───────────────────────────────────

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      // Public detail view: load categories and menu items.
      // Do NOT load 'owner' here — that would expose the owner's email, role, etc.
      // If you need owner info on the frontend, add a separate /restaurants/:id/owner endpoint.
      relations: ['categories', 'menuItems'],
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id "${id}" not found.`);
    }

    return restaurant;
  }

  // ── Read (lean — internal use only) ──────────────────────────────────────
  //
  // Used by ownership checks and internal lookups.
  // Does NOT load any relations — just the restaurant row.
  // This avoids the N+1-adjacent pattern where every PATCH/DELETE
  // loads all menu items and categories just to check ownerId.

  private async findOneOrFail(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id "${id}" not found.`);
    }

    return restaurant;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(
    id: string,
    dto: UpdateRestaurantDto,
    requestingUser: User,
  ): Promise<Restaurant> {
    // Use lean findOneOrFail for ownership checks — no relations needed
    const restaurant = await this.findOneOrFail(id);
    this.assertOwnership(restaurant, requestingUser.id);

    // merge() is safer than Object.assign() here:
    // - It only touches fields that are explicitly present in dto
    // - TypeORM tracks the entity as "dirty" only on actually-changed fields
    // - Object.assign would also copy undefined values, potentially nulling columns
    const updated = this.restaurantRepo.merge(restaurant, dto);
    return this.restaurantRepo.save(updated);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async remove(id: string, requestingUser: User): Promise<void> {
    const restaurant = await this.findOneOrFail(id);
    this.assertOwnership(restaurant, requestingUser.id);
    await this.restaurantRepo.remove(restaurant);
  }

  // ─── Rating (atomic update) ───────────────────────────────────────────────
  /* This is the ONLY correct way to update rating.
   A read-modify-write cycle has a race condition:
     Two orders finish simultaneously → both read totalRatings = 100
     → both compute a new average → one silently overwrites the other.
    The query builder update is atomic at the DB level — no race possible.
   Called by OrdersService (Day 4) after a delivery is confirmed. */

  async addRating(restaurantId: string, newRating: number): Promise<void> {
    await this.restaurantRepo
      .createQueryBuilder()
      .update(Restaurant)
      .set({
        rating: () =>
          `(rating * "total_ratings" + ${newRating}) / ("total_ratings" + 1)`,
        totalRating: () => `"total_ratings" + 1`,
      })
      .where('id = :restaurantId', { restaurantId })
      .execute();
  }

  // ─── Menu Items ───────────────────────────────────────────────────────────
  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    await this.findOneOrFail(restaurantId);

    return this.menuItemRepo.find({
      where: { restaurantId, isAvailable: true },
      relations: ['category'],
      order: { category: { sortOrder: 'ASC' } },
    });
  }

  async addMenuItem(
    restaurantId: string,
    dto: CreateMenuItemDto,
    requestingUser: User,
  ): Promise<MenuItem> {
    const restaurant = await this.findOneOrFail(restaurantId);
    this.assertOwnership(restaurant, requestingUser.id);

    const item = this.menuItemRepo.create({ ...dto, restaurantId });
    return this.menuItemRepo.save(item);
  }

  async updateMenuItem(
    restaurantId: string,
    itemId: string,
    dto: UpdateMenuItemDto,
    requestingUser: User,
  ): Promise<MenuItem> {
    const restaurant = await this.findOneOrFail(restaurantId);
    this.assertOwnership(restaurant, requestingUser.id);

    const item = await this.menuItemRepo.findOne({
      where: { id: itemId, restaurantId },
    });

    if (!item) {
      throw new NotFoundException(
        `Menu item "${itemId}" not found in this restaurant.`,
      );
    }

    const updated = this.menuItemRepo.merge(item, dto);
    return this.menuItemRepo.save(updated);
  }

  async removeMenuItem(
    restaurantId: string,
    itemId: string,
    requestingUser: User,
  ): Promise<void> {
    const restaurant = await this.findOneOrFail(restaurantId);
    this.assertOwnership(restaurant, requestingUser.id);

    const item = await this.menuItemRepo.findOne({
      where: { id: itemId, restaurantId },
    });

    if (!item) {
      throw new NotFoundException(
        `Menu item "${itemId}" not found in this restaurant.`,
      );
    }

    await this.menuItemRepo.remove(item);
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  async addCategory(
    restaurantId: string,
    dto: CreateCategoryDto,
    requestingUser: User,
  ): Promise<Category> {
    const restaurant = await this.findOneOrFail(restaurantId);
    this.assertOwnership(restaurant, requestingUser.id);

    const category = this.categoryRepo.create({ ...dto, restaurantId });
    return this.categoryRepo.save(category);
  }

  async removeCategory(
    restaurantId: string,
    categoryId: string,
    requestingUser: User,
  ): Promise<void> {
    const restaurant = await this.findOneOrFail(restaurantId);
    this.assertOwnership(restaurant, requestingUser.id);

    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, restaurantId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category "${categoryId}" not found in this restaurant.`,
      );
    }

    await this.categoryRepo.remove(category);
  }

  // ── assertOwnership ───────────────────────────────────────────────────────
  //
  // Single source of truth for "does this user own this resource?".
  // Every mutating method calls this — never inline the check.
  // If you add an admin bypass later, you add it here ONCE.

  private assertOwnership(restaurant: Restaurant, userId: string): void {
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this restaurant.',
      );
    }
  }
}
