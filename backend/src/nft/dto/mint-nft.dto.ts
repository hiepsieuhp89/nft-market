import { IsString, IsNumber, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MintNFTDto {
  @ApiProperty({
    description: 'NFT name',
    example: 'My Awesome NFT',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'NFT description',
    example: 'This is a unique digital artwork',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'NFT image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({
    description: 'NFT price in MATIC',
    example: 0.1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;
}
