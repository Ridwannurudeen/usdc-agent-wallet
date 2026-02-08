# 🪙 Get Testnet Funds - Quick Guide

## Step 1: Get Base Sepolia ETH (for gas)

### Option A: Base Sepolia Faucet
**URL:** https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

1. Visit faucet
2. Connect wallet or paste address
3. Request testnet ETH
4. Wait ~30 seconds

### Option B: Alchemy Faucet
**URL:** https://sepoliafaucet.com/

1. Sign in with Alchemy account (free)
2. Enter your wallet address
3. Select "Base Sepolia"
4. Request ETH

### Option C: QuickNode Faucet
**URL:** https://faucet.quicknode.com/base/sepolia

1. Enter wallet address
2. Complete CAPTCHA
3. Receive 0.05 ETH

## Step 2: Get Base Sepolia USDC

### Circle Testnet Faucet
**URL:** https://faucet.circle.com/

1. Visit Circle's testnet faucet
2. Select "Base Sepolia" network
3. Enter your wallet address
4. Request testnet USDC (usually gives 10-100 USDC)
5. Transaction completes in ~10 seconds

### Alternative: Aave Faucet
**URL:** https://staging.aave.com/faucet/

1. Connect wallet (must be on Base Sepolia)
2. Mint testnet USDC
3. Approve + mint (may need testnet ETH first)

## Step 3: Verify You Have Funds

```bash
# Check ETH balance (for gas)
node usdc-wallet.js balance YOUR_ADDRESS --chain base-sepolia

# The wallet script will show:
# - ETH balance (should be >0)
# - USDC balance (should show your testnet USDC)
```

## Your Wallet Address

To get your wallet address from private key:

```bash
# If you have AGENT_PRIVATE_KEY in .env
node -e "const ethers = require('ethers'); const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY); console.log('Address:', wallet.address)"
```

Or generate a new testnet wallet:

```bash
# Create new wallet for testing
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private key:', wallet.privateKey)"
```

## Quick Test Address

For read-only testing (no sending), use this address with some testnet USDC:
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

Check balance:
```bash
node usdc-wallet.js balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --chain base-sepolia
```

## ⏱️ Time Estimate

- Get ETH faucet: 2-3 minutes
- Get USDC faucet: 2-3 minutes
- Verify balances: 1 minute
- **Total: ~5-10 minutes**

## 🎯 Next: Run Live Demo

Once you have testnet funds:

```bash
# 1. Set up your wallet
echo "AGENT_PRIVATE_KEY=your_private_key_here" > .env

# 2. Run demo
npm run demo

# 3. Test CLI commands
node usdc-wallet.js balance YOUR_ADDRESS
node usdc-wallet.js send RECIPIENT_ADDRESS 5.0

# 4. Screenshot everything!
```

## 📸 Screenshots to Capture

1. ✅ Successful balance check
2. ✅ Sending USDC transaction
3. ✅ Transaction confirmation
4. ✅ Transaction history
5. ✅ Etherscan/Basescan link showing the tx

## Need Help?

If faucets don't work:
- Try different browser (disable ad blockers)
- Use VPN if region-restricted
- Ask in Base Discord: discord.gg/buildonbase
- Circle Dev Discord: discord.gg/circle

---

**Status:** Ready to get testnet funds and run live demo! ✅
