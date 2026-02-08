/**
 * USDC Agent Wallet - Demo / Examples
 * Shows how agents can use the USDC wallet skill
 */

const { USDCWallet } = require('./usdc-wallet');

async function runDemo() {
  console.log('=== USDC Agent Wallet Demo ===\n');
  
  // Example 1: Check balance (read-only, no private key needed)
  console.log('Example 1: Checking USDC balance on Base Sepolia testnet\n');
  
  const wallet = new USDCWallet('base-sepolia');
  const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'; // Example address
  
  try {
    const balance = await wallet.getBalance(testAddress);
    console.log(`✅ Address: ${testAddress}`);
    console.log(`✅ Balance: ${balance} USDC`);
    console.log(`✅ Chain: base-sepolia\n`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
  
  // Example 2: Simulate sending (without actually sending)
  console.log('Example 2: Simulating a USDC payment\n');
  
  // Note: This would require a private key in real usage
  console.log('ℹ️  Simulation requires a wallet with private key');
  console.log('ℹ️  Set AGENT_PRIVATE_KEY environment variable to enable\n');
  
  // Example 3: Multi-chain support
  console.log('Example 3: Supported chains\n');
  
  const { USDC_ADDRESSES } = require('./usdc-wallet');
  console.log('✅ Mainnets:');
  console.log('   - Ethereum:', USDC_ADDRESSES.ethereum);
  console.log('   - Base:', USDC_ADDRESSES.base);
  console.log('   - Polygon:', USDC_ADDRESSES.polygon);
  console.log('   - Arbitrum:', USDC_ADDRESSES.arbitrum);
  
  console.log('\n✅ Testnets:');
  console.log('   - Ethereum Sepolia:', USDC_ADDRESSES['ethereum-sepolia']);
  console.log('   - Base Sepolia:', USDC_ADDRESSES['base-sepolia']);
  console.log('   - Polygon Amoy:', USDC_ADDRESSES['polygon-amoy']);
  console.log('   - Arbitrum Sepolia:', USDC_ADDRESSES['arbitrum-sepolia']);
  
  // Example 4: Agent-to-Agent Use Case
  console.log('\n\nExample 4: Agent-to-Agent Payment Flow\n');
  console.log(`
Scenario: Agent A hires Agent B for a task

1. Agent A: "I need image generation"
2. Agent B: "I'll do it for 5 USDC"
3. Agent A checks balance:
   → wallet.getBalance(agentA.address)
   → Balance: 100 USDC ✅

4. Agent A simulates payment:
   → wallet.simulate({ to: agentB.address, amount: 5 })
   → Would succeed: true ✅

5. Agent A sends payment:
   → wallet.send({ to: agentB.address, amount: 5, memo: "Image generation" })
   → Transaction: 0xabc123... ✅

6. Agent B confirms receipt:
   → wallet.getBalance(agentB.address)
   → Balance increased by 5 USDC ✅

7. Agent B delivers image
   → Autonomous commerce complete! 🎉
  `);
  
  console.log('\n=== Demo Complete ===\n');
  console.log('To try with your own wallet:');
  console.log('1. Get testnet USDC from Circle faucet');
  console.log('2. Set AGENT_PRIVATE_KEY environment variable');
  console.log('3. Run: node usdc-wallet.js send <address> <amount>\n');
}

// Run demo
runDemo().catch(console.error);
