import { ApiProperty } from '@nestjs/swagger';

export class ItemResponseDto {
  @ApiProperty({ example: 1, description: 'Item ID' })
  id: number;

  @ApiProperty({ example: 'Laptop Dell XPS 13', description: 'Item name' })
  name: string;

  @ApiProperty({ example: 1, description: 'Item quantity' })
  quantity: number;

  @ApiProperty({ example: 'Available', description: 'Item status' })
  status: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: string;

  @ApiProperty({
    example: { id: 1, name: 'Living Room' },
    description: 'Room information',
    required: false,
  })
  room?: {
    id: number;
    name: string;
  };

  @ApiProperty({
    example: { id: 1, name: 'Kitchen Counter' },
    description: 'Place information',
    required: false,
  })
  place?: {
    id: number;
    name: string;
  };

  @ApiProperty({
    example: { id: 1, name: 'Storage Box' },
    description: 'Container information',
    required: false,
  })
  container?: {
    id: number;
    name: string;
  };
}

export class PaginatedItemsResponseDto {
  @ApiProperty({ type: [ItemResponseDto], description: 'List of items' })
  data: ItemResponseDto[];

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;
}
