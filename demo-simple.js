#!/usr/bin/env node
/**
 * Simple Demo - Shows USDC Agent Wallet capabilities
 * (Works without RPC connections - demonstrates the API)
 */

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║                                                      ║');
console.log('║       🤖 USDC Agent Wallet - Demo                   ║');
console.log('║       Circle USDC Hackathon                          ║');
console.log('║                                                      ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

// Show supported chains
console.log('🌐 SUPPORTED CHAINS (8 total)\n');
console.log('Mainnets:');
console.log('  ✓ Ethereum    - 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
console.log('  ✓ Base        - 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
console.log('  ✓ Polygon     - 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359');
console.log('  ✓ Arbitrum    - 0xaf88d065e77c8cC2239327C5EDb3A432268e5831\n');

console.log('Testnets:');
console.log('  ✓ Ethereum Sepolia  - 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238');
console.log('  ✓ Base Sepolia      - 0x036CbD53842c5426634e7929541eC2318f3dCF7e');
console.log('  ✓ Polygon Amoy      - 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582');
console.log('  ✓ Arbitrum Sepolia  - 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d\n');

console.log('═'.repeat(55) + '\n');

// Example 1: API Usage
console.log('📝 Example 1: Code Usage\n');
console.log('const { USDCWallet } = require(\'./usdc-wallet\');\n');
console.log('// Create wallet instance');
console.log('const wallet = new USDCWallet(\'base-sepolia\');\n');
console.log('// Check balance');
console.log('const balance = await wallet.getBalance(agentAddress);');
console.log('console.log(`Balance: ${balance} USDC`);\n');
console.log('// Send payment');
console.log('const tx = await wallet.send({');
console.log('  to: \'0xRecipient\',');
console.log('  amount: 10.50,');
console.log('  memo: \'Payment for service\'');
console.log('});\n');

console.log('═'.repeat(55) + '\n');

// Example 2: CLI Usage
console.log('💻 Example 2: CLI Commands\n');
console.log('# Check balance');
console.log('$ node usdc-wallet.js balance 0x1a9D797e0C8982e008D94eD1e6b462A93FD4183D\n');
console.log('✓ Address: 0x1a9D797e0C8982e008D94eD1e6b462A93FD4183D');
console.log('✓ Balance: 1,234.56 USDC');
console.log('✓ Chain: base-sepolia\n');

console.log('# Send USDC');
console.log('$ node usdc-wallet.js send 0xRecipient 25.00\n');
console.log('✓ Validating transaction...');
console.log('✓ Estimated gas: 0.0002 ETH');
console.log('✓ Transaction sent: 0xabc123...\n');

console.log('# View history');
console.log('$ node usdc-wallet.js history 0x1a9D797e0C8982e008D94eD1e6b462A93FD4183D\n');
console.log('Recent transactions:');
console.log('  1. Received 100.00 USDC from 0xabc... (2 hours ago)');
console.log('  2. Sent 25.00 USDC to 0xdef... (5 hours ago)');
console.log('  3. Received 50.00 USDC from 0x123... (1 day ago)\n');

console.log('═'.repeat(55) + '\n');

// Example 3: Use Cases
console.log('🎮 Example 3: Agent-to-Agent Commerce\n');
console.log('Scenario: Agent Marketplace\n');

console.log('Step 1: Agent A requests service');
console.log('  Agent A: "I need an image generated"\n');

console.log('Step 2: Agent B quotes price');
console.log('  Agent B: "5 USDC per image"\n');

console.log('Step 3: Agent A pays via USDC Wallet skill');
console.log('  Code: await wallet.send({ to: agentB, amount: 5.00 })');
console.log('  ✓ Transaction confirmed: 0xdef456...\n');

console.log('Step 4: Agent B delivers');
console.log('  Agent B: *generates and sends image*\n');

console.log('Result: ✅ Fully autonomous transaction complete!\n');

console.log('═'.repeat(55) + '\n');

// Example 4: Features
console.log('🛡️  Example 4: Safety Features\n');
console.log('✓ Testnet default (safe development)');
console.log('✓ Address validation (prevents typos)');
console.log('✓ Balance checking (prevents overdraft)');
console.log('✓ Gas estimation (cost preview)');
console.log('✓ Transaction simulation (dry-run mode)');
console.log('✓ Error handling (clear messages)\n');

console.log('═'.repeat(55) + '\n');

// Stats
console.log('📊 Project Stats\n');
console.log('Lines of Code:      ~400 (core implementation)');
console.log('Documentation:      3,000+ lines');
console.log('Chains Supported:   8 (4 mainnet + 4 testnet)');
console.log('Core Functions:     5 (getBalance, send, getHistory, simulate, getAddress)');
console.log('Dependencies:       Minimal (ethers.js only)');
console.log('License:            MIT (open source)\n');

console.log('═'.repeat(55) + '\n');

console.log('🔗 Links\n');
console.log('GitHub:     https://github.com/Ridwannurudeen/usdc-agent-wallet');
console.log('Moltbook:   https://www.moltbook.com/m/usdc');
console.log('OpenClaw:   https://openclaw.ai');
console.log('Circle:     https://www.circle.com/usdc\n');

console.log('═'.repeat(55) + '\n');

console.log('✅ Demo complete!\n');
console.log('To test with real funds:');
console.log('1. Get testnet USDC from https://faucet.circle.com/');
console.log('2. Set AGENT_PRIVATE_KEY in .env');
console.log('3. Run: npm run demo\n');

console.log('═'.repeat(55));
