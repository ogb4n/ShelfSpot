import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Kitchen Counter' })
  @IsString()
  name: string;
}

export class UpdatePlaceDto {
  @ApiProperty({
    example: 'Kitchen Counter',
    required: false,
  })
  @IsString()
  name: string;
}
