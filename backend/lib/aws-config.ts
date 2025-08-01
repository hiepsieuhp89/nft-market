// AWS Configuration Service for Netlify Functions
import { SSMClient, GetParameterCommand, GetParametersCommand } from '@aws-sdk/client-ssm';

// AWS Client configuration
const ssmClient = new SSMClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Cache for parameters to avoid repeated AWS calls
const parameterCache = new Map<string, { value: string; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a single parameter from AWS Parameter Store
 */
export async function getParameter(name: string, withDecryption = true): Promise<string | null> {
  const cacheKey = `${name}_${withDecryption}`;
  const cached = parameterCache.get(cacheKey);
  
  // Return cached value if still valid
  if (cached && Date.now() < cached.expiry) {
    return cached.value;
  }

  try {
    const command = new GetParameterCommand({
      Name: `/netlify/${name}`,
      WithDecryption: withDecryption,
    });

    const response = await ssmClient.send(command);
    const value = response.Parameter?.Value || null;

    // Cache the result
    if (value) {
      parameterCache.set(cacheKey, {
        value,
        expiry: Date.now() + CACHE_TTL,
      });
    }

    return value;
  } catch (error) {
    console.error(`Failed to get parameter ${name}:`, error);
    return null;
  }
}

/**
 * Get multiple parameters from AWS Parameter Store
 */
export async function getParameters(names: string[], withDecryption = true): Promise<Record<string, string>> {
  try {
    const parameterNames = names.map(name => `/netlify/${name}`);
    
    const command = new GetParametersCommand({
      Names: parameterNames,
      WithDecryption: withDecryption,
    });

    const response = await ssmClient.send(command);
    const result: Record<string, string> = {};

    response.Parameters?.forEach(param => {
      if (param.Name && param.Value) {
        // Remove /netlify/ prefix from name
        const cleanName = param.Name.replace('/netlify/', '');
        result[cleanName] = param.Value;
        
        // Cache individual parameters
        const cacheKey = `${cleanName}_${withDecryption}`;
        parameterCache.set(cacheKey, {
          value: param.Value,
          expiry: Date.now() + CACHE_TTL,
        });
      }
    });

    return result;
  } catch (error) {
    console.error('Failed to get parameters:', error);
    return {};
  }
}

/**
 * Get all configuration needed for the application
 */
export async function getAppConfig(): Promise<Record<string, string>> {
  const configKeys = [
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_MEASUREMENT_ID',
    'DEFENDER_API_KEY',
    'DEFENDER_API_SECRET',
    'DEFENDER_RELAYER_ADDRESS',
    'DEFENDER_RELAYER_ID',
    'DEFENDER_MINT_AUTOTASK_ID',
    'DEFENDER_TRANSFER_AUTOTASK_ID',
    'DEFENDER_QUERY_AUTOTASK_ID',
    'DEFENDER_MINT_WEBHOOK_URL',
    'DEFENDER_TRANSFER_WEBHOOK_URL',
    'DEFENDER_QUERY_WEBHOOK_URL',
    'PINATA_API_KEY',
    'PINATA_SECRET_KEY',
    'PINATA_JWT',
    'MORALIS_API_KEY',
    'PRIVATE_KEY',
    'ENCRYPTION_KEY',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'NETWORK_NAME',
    'RPC_URL',
    'CONTRACT_ADDRESS',
    'CHAIN_ID',
    'BLOCK_EXPLORER',
    'IPFS_GATEWAY',
    'POLYGON_RPC_URL',
    'POLYGONSCAN_API_KEY',
    'WEBHOOK_URL',
  ];

  return await getParameters(configKeys);
}

/**
 * Initialize configuration for a function
 * This should be called at the start of each Netlify function
 */
export async function initializeConfig(): Promise<Record<string, string>> {
  try {
    const config = await getAppConfig();
    
    // Set environment variables for backward compatibility
    Object.entries(config).forEach(([key, value]) => {
      if (value) {
        process.env[key] = value;
      }
    });

    return config;
  } catch (error) {
    console.error('Failed to initialize configuration:', error);
    return {};
  }
}
