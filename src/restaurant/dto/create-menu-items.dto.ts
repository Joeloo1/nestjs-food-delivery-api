import {
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  MaxLength,
  Min,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Jollof Rice + Chicken' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    example: 'Party jollof with smoky base, served with fried chicken.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // Price in kobo — client sends 350000 for ₦3,500
  @ApiProperty({
    example: 350000,
    description: 'Price in kobo. 350000 = ₦3,500',
  })
  @IsInt()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: 'menu-items/jollof-rice.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(0)
  preparationTimeMinutes?: number;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
