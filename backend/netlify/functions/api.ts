// Netlify Function wrapper for NestJS backend
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../../src/app.module';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

let app: any;

async function createNestApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
      origin: [
        process.env.FRONTEND_URL || 'https://nft-market-tuna.netlify.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:4200',
      ],
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Global prefix
    app.setGlobalPrefix('api');

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('NFT Marketplace API')
      .setDescription('Backend API for NFT Marketplace with OpenZeppelin Defender integration')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
  }
  return app;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const app = await createNestApp();
    
    // Convert Netlify event to Express-like request
    const request = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers,
      body: event.body,
      query: event.queryStringParameters || {},
    };

    // Process request through NestJS
    const response = await app.getHttpAdapter().getInstance()(request);
    
    return {
      statusCode: response.statusCode || 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify(response.body || response),
    };
  } catch (error) {
    console.error('Netlify function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
};
