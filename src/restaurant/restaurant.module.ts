import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurant.service';
import { RestaurantsController } from './restaurant.controller';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-items.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, MenuItem, Category])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
})
export class RestaurantModule {}
