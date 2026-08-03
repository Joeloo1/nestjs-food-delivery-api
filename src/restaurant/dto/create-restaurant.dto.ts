import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsLatitude,
  IsLongitude,
  IsPhoneNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuisineType } from '../entities/restaurant.entity';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Mama Put Kitchen' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Authentic home-style Nigerian cooking.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CuisineType, example: CuisineType.NIGERIAN })
  @IsEnum(CuisineType)
  cuisineType: CuisineType;

  @ApiProperty({ example: '14 Allen Avenue, Ikeja, Lagos' })
  @IsString()
  address: string;

  // @IsLatitude validates range -90 to 90 — more semantic than @Min/@Max
  @ApiPropertyOptional({ example: 6.6018 })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  // @IsLongitude validates range -180 to 180
  @ApiPropertyOptional({ example: 3.3515 })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ example: 'restaurants/mama-put-logo.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 5.0, description: 'Delivery radius in km' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryRadiusKm?: number;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Minimum order in kobo. 100000 = ₦1,000',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;
}
