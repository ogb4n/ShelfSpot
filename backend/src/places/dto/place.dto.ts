import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Kitchen Counter', description: 'Place name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Counter in the kitchen', description: 'Place description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePlaceDto {
  @ApiProperty({ example: 'Kitchen Counter', description: 'Place name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Counter in the kitchen', description: 'Place description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
