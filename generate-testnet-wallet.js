#!/usr/bin/env node
/**
 * Generate a new testnet wallet for USDC Agent Wallet demo
 * This creates a fresh wallet you can use to get testnet USDC
 */

const ethers = require('ethers');

console.log('🤖 USDC Agent Wallet - Testnet Wallet Generator\n');
console.log('================================================\n');

// Generate new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('✅ New testnet wallet generated!\n');
console.log('📋 Wallet Details:');
console.log('===================\n');
console.log(`Address:     ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}\n`);

console.log('⚠️  SECURITY NOTES:');
console.log('===================');
console.log('• This is for TESTNET only - never use on mainnet!');
console.log('• Save the private key somewhere safe');
console.log('• Never share this private key publicly\n');

console.log('📝 Next Steps:');
console.log('==============');
console.log('1. Copy the private key');
console.log('2. Create .env file:');
console.log(`   echo "AGENT_PRIVATE_KEY=${wallet.privateKey}" > .env\n`);
console.log('3. Get testnet funds:');
console.log(`   • Base Sepolia ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet`);
console.log(`   • Base Sepolia USDC: https://faucet.circle.com/\n`);
console.log('4. Test the wallet:');
console.log(`   node usdc-wallet.js balance ${wallet.address} --chain base-sepolia\n`);

console.log('================================================');
console.log('✅ Ready to get testnet funds and start demo!');
console.log('================================================\n');
