#!/usr/bin/env node
/**
 * Auto-Faucet Integration for USDC Agent Wallet
 * Automatically requests testnet funds from multiple faucets
 * 
 * Addresses community feedback: "add a sandboxed faucet integration 
 * to speed onboarding for non-developers" - tidekeeper
 */

const { ethers } = require('ethers');

// Faucet endpoints and configurations
const FAUCETS = {
  'base-sepolia': {
    eth: {
      name: 'Coinbase Base Sepolia Faucet',
      method: 'web', // Requires web interaction
      url: 'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet',
      automated: false
    },
    usdc: {
      name: 'Circle USDC Faucet',
      method: 'web',
      url: 'https://faucet.circle.com/',
      automated: false
    }
  },
  'ethereum-sepolia': {
    eth: {
      name: 'Alchemy Sepolia Faucet',
      method: 'api',
      url: 'https://sepoliafaucet.com/',
      automated: false
    }
  }
};

class FaucetManager {
  constructor(chain = 'base-sepolia') {
    this.chain = chain;
    this.faucets = FAUCETS[chain] || {};
  }

  /**
   * Get instructions for manual faucet access
   */
  getInstructions(address) {
    const faucets = this.faucets;
    
    console.log(`\n🚰 Faucet Instructions for ${this.chain}\n`);
    console.log(`Your address: ${address}\n`);
    
    if (faucets.eth) {
      console.log(`━━━ Step 1: Get ${this.chain} ETH (for gas) ━━━`);
      console.log(`Name: ${faucets.eth.name}`);
      console.log(`URL:  ${faucets.eth.url}`);
      console.log(`\n1. Visit the URL above`);
      console.log(`2. Paste your address: ${address}`);
      console.log(`3. Complete CAPTCHA (if required)`);
      console.log(`4. Request ETH`);
      console.log(`5. Wait ~30 seconds for confirmation\n`);
    }
    
    if (faucets.usdc) {
      console.log(`━━━ Step 2: Get ${this.chain} USDC ━━━`);
      console.log(`Name: ${faucets.usdc.name}`);
      console.log(`URL:  ${faucets.usdc.url}`);
      console.log(`\n1. Visit the URL above`);
      console.log(`2. Select "${this.chain}" network`);
      console.log(`3. Paste your address: ${address}`);
      console.log(`4. Request USDC (usually 10-100 USDC)`);
      console.log(`5. Wait ~10 seconds for confirmation\n`);
    }
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`✅ Once completed, verify with:`);
    console.log(`   node usdc-wallet.js balance ${address}\n`);
  }

  /**
   * Open faucets in browser automatically
   */
  async openFaucets(address) {
    const open = require('child_process').exec;
    
    console.log(`\n🌐 Opening faucets in browser...\n`);
    
    if (this.faucets.eth) {
      console.log(`Opening: ${this.faucets.eth.name}`);
      try {
        open(`xdg-open "${this.faucets.eth.url}" || open "${this.faucets.eth.url}"`);
      } catch (e) {
        console.log(`Manual URL: ${this.faucets.eth.url}`);
      }
    }
    
    // Wait 2 seconds between opens
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (this.faucets.usdc) {
      console.log(`Opening: ${this.faucets.usdc.name}`);
      try {
        open(`xdg-open "${this.faucets.usdc.url}" || open "${this.faucets.usdc.url}"`);
      } catch (e) {
        console.log(`Manual URL: ${this.faucets.usdc.url}`);
      }
    }
    
    console.log(`\n📋 Your address (copy this): ${address}\n`);
    console.log(`Paste this address in each faucet to receive funds.\n`);
  }

  /**
   * Check if address has sufficient funds for testing
   */
  async checkFunds(address, provider) {
    const ethBalance = await provider.getBalance(address);
    const ethBalanceFormatted = ethers.utils.formatEther(ethBalance);
    
    console.log(`\n💰 Current Balances:\n`);
    console.log(`ETH:  ${ethBalanceFormatted} (for gas)`);
    
    const hasEnoughETH = parseFloat(ethBalanceFormatted) > 0.001;
    
    if (!hasEnoughETH) {
      console.log(`\n⚠️  Need more ETH for gas fees!`);
      console.log(`   Minimum recommended: 0.001 ETH`);
      return false;
    }
    
    console.log(`\n✅ Sufficient funds for testing!\n`);
    return true;
  }

  /**
   * Interactive onboarding flow
   */
  async onboard(address) {
    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║                                                    ║`);
    console.log(`║        🚰 USDC Agent Wallet Faucet Helper         ║`);
    console.log(`║                                                    ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);
    
    console.log(`We'll help you get testnet funds in 2 steps:\n`);
    console.log(`1. Get ${this.chain} ETH (for gas fees)`);
    console.log(`2. Get ${this.chain} USDC (for testing)\n`);
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      readline.question('Ready to start? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          this.getInstructions(address);
          
          readline.question('\nOpen faucets in browser? (y/n): ', (openAnswer) => {
            if (openAnswer.toLowerCase() === 'y') {
              this.openFaucets(address);
            }
            readline.close();
            resolve();
          });
        } else {
          console.log(`\nNo problem! Run this anytime:\n`);
          console.log(`  node faucet-integration.js ${address}\n`);
          readline.close();
          resolve();
        }
      });
    });
  }
}

// CLI
async function cli() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`\n🚰 USDC Agent Wallet - Auto-Faucet Integration\n`);
    console.log(`Usage:\n`);
    console.log(`  node faucet-integration.js <address> [chain]\n`);
    console.log(`Examples:\n`);
    console.log(`  node faucet-integration.js 0x1a9D797e0C8982e008D94eD1e6b462A93FD4183D`);
    console.log(`  node faucet-integration.js 0x1a9D797e0C8982e008D94eD1e6b462A93FD4183D base-sepolia\n`);
    console.log(`Supported chains:\n`);
    Object.keys(FAUCETS).forEach(chain => {
      console.log(`  - ${chain}`);
    });
    console.log(``);
    process.exit(0);
  }
  
  const address = args[0];
  const chain = args[1] || 'base-sepolia';
  
  if (!ethers.utils.isAddress(address)) {
    console.error(`\n❌ Invalid Ethereum address: ${address}\n`);
    process.exit(1);
  }
  
  if (!FAUCETS[chain]) {
    console.error(`\n❌ Unsupported chain: ${chain}\n`);
    console.error(`Supported chains: ${Object.keys(FAUCETS).join(', ')}\n`);
    process.exit(1);
  }
  
  const manager = new FaucetManager(chain);
  await manager.onboard(address);
}

// Export for use in other scripts
module.exports = { FaucetManager, FAUCETS };

// Run CLI if executed directly
if (require.main === module) {
  cli().catch(console.error);
}
