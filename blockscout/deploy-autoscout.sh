#!/bin/bash
# Autoscout deployment script for ChimeraProtocol

echo "🚀 Deploying Blockscout Autoscout for ChimeraProtocol..."

# Set environment variables
export NETWORK_NAME="Hedera Testnet"
export NETWORK_ID=296
export NETWORK_RPC_URL="https://testnet.hashio.io/api"
export NETWORK_CURRENCY="HBAR"

# Deploy Autoscout instance
docker run -d \
  --name chimera-blockscout \
  -p 4000:4000 \
  -e NETWORK_NAME="$NETWORK_NAME" \
  -e NETWORK_ID=$NETWORK_ID \
  -e NETWORK_RPC_URL="$NETWORK_RPC_URL" \
  -e NETWORK_CURRENCY="$NETWORK_CURRENCY" \
  -e DATABASE_URL="postgresql://postgres:password@db:5432/blockscout" \
  -v $(pwd)/blockscout/config.json:/app/config.json \
  blockscout/blockscout:latest

echo "✅ Autoscout deployed at http://localhost:4000"
echo "📋 Next steps:"
echo "1. Wait for initialization (2-3 minutes)"
echo "2. Access explorer at http://localhost:4000"
echo "3. Verify contracts in the UI"
