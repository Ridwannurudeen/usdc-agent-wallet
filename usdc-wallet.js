/**
 * USDC Agent Wallet - Core Implementation
 * Enables OpenClaw agents to manage USDC autonomously
 * 
 * Circle USDC Hackathon on Moltbook
 * Track: Best OpenClaw Skill
 * Author: Gudman (OpenClaw Agent)
 */

const { ethers } = require('ethers');

// USDC Contract Addresses (Circle Official)
const USDC_ADDRESSES = {
  // Mainnets
  'ethereum': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  'base': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  'polygon': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  'arbitrum': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  
  // Testnets
  'ethereum-sepolia': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  'polygon-amoy': '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  'arbitrum-sepolia': '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'
};

// USDC decimals (always 6)
const USDC_DECIMALS = 6;

// ERC-20 ABI (minimal interface for USDC)
const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

class USDCWallet {
  constructor(chain = 'base-sepolia', rpcUrl = null, privateKey = null) {
    this.chain = chain;
    this.usdcAddress = USDC_ADDRESSES[chain];
    
    if (!this.usdcAddress) {
      throw new Error(`Unsupported chain: ${chain}. Use one of: ${Object.keys(USDC_ADDRESSES).join(', ')}`);
    }
    
    // Setup provider
    this.provider = rpcUrl 
      ? new ethers.providers.JsonRpcProvider(rpcUrl)
      : ethers.getDefaultProvider(this._getNetworkName(chain));
    
    // Setup wallet (optional - needed for sending)
    this.wallet = privateKey 
      ? new ethers.Wallet(privateKey, this.provider)
      : null;
    
    // Setup USDC contract
    this.usdcContract = new ethers.Contract(
      this.usdcAddress,
      USDC_ABI,
      this.wallet || this.provider
    );
  }
  
  /**
   * Get USDC balance for an address
   * @param {string} address - Ethereum address to check
   * @returns {string} Balance in USDC (e.g., "100.50")
   */
  async getBalance(address) {
    try {
      const balance = await this.usdcContract.balanceOf(address);
      return ethers.utils.formatUnits(balance, USDC_DECIMALS);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }
  
  /**
   * Send USDC to another address
   * @param {Object} params - Payment parameters
   * @param {string} params.to - Recipient address
   * @param {number} params.amount - Amount in USDC (e.g., 10.50)
   * @param {string} params.memo - Optional memo (logged, not on-chain)
   * @returns {Object} Transaction receipt
   */
  async send({ to, amount, memo = '' }) {
    if (!this.wallet) {
      throw new Error('Wallet not initialized. Need private key to send transactions.');
    }
    
    try {
      // Validate recipient address
      if (!ethers.utils.isAddress(to)) {
        throw new Error('Invalid recipient address');
      }
      
      // Convert amount to USDC units (6 decimals)
      const amountUnits = ethers.utils.parseUnits(amount.toString(), USDC_DECIMALS);
      
      // Check balance
      const senderBalance = await this.usdcContract.balanceOf(this.wallet.address);
      if (senderBalance.lt(amountUnits)) {
        throw new Error(`Insufficient balance. Have: ${ethers.utils.formatUnits(senderBalance, USDC_DECIMALS)} USDC, Need: ${amount} USDC`);
      }
      
      // Estimate gas
      const gasEstimate = await this.usdcContract.estimateGas.transfer(to, amountUnits);
      const gasPrice = await this.provider.getGasPrice();
      const gasCost = gasEstimate.mul(gasPrice);
      
      // Check native token balance for gas
      const nativeBalance = await this.wallet.getBalance();
      if (nativeBalance.lt(gasCost)) {
        throw new Error(`Insufficient native token for gas. Need: ${ethers.utils.formatEther(gasCost)} ETH`);
      }
      
      console.log(`Sending ${amount} USDC to ${to}...`);
      if (memo) console.log(`Memo: ${memo}`);
      
      // Send transaction
      const tx = await this.usdcContract.transfer(to, amountUnits);
      console.log(`Transaction submitted: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      
      return {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        from: this.wallet.address,
        to,
        amount,
        gasUsed: receipt.gasUsed.toString(),
        memo
      };
    } catch (error) {
      throw new Error(`Failed to send USDC: ${error.message}`);
    }
  }
  
  /**
   * Get recent USDC transactions for an address
   * @param {string} address - Address to query
   * @param {number} limit - Max number of transactions to return
   * @returns {Array} List of transactions
   */
  async getHistory(address, limit = 10) {
    try {
      // Query Transfer events involving this address
      const filterFrom = this.usdcContract.filters.Transfer(address, null);
      const filterTo = this.usdcContract.filters.Transfer(null, address);
      
      const eventsFrom = await this.usdcContract.queryFilter(filterFrom);
      const eventsTo = await this.usdcContract.queryFilter(filterTo);
      
      // Combine and sort by block number
      const allEvents = [...eventsFrom, ...eventsTo]
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, limit);
      
      // Format transactions
      const transactions = await Promise.all(
        allEvents.map(async (event) => {
          const block = await event.getBlock();
          return {
            hash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: block.timestamp,
            from: event.args.from,
            to: event.args.to,
            amount: ethers.utils.formatUnits(event.args.value, USDC_DECIMALS),
            type: event.args.from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received'
          };
        })
      );
      
      return transactions;
    } catch (error) {
      throw new Error(`Failed to get history: ${error.message}`);
    }
  }
  
  /**
   * Simulate a transaction without executing it
   * @param {Object} params - Same as send()
   * @returns {Object} Simulation results
   */
  async simulate({ to, amount }) {
    if (!this.wallet) {
      throw new Error('Wallet not initialized. Need private key to simulate.');
    }
    
    try {
      const amountUnits = ethers.utils.parseUnits(amount.toString(), USDC_DECIMALS);
      
      // Check balance
      const balance = await this.usdcContract.balanceOf(this.wallet.address);
      const hasBalance = balance.gte(amountUnits);
      
      // Estimate gas
      let gasEstimate, gasCost, hasGas;
      try {
        gasEstimate = await this.usdcContract.estimateGas.transfer(to, amountUnits);
        const gasPrice = await this.provider.getGasPrice();
        gasCost = gasEstimate.mul(gasPrice);
        const nativeBalance = await this.wallet.getBalance();
        hasGas = nativeBalance.gte(gasCost);
      } catch (e) {
        gasEstimate = null;
        gasCost = null;
        hasGas = false;
      }
      
      return {
        wouldSucceed: hasBalance && hasGas,
        balance: ethers.utils.formatUnits(balance, USDC_DECIMALS),
        hasBalance,
        estimatedGas: gasEstimate ? gasEstimate.toString() : 'N/A',
        estimatedGasCost: gasCost ? ethers.utils.formatEther(gasCost) : 'N/A',
        hasGas,
        chain: this.chain
      };
    } catch (error) {
      return {
        wouldSucceed: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get wallet address (if initialized with private key)
   * @returns {string} Wallet address
   */
  getAddress() {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return this.wallet.address;
  }
  
  /**
   * Convert chain name to ethers network name
   * @private
   */
  _getNetworkName(chain) {
    const mapping = {
      'ethereum': 'homestead',
      'ethereum-sepolia': 'sepolia',
      'base': 'base',
      'base-sepolia': 'base-sepolia',
      'polygon': 'matic',
      'polygon-amoy': 'maticmum',
      'arbitrum': 'arbitrum',
      'arbitrum-sepolia': 'arbitrum-sepolia'
    };
    return mapping[chain] || chain;
  }
}

// CLI Interface (for agent command-line usage)
async function cli() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Load config from environment
  const chain = process.env.USDC_CHAIN || 'base-sepolia';
  const rpcUrl = process.env[`${chain.toUpperCase().replace('-', '_')}_RPC_URL`];
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  
  const wallet = new USDCWallet(chain, rpcUrl, privateKey);
  
  try {
    switch (command) {
      case 'balance':
        const address = args[1];
        if (!address) throw new Error('Usage: balance <address>');
        const balance = await wallet.getBalance(address);
        console.log(`Balance: ${balance} USDC`);
        break;
        
      case 'send':
        const to = args[1];
        const amount = parseFloat(args[2]);
        if (!to || !amount) throw new Error('Usage: send <to> <amount>');
        const tx = await wallet.send({ to, amount });
        console.log(JSON.stringify(tx, null, 2));
        break;
        
      case 'history':
        const addr = args[1];
        const limit = parseInt(args[2]) || 10;
        if (!addr) throw new Error('Usage: history <address> [limit]');
        const history = await wallet.getHistory(addr, limit);
        console.log(JSON.stringify(history, null, 2));
        break;
        
      case 'simulate':
        const simTo = args[1];
        const simAmount = parseFloat(args[2]);
        if (!simTo || !simAmount) throw new Error('Usage: simulate <to> <amount>');
        const sim = await wallet.simulate({ to: simTo, amount: simAmount });
        console.log(JSON.stringify(sim, null, 2));
        break;
        
      case 'address':
        console.log(wallet.getAddress());
        break;
        
      default:
        console.log(`
USDC Agent Wallet - Command Line Interface

Usage:
  node usdc-wallet.js <command> [args]

Commands:
  balance <address>           Check USDC balance
  send <to> <amount>          Send USDC to address
  history <address> [limit]   View transaction history
  simulate <to> <amount>      Simulate a transaction
  address                     Show wallet address

Environment Variables:
  USDC_CHAIN              Chain to use (default: base-sepolia)
  <CHAIN>_RPC_URL         RPC endpoint for chain
  AGENT_PRIVATE_KEY       Private key (required for send)

Examples:
  node usdc-wallet.js balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
  node usdc-wallet.js send 0xRecipient 10.50
  node usdc-wallet.js history 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 5
        `);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { USDCWallet, USDC_ADDRESSES, USDC_DECIMALS };

// Run CLI if called directly
if (require.main === module) {
  cli();
}
