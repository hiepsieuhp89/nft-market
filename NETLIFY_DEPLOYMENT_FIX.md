# Netlify Deployment Fix - 4KB Environment Variables Limit

## Problem
The deployment is failing because Netlify passes ALL environment variables from the dashboard to each Lambda function, exceeding the 4KB limit.

## Immediate Solution

### Step 1: Remove ALL Environment Variables from Netlify Dashboard
1. Go to your Netlify site dashboard
2. Navigate to: Site settings → Environment variables
3. **DELETE ALL environment variables** that you may have added
4. This is crucial - even if variables are not in netlify.toml, Netlify still passes them to functions

### Step 2: Keep Only Essential Variables
The `backend/netlify.toml` now only contains:
- `NODE_VERSION = "18"`
- `CONTRACT_ADDRESS = "0x5B8c37aBdd3Dc72874d20a9403549798309599b5"`
- `FRONTEND_URL = "https://nft-market-tuna.netlify.app"`

### Step 3: Redeploy
After removing all environment variables from the dashboard, redeploy your site.

## Current Function Capabilities
With this minimal setup, the Netlify functions will provide:

### API Function (`/.netlify/functions/api`)
- Health check endpoint
- Basic API documentation
- No external service dependencies

### Auth Function (`/.netlify/functions/auth`)
- Mock authentication endpoints
- Login/register/profile endpoints
- Returns mock data (no real Firebase integration)

### NFT Function (`/.netlify/functions/nft`)
- Mock NFT endpoints
- Mint/upload/user NFTs endpoints
- Returns mock data with CONTRACT_ADDRESS

## For Full Functionality Later
If you need full backend functionality with Firebase, Defender, etc., you'll need to:

1. **Option A: Use a different deployment platform** (like Vercel, Railway, or traditional VPS) that doesn't have the 4KB environment variable limit

2. **Option B: Refactor to use external configuration** (like AWS Parameter Store, environment files, or configuration APIs)

3. **Option C: Split functions** into smaller, more focused functions that only need specific environment variables

## Why This Happens
- AWS Lambda (which powers Netlify Functions) has a 4KB limit for environment variables
- Netlify passes ALL environment variables from the dashboard to EVERY function
- Large variables like Firebase private keys and JWT tokens quickly exceed this limit
- This is a platform limitation, not a code issue

## Verification
After removing all environment variables from the dashboard and redeploying, you should see:
- Successful deployment
- Functions working with mock data
- No 4KB limit errors

The functions will be operational but will return mock data until you implement a different approach for handling large configuration values.
