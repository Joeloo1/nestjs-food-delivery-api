import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional({ example: 'Operation successful' })
  message?: string;

  @ApiPropertyOptional({ example: 200 })
  statusCode?: number;

  @ApiPropertyOptional()
  meta?: PaginationMeta;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  timestamp?: string;
}
