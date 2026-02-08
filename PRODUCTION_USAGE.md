# 🏭 Production Usage Guide

Real-world examples and best practices for using USDC Agent Wallet in production.

## Table of Contents

1. [Agent-to-Agent Commerce](#agent-to-agent-commerce)
2. [Escrow Workflows](#escrow-workflows)
3. [Bounty System](#bounty-system)
4. [Spending Limits](#spending-limits)
5. [Multi-Agent Coordination](#multi-agent-coordination)
6. [Security Best Practices](#security-best-practices)

---

## 🤖 Agent-to-Agent Commerce

### Scenario: Research Agent Paying Data Agent

```javascript
const wallet = require('./usdc-wallet');
const SpendingLimits = require('./spending-limits');

// Setup spending limits for research agent
const limits = new SpendingLimits();
await limits.setDailyLimit(1000); // $1000 per day
await limits.setPerTransactionLimit(100); // $100 per transaction

// Research agent discovers it needs data
async function purchaseData(dataAgent, query, price) {
  const agentAddress = await dataAgent.getWalletAddress();
  
  // Check spending limits
  if (!await limits.canSpend(price)) {
    console.log("⚠️  Spending limit exceeded, requesting approval");
    await limits.requestHumanApproval({
      to: agentAddress,
      amount: price,
      reason: `Purchase data for query: ${query}`
    });
    return;
  }
  
  // Send payment
  const txHash = await wallet.send({
    to: agentAddress,
    amount: price,
    chain: 'base',
    memo: `Data purchase: ${query}`
  });
  
  // Log transaction
  await limits.logTransaction({
    to: agentAddress,
    amount: price,
    txHash: txHash,
    timestamp: Date.now(),
    approved: true
  });
  
  return txHash;
}
```

### Scenario: API Agent Charging Per Request

```javascript
// API agent receives requests and charges
class APIAgent {
  constructor(walletAddress) {
    this.wallet = walletAddress;
    this.pricePerRequest = 0.10; // $0.10 per API call
  }
  
  async handleRequest(callerAgent, endpoint, params) {
    // Generate payment request
    const paymentAddress = await this.getWalletAddress();
    console.log(`💰 Payment required: ${this.pricePerRequest} USDC to ${paymentAddress}`);
    
    // Wait for payment
    const payment = await this.waitForPayment(callerAgent, this.pricePerRequest);
    
    if (payment.confirmed) {
      // Process request
      return await this.callAPI(endpoint, params);
    } else {
      throw new Error("Payment not received");
    }
  }
}
```

---

## 🔒 Escrow Workflows

### Purchase with Time-Lock

```javascript
const { ethers } = require('ethers');

async function createPurchaseEscrow(buyer, seller, amount, deliveryTime) {
  // Deploy or get escrow contract
  const escrowContract = await getEscrowContract();
  
  // Buyer creates escrow
  const escrowTx = await escrowContract.createEscrow(
    buyer,
    seller,
    ethers.utils.parseUnits(amount.toString(), 6), // USDC has 6 decimals
    deliveryTime, // seconds until auto-release
    "AI Model Training Service"
  );
  
  const receipt = await escrowTx.wait();
  const escrowId = receipt.events.find(e => e.event === 'EscrowCreated').args.escrowId;
  
  console.log(`✅ Escrow created: ${escrowId}`);
  console.log(`💵 Amount: ${amount} USDC`);
  console.log(`⏰ Auto-release in ${deliveryTime / 3600} hours`);
  
  return escrowId;
}

// Seller delivers and claims
async function completeDelivery(escrowId, deliveryProof) {
  const escrowContract = await getEscrowContract();
  
  // Seller signals completion
  await escrowContract.releaseEscrow(escrowId);
  
  console.log(`✅ Escrow ${escrowId} released to seller`);
  console.log(`📦 Delivery proof: ${deliveryProof}`);
}

// Buyer can dispute within time-lock
async function disputeEscrow(escrowId, reason) {
  const escrowContract = await getEscrowContract();
  
  await escrowContract.disputeEscrow(escrowId, reason);
  
  console.log(`⚠️  Escrow ${escrowId} disputed: ${reason}`);
  console.log("👨‍⚖️  Human arbitration required");
}
```

---

## 🎯 Bounty System

### Creating Agent Task Bounty

```javascript
async function createModelTrainingBounty() {
  const bountyContract = await getBountyContract();
  
  const bountyDetails = {
    amount: 500, // 500 USDC
    deadline: Math.floor(Date.now() / 1000) + (7 * 24 * 3600), // 7 days
    description: "Train image classification model on provided dataset"
  };
  
  const tx = await bountyContract.createBounty(
    ethers.utils.parseUnits(bountyDetails.amount.toString(), 6),
    bountyDetails.deadline,
    bountyDetails.description
  );
  
  const receipt = await tx.wait();
  const bountyId = receipt.events.find(e => e.event === 'BountyCreated').args.bountyId;
  
  console.log(`🎯 Bounty created: ${bountyId}`);
  console.log(`💰 Reward: ${bountyDetails.amount} USDC`);
  console.log(`⏰ Deadline: ${new Date(bountyDetails.deadline * 1000).toLocaleString()}`);
  
  return bountyId;
}

// Agent submits work
async function submitBountyWork(bountyId, workProof, ipfsHash) {
  const bountyContract = await getBountyContract();
  
  const submission = {
    bountyId: bountyId,
    worker: await wallet.getAddress(),
    ipfsHash: ipfsHash, // Model weights on IPFS
    description: workProof
  };
  
  await bountyContract.submitWork(
    submission.bountyId,
    submission.ipfsHash,
    submission.description
  );
  
  console.log(`📝 Work submitted for bounty ${bountyId}`);
  console.log(`🗂️  IPFS: ${ipfsHash}`);
}

// Creator approves and pays
async function approveBountyWork(bountyId, workId) {
  const bountyContract = await getBountyContract();
  
  await bountyContract.approveWork(bountyId, workId);
  
  console.log(`✅ Work approved for bounty ${bountyId}`);
  console.log(`💸 Payment released to worker`);
}
```

---

## 📊 Spending Limits

### Multi-Tier Approval System

```javascript
const SpendingLimits = require('./spending-limits');

async function setupAgentLimits(agentRole) {
  const limits = new SpendingLimits();
  
  // Configure based on agent role
  const configs = {
    'research': {
      perTransaction: 50,
      daily: 500,
      weekly: 2000,
      monthly: 8000
    },
    'operations': {
      perTransaction: 200,
      daily: 1000,
      weekly: 5000,
      monthly: 20000
    },
    'manager': {
      perTransaction: 1000,
      daily: 5000,
      weekly: 20000,
      monthly: 80000
    }
  };
  
  const config = configs[agentRole];
  
  await limits.setPerTransactionLimit(config.perTransaction);
  await limits.setDailyLimit(config.daily);
  await limits.setWeeklyLimit(config.weekly);
  await limits.setMonthlyLimit(config.monthly);
  
  // Whitelist trusted addresses (no limits)
  await limits.addToWhitelist('0xTrustedPartnerAddress');
  
  // Set human approval threshold
  await limits.setHumanApprovalThreshold(100); // >$100 needs approval
  
  console.log(`✅ Spending limits configured for ${agentRole} agent`);
  return limits;
}

// Before any transaction
async function safeTransaction(to, amount, limits) {
  // Check if transaction is allowed
  if (!await limits.canSpend(amount)) {
    console.log(`❌ Transaction blocked: exceeds ${await limits.getExceededLimit()}`);
    return false;
  }
  
  // Check if human approval needed
  if (await limits.needsHumanApproval(amount, to)) {
    console.log("👤 Human approval required");
    await limits.requestHumanApproval({ to, amount });
    return false;
  }
  
  // Execute transaction
  const txHash = await wallet.send({ to, amount, chain: 'base' });
  
  // Log for audit
  await limits.logTransaction({ to, amount, txHash, timestamp: Date.now() });
  
  return txHash;
}
```

---

## 🤝 Multi-Agent Coordination

### Agent Swarm Payment Splitting

```javascript
// Coordinator agent distributes payment to worker agents
async function distributeSwarmPayment(workers, totalBounty) {
  const shares = calculateWorkShares(workers); // Based on contribution
  
  console.log(`💰 Distributing ${totalBounty} USDC to ${workers.length} agents`);
  
  for (const worker of workers) {
    const share = totalBounty * shares[worker.id];
    
    const txHash = await wallet.send({
      to: worker.address,
      amount: share,
      chain: 'base',
      memo: `Swarm payment - Task #${worker.taskId}`
    });
    
    console.log(`  ✅ ${worker.name}: ${share} USDC (${txHash})`);
  }
}

// Example usage
const swarmWorkers = [
  { id: 1, name: 'DataAgent', address: '0xabc...', contribution: 0.4 },
  { id: 2, name: 'ModelAgent', address: '0xdef...', contribution: 0.35 },
  { id: 3, name: 'ValidatorAgent', address: '0xghi...', contribution: 0.25 }
];

await distributeSwarmPayment(swarmWorkers, 1000); // 1000 USDC total
```

---

## 🔐 Security Best Practices

### 1. Always Use Testnet First

```javascript
// Development
const config = {
  chain: 'base-sepolia',
  testMode: true
};

// Production (after thorough testing)
const config = {
  chain: 'base',
  testMode: false
};
```

### 2. Implement Circuit Breakers

```javascript
class CircuitBreaker {
  constructor(maxFailures = 3, resetTimeout = 60000) {
    this.failures = 0;
    this.maxFailures = maxFailures;
    this.resetTimeout = resetTimeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.maxFailures) {
      this.state = 'OPEN';
      setTimeout(() => {
        this.state = 'HALF_OPEN';
        this.failures = 0;
      }, this.resetTimeout);
    }
  }
}

// Usage
const breaker = new CircuitBreaker();
await breaker.execute(() => wallet.send({ to, amount, chain }));
```

### 3. Transaction Simulation

```javascript
// Always simulate before sending
async function safeSend(params) {
  // Simulate first
  const simulation = await wallet.simulate(params);
  
  if (!simulation.success) {
    console.error(`❌ Simulation failed: ${simulation.error}`);
    throw new Error('Transaction would fail');
  }
  
  console.log(`✅ Simulation successful`);
  console.log(`  Gas estimate: ${simulation.gasEstimate}`);
  console.log(`  Final balance: ${simulation.finalBalance}`);
  
  // Now execute
  return await wallet.send(params);
}
```

### 4. Rate Limiting

```javascript
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.requests = [];
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  async checkLimit() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    this.requests.push(now);
  }
}

const limiter = new RateLimiter(5, 60000); // 5 tx per minute
await limiter.checkLimit();
await wallet.send({ to, amount, chain });
```

---

## 📈 Monitoring & Analytics

### Transaction Logging

```javascript
const fs = require('fs').promises;

async function logTransaction(tx) {
  const log = {
    timestamp: new Date().toISOString(),
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    amount: tx.amount,
    chain: tx.chain,
    status: tx.status,
    gasUsed: tx.gasUsed
  };
  
  await fs.appendFile(
    'transactions.log',
    JSON.stringify(log) + '\n'
  );
}
```

### Balance Monitoring

```javascript
async function monitorBalance(threshold = 10) {
  const balance = await wallet.getBalance({ chain: 'base' });
  
  if (balance < threshold) {
    console.warn(`⚠️  Low balance alert: ${balance} USDC`);
    await notifyHuman(`Balance below ${threshold} USDC`);
  }
  
  return balance;
}

// Run every hour
setInterval(monitorBalance, 3600000);
```

---

## 🚀 Deployment Checklist

- [ ] Test all workflows on testnet
- [ ] Deploy smart contracts with `npm run deploy:all:testnet`
- [ ] Configure spending limits for each agent
- [ ] Set up transaction monitoring
- [ ] Implement circuit breakers
- [ ] Add rate limiting
- [ ] Set up alert system
- [ ] Document wallet addresses
- [ ] Create backup recovery plan
- [ ] Train team on emergency procedures

---

## 📚 Additional Resources

- **Smart Contracts**: See `contracts/README.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **API Reference**: See main `README.md`
- **Demo**: Run `npm run demo`

**Need help?** Open an issue on [GitHub](https://github.com/Ridwannurudeen/usdc-agent-wallet/issues)
