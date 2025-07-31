import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get user wallet information' })
  @ApiResponse({ status: 200, description: 'Wallet information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWalletInfo(@Request() req) {
    const wallet = await this.walletService.getWallet(req.user.uid);
    if (!wallet) {
      return { message: 'Wallet not found' };
    }

    const balance = await this.walletService.getWalletBalance(wallet.address);
    
    return {
      address: wallet.address,
      ...balance,
    };
  }

  @Get('balance/:address')
  @ApiOperation({ summary: 'Get balance for any wallet address' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid address' })
  async getBalance(@Param('address') address: string) {
    if (!this.walletService.isValidAddress(address)) {
      return { error: 'Invalid wallet address' };
    }

    return await this.walletService.getWalletBalance(address);
  }
}
