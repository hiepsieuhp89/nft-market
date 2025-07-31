import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from '../../common/decorators/is-ethereum-address.decorator';

export class TransferNFTDto {
  @ApiProperty({
    description: 'Token ID to transfer',
    example: '1',
  })
  @IsString()
  tokenId: string;

  @ApiProperty({
    description: 'Recipient wallet address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
  })
  @IsEthereumAddress()
  to: string;
}
