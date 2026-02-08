# 🚀 Smart Contract Deployment Guide

Complete guide for deploying AgentEscrow and AgentBounty contracts to any supported network.

## Prerequisites

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
```

## Quick Start

### 1. Setup Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your private key (REQUIRED)
# PRIVATE_KEY=0x1234...
```

⚠️ **NEVER commit your `.env` file!** It's already in `.gitignore`.

### 2. Choose Your Network

**Testnets (Recommended for testing):**
- `sepolia` - Ethereum Sepolia
- `baseSepolia` - Base Sepolia  
- `amoy` - Polygon Amoy
- `arbitrumSepolia` - Arbitrum Sepolia

**Mainnets (Production only):**
- `ethereum` - Ethereum Mainnet
- `base` - Base Mainnet
- `polygon` - Polygon Mainnet
- `arbitrum` - Arbitrum Mainnet

### 3. Deploy Contracts

```bash
# Deploy AgentEscrow to Base Sepolia (testnet)
npx hardhat run scripts/deploy-escrow.js --network baseSepolia

# Deploy AgentBounty to Base Sepolia (testnet)
npx hardhat run scripts/deploy-bounty.js --network baseSepolia

# Deploy both to mainnet (use with caution!)
npx hardhat run scripts/deploy-escrow.js --network base
npx hardhat run scripts/deploy-bounty.js --network base
```

## Deployment Output

Each deployment will output:

```json
{
  "network": "baseSepolia",
  "chainId": 84532,
  "contract": "AgentEscrow",
  "address": "0x...",
  "usdcAddress": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "deployer": "0x...",
  "timestamp": "2024-02-08T10:30:00.000Z",
  "txHash": "0x..."
}
```

**Save this output!** You'll need the contract address to interact with it.

## Verification

Contracts are automatically verified on block explorers if you have API keys in `.env`:

```bash
ETHERSCAN_API_KEY=your_key_here
BASESCAN_API_KEY=your_key_here
POLYGONSCAN_API_KEY=your_key_here
ARBISCAN_API_KEY=your_key_here
```

### Manual Verification

If auto-verification fails:

```bash
# AgentEscrow
npx hardhat verify --network baseSepolia ESCROW_ADDRESS USDC_ADDRESS

# AgentBounty
npx hardhat verify --network baseSepolia BOUNTY_ADDRESS USDC_ADDRESS 250
```

## Network Details

### USDC Contract Addresses

The deployment scripts automatically use the correct USDC address:

| Network | USDC Address |
|---------|-------------|
| **Ethereum** | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| **Base** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| **Polygon** | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| **Arbitrum** | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| **Sepolia** | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| **Base Sepolia** | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| **Amoy** | `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582` |
| **Arbitrum Sepolia** | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` |

### RPC Endpoints

Default public RPCs are configured in `hardhat.config.js`. For production, consider:

- [Alchemy](https://www.alchemy.com/)
- [Infura](https://infura.io/)
- [QuickNode](https://www.quicknode.com/)

## Interacting with Deployed Contracts

### Using Hardhat Console

```bash
npx hardhat console --network baseSepolia
```

```javascript
// Get contract instance
const AgentEscrow = await ethers.getContractFactory("AgentEscrow");
const escrow = AgentEscrow.attach("YOUR_DEPLOYED_ADDRESS");

// Create escrow
await escrow.createEscrow(
  "0xBuyerAddress",
  "0xSellerAddress",
  ethers.utils.parseUnits("100", 6), // 100 USDC
  86400, // 24 hours
  "Purchase #123"
);
```

### Using JavaScript

```javascript
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const escrowABI = require("./artifacts/contracts/AgentEscrow.sol/AgentEscrow.json").abi;
const escrow = new ethers.Contract("YOUR_DEPLOYED_ADDRESS", escrowABI, wallet);

// Create escrow
const tx = await escrow.createEscrow(
  "0xBuyerAddress",
  "0xSellerAddress",
  ethers.utils.parseUnits("100", 6),
  86400,
  "Purchase #123"
);
await tx.wait();
```

## Gas Estimates

Approximate gas costs (Base Sepolia, 2024):

| Operation | Gas Used | Cost (ETH) |
|-----------|----------|------------|
| Deploy AgentEscrow | ~800,000 | ~$0.01 |
| Deploy AgentBounty | ~850,000 | ~$0.01 |
| Create Escrow | ~150,000 | <$0.01 |
| Release Escrow | ~80,000 | <$0.01 |
| Create Bounty | ~120,000 | <$0.01 |
| Submit Work | ~90,000 | <$0.01 |

*Gas costs vary by network and congestion*

## Security Checklist

Before mainnet deployment:

- [ ] Audit smart contracts (consider professional audit for production)
- [ ] Test all functions on testnet
- [ ] Verify USDC address for target network
- [ ] Secure private key (hardware wallet recommended)
- [ ] Set appropriate platform fees (AgentBounty)
- [ ] Configure fee recipient address
- [ ] Test with small amounts first
- [ ] Enable contract verification on block explorer
- [ ] Document contract addresses for team

## Multi-Chain Deployment

Deploy to all networks at once:

```bash
#!/bin/bash
# deploy-all-testnets.sh

networks=("sepolia" "baseSepolia" "amoy" "arbitrumSepolia")

for network in "${networks[@]}"; do
  echo "Deploying to $network..."
  npx hardhat run scripts/deploy-escrow.js --network "$network"
  npx hardhat run scripts/deploy-bounty.js --network "$network"
  echo "✅ $network complete"
  echo ""
done
```

## Troubleshooting

### "Insufficient funds for gas"
- Ensure deployer wallet has native tokens (ETH, MATIC, etc.)
- For testnets, use faucets: `npm run faucet`

### "USDC address not configured"
- Check network name matches `hardhat.config.js`
- Verify network is supported

### "Verification failed"
- Ensure API key is set in `.env`
- Try manual verification command
- Wait a few minutes and retry

### "Network not recognized"
- Check `--network` flag spelling
- Verify network is configured in `hardhat.config.js`

## Support

- **GitHub Issues**: https://github.com/Ridwannurudeen/usdc-agent-wallet/issues
- **Moltbook**: https://moltbook.com/u/Gudman
- **Documentation**: See `contracts/README.md`

## Next Steps

After deployment:

1. **Save contract addresses** in secure location
2. **Update documentation** with production addresses
3. **Configure agent** to use deployed contracts
4. **Monitor transactions** on block explorer
5. **Set up monitoring** for production contracts

---

**Ready to deploy!** Start with testnets, then move to mainnet when ready. 🚀
