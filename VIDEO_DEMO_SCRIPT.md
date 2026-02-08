# 🎬 Video Demo Script

Complete recording guide for creating a compelling demo video (3-5 minutes).

## 📋 Pre-Recording Checklist

- [ ] Install dependencies: `npm install`
- [ ] Terminal with clear font (16pt+ recommended)
- [ ] Screen recording software ready (OBS, QuickTime, etc.)
- [ ] Testnet wallet funded (use `npm run faucet` if needed)
- [ ] Clear desktop background
- [ ] Close unnecessary applications
- [ ] Test microphone levels

## 🎯 Demo Structure (3-5 minutes)

### Intro (15 seconds)
"Hi, I'm demonstrating the USDC Agent Wallet - a production-ready system that lets AI agents handle USDC payments autonomously, safely, and across 8 blockchain networks."

### Part 1: Simple Payment (45 seconds)

**Show:** Basic send transaction

```bash
# Terminal recording
cd usdc-hackathon
npm run demo
```

**Voice-over while demo runs:**
"Here's the simplest use case - an AI agent checking its balance and sending USDC. Notice it's using Base Sepolia testnet by default. Safety first."

**Points to highlight:**
- Real-time balance checking
- Transaction simulation before sending
- Transaction hash and block explorer link
- Multi-chain support (8 networks)

### Part 2: Spending Limits (60 seconds)

**Show:** Spending control system

```bash
node -e "
const SpendingLimits = require('./spending-limits');
const limits = new SpendingLimits();

(async () => {
  // Set daily limit
  await limits.setDailyLimit(1000);
  console.log('✅ Daily limit set: $1000');
  
  // Check if transaction allowed
  const canSpend = await limits.canSpend(50);
  console.log('Can spend $50?', canSpend);
  
  // Try exceeding limit
  const exceedsLimit = await limits.canSpend(1500);
  console.log('Can spend $1500?', exceedsLimit);
  
  // Show usage
  const usage = await limits.getUsage();
  console.log('Daily usage:', usage);
})();
"
```

**Voice-over:**
"But agents shouldn't have unlimited spending power. This system includes comprehensive spending limits - per transaction, daily, weekly, and monthly caps. Transactions exceeding the limits are automatically blocked."

**Points to highlight:**
- Multiple limit types
- Real-time limit checking
- Usage tracking
- Human approval thresholds

### Part 3: Smart Contracts (90 seconds)

**Show:** Contract deployment and usage

```bash
# Show contract files
cat contracts/AgentEscrow.sol | head -n 30
echo ""
echo "=== Key Features ==="
grep -A 3 "function createEscrow" contracts/AgentEscrow.sol
```

**Voice-over:**
"For complex transactions, we've built production-grade smart contracts. The escrow contract enables secure agent-to-agent commerce with time-locks, dispute resolution, and automatic fund release."

**Visual:** Open contract file in editor, scroll through key functions

**Show:** Bounty contract

```bash
cat contracts/AgentBounty.sol | head -n 30
echo ""
echo "=== Bounty System ==="
grep -A 3 "function createBounty" contracts/AgentBounty.sol
```

**Voice-over:**
"The bounty system lets agents post tasks with USDC rewards. Other agents can compete to complete the work, with platform fees automatically collected."

**Points to highlight:**
- ReentrancyGuard protection
- Time-lock mechanisms
- Dispute resolution
- Platform fee collection
- Multi-party coordination

### Part 4: Real-World Use Case (45 seconds)

**Visual:** Show architecture diagram or draw on screen

**Voice-over:**
"Imagine this scenario: A research agent needs data. It finds a data agent offering that information for 10 USDC. The research agent:

1. Checks its spending limits - approved
2. Creates an escrow with a 24-hour time-lock
3. Data agent delivers the dataset
4. Escrow automatically releases payment
5. Both agents continue their work - no human intervention needed

This is autonomous agent economy in action."

**Visual:** Could use simple animation or just diagram with arrows

### Part 5: Production Features (30 seconds)

**Show:** Documentation and deployment files

```bash
# Show production-ready setup
ls -l contracts/
ls -l scripts/
echo ""
echo "=== Deployment Guide ==="
head -n 20 DEPLOYMENT_GUIDE.md
```

**Voice-over:**
"This isn't just a prototype. It includes:
- Hardhat deployment scripts for all 8 supported networks
- Comprehensive documentation
- Production usage examples
- Security best practices
- Automated contract verification

Everything you need to deploy this today."

### Closing (15 seconds)

**Visual:** Show GitHub repo in browser

**Voice-over:**
"The code is open source, fully documented, and ready to use. Check out the repo for deployment guides, API docs, and more examples. Thanks for watching!"

---

## 🎥 Recording Tips

### Terminal Recording

1. **Font size**: Large and clear (Monaco, Menlo, or Fira Code 16pt+)
2. **Colors**: High contrast terminal theme
3. **Window size**: 120x30 minimum
4. **Speed**: Let commands run naturally, don't speed up artificially
5. **Pause**: 2-3 seconds after each output before next command

### Voice-over Tips

1. **Pace**: Slightly slower than normal conversation
2. **Energy**: Enthusiastic but natural
3. **Clarity**: Emphasize key words (USDC, autonomous, production-ready)
4. **Pauses**: Brief pause before introducing new concepts
5. **Background**: Quiet room, no echo

### Screen Recording Settings

- **Resolution**: 1920x1080 (1080p) minimum
- **Frame rate**: 30 FPS
- **Audio**: 48kHz, stereo
- **Format**: MP4 (H.264)
- **Bitrate**: 5-10 Mbps

---

## 🎬 Alternative: Code Walkthrough (Developer-focused)

If you prefer a code-focused approach:

### Structure

1. **Intro** (15s): "Let's walk through how this works under the hood"

2. **Core Wallet** (60s):
   - Open `usdc-wallet.js`
   - Show `send()` function
   - Explain multi-chain support
   - Show USDC address mapping

3. **Spending Limits** (60s):
   - Open `spending-limits.js`
   - Show limit checking logic
   - Explain allowance system (like ERC-20)
   - Show audit logging

4. **Smart Contracts** (90s):
   - Open `AgentEscrow.sol`
   - Walk through escrow creation
   - Explain time-lock mechanism
   - Show dispute resolution
   - Open `AgentBounty.sol`
   - Explain bounty workflow

5. **Deployment** (30s):
   - Show `deploy-escrow.js`
   - Explain network detection
   - Show USDC address auto-config

6. **Closing** (15s): "All production-ready, all documented, ready to deploy"

---

## 📊 Key Metrics to Mention

- **8 blockchain networks** (4 mainnets + 4 testnets)
- **476 lines** of core wallet code
- **~800 lines** of smart contract code
- **5 core functions**: getBalance, send, getHistory, simulate, getAddress
- **Production-ready**: Hardhat, deployment scripts, documentation
- **Security-first**: Testnet default, spending limits, transaction simulation

---

## 🎯 Call-to-Action Options

**For judges:**
"I'd love your feedback - what other features would make this more useful for real agent systems?"

**For developers:**
"Clone the repo, deploy to testnet in 5 minutes, and let me know what you build with it!"

**For feedback:**
"Check out the live demo on Moltbook and let me know what you think!"

---

## 📱 Social Media Versions

### Twitter/X (30 seconds)

Quick feature showcase:
1. Show balance check (5s)
2. Show send transaction (10s)
3. Show smart contract code (10s)
4. Show GitHub repo (5s)

**Caption**: "Built a production-ready USDC wallet for AI agents. Multi-chain, smart contracts, spending limits. Open source. 🤖💰 #CircleHackathon #USDC"

### LinkedIn (60 seconds)

Professional walkthrough:
1. Problem statement (15s)
2. Solution demo (30s)
3. Production features (10s)
4. Call-to-action (5s)

---

## 🛠️ Automated Recording Script

For a fully automated terminal demo:

```bash
#!/bin/bash
# record-demo.sh

# Clear terminal
clear

# Title
echo "🤖 USDC Agent Wallet Demo"
echo "======================================"
sleep 2

# Part 1: Balance check
echo ""
echo "1️⃣  Checking agent's USDC balance..."
sleep 1
node usdc-wallet.js balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --chain base-sepolia
sleep 3

# Part 2: Send transaction
echo ""
echo "2️⃣  Sending 10 USDC to another agent..."
sleep 1
node demo-simple.js
sleep 5

# Part 3: Show smart contracts
echo ""
echo "3️⃣  Production smart contracts..."
sleep 1
head -n 20 contracts/AgentEscrow.sol
sleep 3

# Done
echo ""
echo "✅ Demo complete! Check out the repo for more."
sleep 2
```

Run with: `bash record-demo.sh`

---

## ✅ Final Checklist

- [ ] Script rehearsed 2-3 times
- [ ] All demos tested and working
- [ ] Terminal readable on recording
- [ ] Audio levels tested
- [ ] Background quiet
- [ ] All windows/tabs closed except demo
- [ ] Demo runs in <5 minutes
- [ ] Clear call-to-action at end
- [ ] GitHub repo URL shown
- [ ] Video exported in high quality

---

**Ready to record!** 🎬

**Tip:** Record multiple takes and choose the best one. First take is rarely perfect.

**Upload to:**
- YouTube (unlisted or public)
- Loom (easy screen + camera)
- Twitter/X (native video)
- Add link to Moltbook submission

Good luck! 🚀
