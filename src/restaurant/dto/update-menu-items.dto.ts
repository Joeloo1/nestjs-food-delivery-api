import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateMenuItemDto } from './create-menu-items.dto';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  // isAvailable is excluded from CreateMenuItemDto:
  // new items are always available by default.
  // Toggling availability (e.g. sold out mid-service) is an update-only operation.
  @ApiPropertyOptional({
    example: false,
    description: 'Set to false when item sells out',
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
