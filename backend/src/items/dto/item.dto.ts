import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'Laptop Dell XPS 13', description: 'Item name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1, description: 'Item quantity', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 'Available',
    description: 'Item status',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    example: 'https://example.com/item-link',
    description: 'Link to the item',
    required: false,
  })
  @IsOptional()
  @IsString()
  itemLink?: string;

    // price property
  @ApiProperty({
    example: 999.99,
    description: 'Price of the item',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  // boolean property to check if the item is a consumable
  @ApiProperty({
    example: true,
    description: 'Indicates if the item is a consumable',
    required: false,
  })
  @IsBoolean()
  consumable: boolean;

  @ApiProperty({ example: 1, description: 'Room ID' })
  @IsNumber()
  roomId: number;

  @ApiProperty({ example: 1, description: 'Place ID' })
  @IsNumber()
  placeId: number;

  @ApiProperty({ example: 1, description: 'Container ID', required: false })
  @IsOptional()
  @IsNumber()
  containerId?: number;
}

export class UpdateItemDto {
  @ApiProperty({
    example: 'Laptop Dell XPS 13',
    description: 'Item name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 1,
    description: 'Item quantity',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiProperty({
    example: 'Available',
    description: 'Item status',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  
  @ApiProperty({
    example: 'https://example.com/item-link',
    description: 'Link to the item',
    required: false,
  })
  @IsOptional()
  @IsString()
  itemLink?: string;

    // price property
  @ApiProperty({
    example: 999.99,
    description: 'Price of the item',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 1, description: 'Room ID', required: false })
  @IsOptional()
  @IsNumber()
  roomId?: number;

  @ApiProperty({ example: 1, description: 'Place ID', required: false })
  @IsOptional()
  @IsNumber()
  placeId?: number;

  @ApiProperty({ example: 1, description: 'Container ID', required: false })
  @IsOptional()
  @IsNumber()
  containerId?: number;
}
