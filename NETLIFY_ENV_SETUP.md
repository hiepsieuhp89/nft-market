# Netlify Environment Variables Setup Guide

Due to AWS Lambda's 4KB environment variable limit, ALL environment variables have been moved to Netlify's Environment Variables dashboard.

## ALL Required Environment Variables to Set in Netlify Dashboard

Go to your Netlify site dashboard → Site settings → Environment variables and add ALL the following variables:

### 1. Firebase Private Key
**Variable Name:** `FIREBASE_PRIVATE_KEY`
**Value:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDQYyVw9i5KUXAL
SpRj4LXYPC2KHBJsFig0stmYYVOm+zOBRFOdl+llIuejQ//ktcC71srRuIFsJOiL
RmLlJrn5zuqpjKcJKVOD30F3PwXipS8/nsQsjCRvAb73EWRQTgrqL9NpSUNHdtz3
MDW71bHJtQEgy6x1uO9Xn2thwsOBVB/jrTaiUm25iWpysI2mkFOCU7Qpod4QwR1F
8jOqANChX/6/UbwHU8ctYBK+1Z6EM2FbWOF49UxiCdaNQLLLplJuiVmGag/7rW/z
qDrlolc8kqZnzQPnv5BK7mu1vfmZ1rALOrp2Pt5Qdai8bOyh5TpLv+d6XmlR7Xb/
dxVYGlm5AgMBAAECggEACwgJ8LOXj7zv6X5xNzhWErRc1MrXpCZ9dQy4EtD+1KrH
oeLev6D4bK+EWP2TNlBI0P4gjn7t8Fj5K9D2EJtpjPKJ3vU1185QQCg5bE6cc9Bl
cpYSXH6uubxQl6kGs8RDNP0t0TeyUBOCxF3Q+mM9nifu1LBI2OfermIfanVyVA4/
cjaaGycudxRf/XEXxdlMwI8iWxevAJaXlE6IB/0MeAUw+myQeY3IvdnhExyYHNoQ
oEIQTD/CZMHWI6il5MYHgMsxAlZHj88XVUTLV+/SjDPy1YjjLVca0ANmeBuNdX2a
UyoN3xrJ6/F1hW4wW8OdUFuUxmrNxSd8pVxbK4iP4QKBgQD9o4RljIilyIsSBlj0
RIAQ+9ssKAUEukhAdVXEMwIslwrd2xmpzISOfEAT4uVEEdW+e04/L41++P4kyRss
Jf7BoPGv3ruKHJLkQV2Bd31mUx96GXRqgoCtiz8hTYaCKT0Ba7J0gb8fzekGyJng
GezQboSfWSPuLd/jbR6jb0WQowKBgQDSU8irkajM/S46xf18iSRV3lZ4sMkqMN6U
x4CRONViJC8T7tRKctIzTr4VHp6m4l1txawkejNdT4v4/FDl4MpGgp7Pa7gGTsXM
5lQfy8VSzdDoT3LqAYLCvXSRYS4zegQmNCpWM50vKC2uO/ZvKpqrr7YVBLpFOn2a
fpgo6lOl8wKBgF9pPGuq0thyOQZdxuaUQgyhgU/5+fFOVdGRkeLNQVsesmLEgcHj
AlZLHRud9ZqGjv4pikSwkaya45dY41TXMh8KeQAsbCXHG+arRA5osY5lZGjc3HMY
hmlCAUx4ykl6U82OAsJa8Fd5cNgxa9jmR7Qcbt02fhKhxR/bM3RNbkC7AoGAeh3h
PhQ1QMejJsa71am+qgiMhkiGk/OJ2DI5KJgp9HBz0QvywEMIXnfSj2qWzOhTPJ/v
wcIdvoioCWleAwpQBz5hvKabUzY7TCtTHp7uM5SCPc+bNdioti7P1nTpIUQv0oqp
JiGTmsSmOSphe8vtv88mVe/HwtgiAyiLaf4bkRcCgYEApOAOtyA0s/5vAYbqU1zb
XM9q3DDot2r670keWMsj2K94u0BnKEUp/oTQ8aPeX/uupQN6eE5U/Pc1ejWK7Ozr
gsq2VRyTU0PqMO7QCL082wiNqCT3Eh1Rr+2sNPuV9k3BXFfnzpotfluXTbFgfeF3
jwZnJIHLQoJNBA7+kB1rAGY=
-----END PRIVATE KEY-----
```

### 2. OpenZeppelin Defender API Secret
**Variable Name:** `DEFENDER_API_SECRET`
**Value:** `4vQda3ErS7sourdyeetw8B1FSpGSwaChQNonPHKatjPqqkxSk8wGvBRKQA8h7MJA`

### 3. Pinata JWT Token
**Variable Name:** `PINATA_JWT`
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZDk4ZGFlMC1mODg5LTQxNDItOTk0Zi0yNmEwOTc1ODQ0NjQiLCJlbWFpbCI6InR1bmdjYW4yMDAwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmOTViZmRmOGIzZjYxMzllZjEwMyIsInNjb3BlZEtleVNlY3JldCI6IjU3NDIxZGM0MWRlNjIxMjhiNmI2NjY5NmE3ZjUzYjVjY2Y4N2M2MjQxYWZjOTVjZTlkYTBkMzM5MTQwNzU5MDEiLCJleHAiOjE3ODUzMjE2Mzl9.ucdxTyPse2dLOcQQWoyqeRrxURxPZeWhAI5C2hNKlWA`

### 4. Moralis API Key
**Variable Name:** `MORALIS_API_KEY`
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImJhMGY0NmEzLWEzZDAtNDY1NC05OTk1LTQ0ZTg3ODQzOTU0NCIsIm9yZ0lkIjoiNDYyMTczIiwidXNlcklkIjoiNDc1NDgyIiwidHlwZUlkIjoiNzg3NDdiNTctOTMzOC00MjE1LTgwZDctN2Q2MmRiNjdmMzU3IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTM3ODczMjYsImV4cCI6NDkwOTU0NzMyNn0.FJljYq8LbO4Uh6c-2gRuAvaSzc-8xV_Lt1gyazQe8Ew`

### 5. Blockchain Private Key
**Variable Name:** `PRIVATE_KEY`
**Value:** `6b5af3cb8a0417eeb39b1af872153b214a57abf4e445cca9cbc7f1a386007d46`

### 6. Encryption Key
**Variable Name:** `ENCRYPTION_KEY`
**Value:** `15f4d1b5978b4008d624d27a9894210c0d9ddcf1e8bfe7f593cb4f5995bd4270`

### 7. Server Configuration
**Variable Name:** `PORT`
**Value:** `8081`

**Variable Name:** `NODE_ENV`
**Value:** `production`

**Variable Name:** `FRONTEND_URL`
**Value:** `https://nft-market-tuna.netlify.app`

### 8. JWT Configuration
**Variable Name:** `JWT_SECRET`
**Value:** `nft2025`

**Variable Name:** `JWT_EXPIRES_IN`
**Value:** `7d`

### 9. Firebase Configuration (Additional)
**Variable Name:** `FIREBASE_PROJECT_ID`
**Value:** `lavie-196cd`

**Variable Name:** `FIREBASE_CLIENT_EMAIL`
**Value:** `firebase-adminsdk-fbsvc@lavie-196cd.iam.gserviceaccount.com`

**Variable Name:** `FIREBASE_API_KEY`
**Value:** `AIzaSyDbyPtD6BVEbefBieILYeBjLCS35abN7aM`

**Variable Name:** `FIREBASE_AUTH_DOMAIN`
**Value:** `lavie-196cd.firebaseapp.com`

**Variable Name:** `FIREBASE_STORAGE_BUCKET`
**Value:** `lavie-196cd.firebasestorage.app`

**Variable Name:** `FIREBASE_MESSAGING_SENDER_ID`
**Value:** `631172388937`

**Variable Name:** `FIREBASE_APP_ID`
**Value:** `1:631172388937:web:3de000ee30131caeba4798`

**Variable Name:** `FIREBASE_MEASUREMENT_ID`
**Value:** `G-HVM047V56C`

### 10. OpenZeppelin Defender Configuration (Additional)
**Variable Name:** `DEFENDER_API_KEY`
**Value:** `ArjaqtuKsioJW62cJTKE82nL5npde2sB`

**Variable Name:** `DEFENDER_RELAYER_ADDRESS`
**Value:** `0x2ba190287a390cfa282E4B9aE57F758F28BA96d5`

**Variable Name:** `DEFENDER_RELAYER_ID`
**Value:** `ffd9488c-0af9-4c0a-8d3c-29e199a1c8c9`

**Variable Name:** `DEFENDER_MINT_AUTOTASK_ID`
**Value:** `7d0bc3c1-7578-472e-afdf-8d03d4c6611b`

**Variable Name:** `DEFENDER_TRANSFER_AUTOTASK_ID`
**Value:** `e9219e0c-c338-408e-b668-06cafb64cd1c`

**Variable Name:** `DEFENDER_QUERY_AUTOTASK_ID`
**Value:** `118413eb-f845-40c5-83da-288b32a1862a`

### 11. Webhook URLs
**Variable Name:** `DEFENDER_MINT_WEBHOOK_URL`
**Value:** `https://api.defender.openzeppelin.com/actions/7d0bc3c1-7578-472e-afdf-8d03d4c6611b/runs/webhook/358d6c75-54ec-49b9-bc3d-a558293d8ce0/BVjG5mR1Rx3m1X9ESGdhUp`

**Variable Name:** `DEFENDER_TRANSFER_WEBHOOK_URL`
**Value:** `https://api.defender.openzeppelin.com/autotasks/e9219e0c-c338-408e-b668-06cafb64cd1c/runs/webhook/EseGNoLu9dNxuZtaHVG8bu`

**Variable Name:** `DEFENDER_QUERY_WEBHOOK_URL`
**Value:** `https://api.defender.openzeppelin.com/autotasks/118413eb-f845-40c5-83da-288b32a1862a/runs/webhook/7U65Gq8YtAiYyV7gfNCmfw`

### 12. Blockchain Configuration
**Variable Name:** `NETWORK_NAME`
**Value:** `polygon-amoy`

**Variable Name:** `RPC_URL`
**Value:** `https://rpc-amoy.polygon.technology`

**Variable Name:** `CONTRACT_ADDRESS`
**Value:** `0x5B8c37aBdd3Dc72874d20a9403549798309599b5`

**Variable Name:** `CHAIN_ID`
**Value:** `80002`

**Variable Name:** `BLOCK_EXPLORER`
**Value:** `https://amoy.polygonscan.com/`

### 13. IPFS Configuration (Additional)
**Variable Name:** `PINATA_API_KEY`
**Value:** `f95bfdf8b3f6139ef103`

**Variable Name:** `PINATA_SECRET_KEY`
**Value:** `57421dc41de62128b6b66696a7f53b5ccf87c6241afc95ce9da0d33914075901`

**Variable Name:** `IPFS_GATEWAY`
**Value:** `https://gateway.pinata.cloud/ipfs/`

### 14. Hardhat Configuration
**Variable Name:** `POLYGON_RPC_URL`
**Value:** `https://rpc-amoy.polygon.technology`

**Variable Name:** `POLYGONSCAN_API_KEY`
**Value:** `7BBQ9JF4T2M26QIA5M8E8HNPW58MNQISUP`

### 15. Webhook Configuration
**Variable Name:** `WEBHOOK_URL`
**Value:** `https://nft-market-api.netlify.app/api/webhook`

## How to Set Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Click on "Site settings"
3. Navigate to "Environment variables" in the left sidebar
4. Click "Add a variable"
5. Enter the variable name and value
6. Click "Create variable"
7. Repeat for all required variables

## After Setting Variables

Once all environment variables are set in the Netlify dashboard, redeploy your site. The functions should now deploy successfully without exceeding the 4KB limit.

## Security Note

These environment variables contain sensitive information. Make sure:
- Only authorized team members have access to your Netlify site settings
- Regularly rotate API keys and secrets
- Monitor usage of these credentials
