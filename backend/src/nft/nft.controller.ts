import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NftService } from './nft.service';
import { MintNFTDto } from './dto/mint-nft.dto';
import { TransferNFTDto } from './dto/transfer-nft.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('NFT')
@Controller('nft')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NftController {
  constructor(private nftService: NftService) {}

  @Post('mint')
  @ApiOperation({ summary: 'Mint a new NFT' })
  @ApiResponse({ status: 201, description: 'NFT minted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async mintNFT(@Request() req, @Body() mintDto: MintNFTDto) {
    return await this.nftService.mintNFT(req.user.uid, mintDto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer an NFT' })
  @ApiResponse({ status: 200, description: 'NFT transferred successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  async transferNFT(@Request() req, @Body() transferDto: TransferNFTDto) {
    return await this.nftService.transferNFT(req.user.uid, transferDto);
  }

  @Get('my-nfts')
  @ApiOperation({ summary: 'Get user NFTs' })
  @ApiResponse({ status: 200, description: 'User NFTs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserNFTs(@Request() req) {
    return await this.nftService.getUserNFTs(req.user.uid);
  }

  @Get('details/:tokenId')
  @ApiOperation({ summary: 'Get NFT details' })
  @ApiResponse({ status: 200, description: 'NFT details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  async getNFTDetails(@Param('tokenId') tokenId: string) {
    return await this.nftService.getNFTDetails(tokenId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get user transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactionHistory(@Request() req) {
    return await this.nftService.getTransactionHistory(req.user.uid);
  }
}
