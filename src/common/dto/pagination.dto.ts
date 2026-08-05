import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // hard cap — prevents someone requesting 10,000 rows
  limit?: number = 20;

  // Computed helpers used in service layer.
  // These are NOT exposed as query params — they're getter methods.
  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}
