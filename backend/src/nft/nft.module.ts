import { Module } from '@nestjs/common';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import { DefenderService } from './services/defender.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [NftController],
  providers: [NftService, DefenderService],
  exports: [NftService],
})
export class NftModule {}
