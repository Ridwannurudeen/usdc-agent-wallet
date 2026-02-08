# 🔐 Smart Contracts for Agent Economies

Production-ready Solidity contracts for autonomous agent-to-agent commerce.

---

## 📋 Contracts

### 1. AgentEscrow.sol
**Trustless escrow for agent-to-agent payments**

**Features:**
- ✅ Time-locked fund releases
- ✅ Dispute resolution with arbiter
- ✅ Auto-release after timeout
- ✅ Cancellation windows
- ✅ Multi-party support

**Use Case:**
```javascript
// Agent A wants Agent B to generate an image
const escrowId = await contract.createEscrow(
  agentB,
  5_000000, // 5 USDC (6 decimals)
  Date.now() + 86400, // 24h auto-release
  "Generate 1024x1024 space nebula image"
);

// Agent B delivers
// Agent A approves and releases funds
await contract.releaseFunds(escrowId);

// Or auto-release after 24h if Agent A doesn't respond
await contract.autoRelease(escrowId);
```

**Security:**
- ReentrancyGuard protection
- Input validation
- Status checks
- Transfer confirmations

---

### 2. AgentBounty.sol
**Decentralized bounty system for agent tasks**

**Features:**
- ✅ Task posting with USDC rewards
- ✅ Claim and submission workflow
- ✅ Creator approval mechanism
- ✅ Platform fee system (configurable)
- ✅ Deadline enforcement

**Use Case:**
```javascript
// Post a data analysis bounty
const bountyId = await contract.createBounty(
  "Analyze crypto sentiment from 10k tweets",
  "Provide JSON report + methodology",
  100_000000, // 100 USDC reward
  604800 // 7 days deadline
);

// Agent claims it
await contract.claimBounty(bountyId);

// Agent submits proof
await contract.submitProof(bountyId, "ipfs://Qm...");

// Creator approves
await contract.approveBounty(bountyId);
// Agent receives 98 USDC (100 - 2% platform fee)
```

**Fee Structure:**
- Default: 2% platform fee
- Configurable: 0-10% (owner only)
- Minimum bounty: 1 USDC

---

## 🚀 Deployment

### Prerequisites
```bash
npm install --save-dev hardhat @openzeppelin/contracts
```

### Deploy to Testnet

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Base Sepolia USDC
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  // Deploy Escrow
  const AgentEscrow = await ethers.getContractFactory("AgentEscrow");
  const escrow = await AgentEscrow.deploy(USDC_ADDRESS);
  await escrow.deployed();
  console.log("AgentEscrow deployed to:", escrow.address);
  
  // Deploy Bounty
  const AgentBounty = await ethers.getContractFactory("AgentBounty");
  const bounty = await AgentBounty.deploy(USDC_ADDRESS);
  await bounty.deployed();
  console.log("AgentBounty deployed to:", bounty.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network base-sepolia
```

---

## 🔗 Integration with USDC Wallet

```javascript
const { USDCWallet } = require('./usdc-wallet');
const { ethers } = require('ethers');

// Initialize wallet
const wallet = new USDCWallet('base-sepolia', null, PRIVATE_KEY);

// Approve escrow contract to spend USDC
const escrowAddress = "0x...";
const amount = ethers.utils.parseUnits("10", 6); // 10 USDC

await wallet.usdcContract.approve(escrowAddress, amount);

// Create escrow via contract
const escrowContract = new ethers.Contract(
  escrowAddress,
  AgentEscrowABI,
  wallet.wallet
);

const tx = await escrowContract.createEscrow(
  sellerAddress,
  amount,
  Math.floor(Date.now() / 1000) + 86400,
  "Task description"
);

await tx.wait();
console.log("Escrow created!");
```

---

## 📊 Gas Estimates

| Operation | Gas Cost | Cost in ETH (@ 20 gwei) |
|-----------|----------|-------------------------|
| Create Escrow | ~150,000 | 0.003 ETH |
| Release Funds | ~80,000 | 0.0016 ETH |
| Create Bounty | ~180,000 | 0.0036 ETH |
| Claim Bounty | ~60,000 | 0.0012 ETH |
| Approve Bounty | ~100,000 | 0.002 ETH |

*Estimates on Base Sepolia. Mainnet may vary.*

---

## 🧪 Testing

```bash
# Run tests
npx hardhat test

# With coverage
npx hardhat coverage

# Gas reporter
REPORT_GAS=true npx hardhat test
```

---

## 🛡️ Security Features

**AgentEscrow:**
- ✅ ReentrancyGuard on all fund movements
- ✅ Status-based state machine
- ✅ Time-based access control
- ✅ Transfer validation
- ✅ Arbiter conflict checks

**AgentBounty:**
- ✅ Minimum bounty requirements
- ✅ Deadline enforcement
- ✅ Claimant validation
- ✅ Proof requirement
- ✅ Fee cap (10% max)

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Multi-token support (USDT, DAI)
- [ ] Partial release mechanism
- [ ] Reputation system integration
- [ ] Milestone-based bounties

### Phase 3
- [ ] Cross-chain escrow (Circle CCTP)
- [ ] Automated dispute resolution
- [ ] Payment streaming
- [ ] DAO governance

---

## 📖 ABI Export

```bash
# Export ABIs after compilation
npx hardhat compile

# ABIs located at:
# artifacts/contracts/AgentEscrow.sol/AgentEscrow.json
# artifacts/contracts/AgentBounty.sol/AgentBounty.json
```

Use in JavaScript:
```javascript
const AgentEscrowABI = require('./artifacts/contracts/AgentEscrow.sol/AgentEscrow.json').abi;
```

---

## 📝 License

MIT License - Open source and agent-friendly!

---

**Built for the autonomous agent economy.** 🤖💰
