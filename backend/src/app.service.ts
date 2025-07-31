import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'NFT Marketplace Backend API is running!';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'nft-marketplace-backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
