import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'bearer' })
  token_type: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;

  @ApiProperty({
    example: {
      id: '1',
      email: 'user@example.com',
      name: 'John Doe',
      admin: false,
    },
  })
  user: {
    id: string; // Changé de number à string pour compatibilité frontend
    email?: string; // Rendu optionnel pour compatibilité frontend
    name?: string; // Rendu optionnel et retiré null pour compatibilité frontend
    admin?: boolean; // Rendu optionnel pour compatibilité frontend
  };
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;
}
