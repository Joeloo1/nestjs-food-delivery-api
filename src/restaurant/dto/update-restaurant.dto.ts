import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  /* isOpen is excluded from CreateRestaurantDto deliberately:
  // a restaurant's open/closed state is an operational toggle, not a creation field.
   It only makes sense after the restaurant already exists. */

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}
