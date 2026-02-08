/**
 * Spending Limits & Allowance System for USDC Agent Wallet
 * Implements security controls mentioned in security architecture
 * 
 * Features:
 * - Per-transaction limits
 * - Daily spending caps
 * - Weekly/monthly limits
 * - Allowance system (like ERC-20)
 * - Human approval thresholds
 * - Whitelist management
 */

const fs = require('fs');
const path = require('path');

class SpendingLimits {
  constructor(configPath = './spending-limits.json') {
    this.configPath = configPath;
    this.load();
  }

  /**
   * Load configuration from file
   */
  load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(data);
      } else {
        // Default conservative limits
        this.config = {
          limits: {
            perTransaction: 100,    // Max 100 USDC per tx
            dailyTotal: 500,        // Max 500 USDC per day
            weeklyTotal: 2000,      // Max 2000 USDC per week
            monthlyTotal: 5000      // Max 5000 USDC per month
          },
          approvalThresholds: {
            requireHuman: 50,       // Require human approval if >50 USDC
            requireMultiSig: 500    // Require multi-sig if >500 USDC
          },
          allowance: {
            current: 1000,          // Current allowance
            total: 1000,            // Total allocated
            resetPeriod: 'weekly'   // daily, weekly, monthly
          },
          whitelist: {
            enabled: false,
            addresses: []
          },
          spending: {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            lastReset: {
              daily: new Date().toISOString().split('T')[0],
              weekly: this.getWeekStart(),
              monthly: new Date().toISOString().slice(0, 7)
            },
            history: []
          }
        };
        this.save();
      }
    } catch (error) {
      throw new Error(`Failed to load spending limits: ${error.message}`);
    }
  }

  /**
   * Save configuration to file
   */
  save() {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        'utf8'
      );
    } catch (error) {
      throw new Error(`Failed to save spending limits: ${error.message}`);
    }
  }

  /**
   * Get start of current week (Monday)
   */
  getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  /**
   * Reset counters if period has elapsed
   */
  checkAndResetCounters() {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = this.getWeekStart();
    const thisMonth = new Date().toISOString().slice(0, 7);

    // Reset daily
    if (this.config.spending.lastReset.daily !== today) {
      this.config.spending.today = 0;
      this.config.spending.lastReset.daily = today;
    }

    // Reset weekly
    if (this.config.spending.lastReset.weekly !== thisWeek) {
      this.config.spending.thisWeek = 0;
      this.config.spending.lastReset.weekly = thisWeek;
      
      // Reset weekly allowance
      if (this.config.allowance.resetPeriod === 'weekly') {
        this.config.allowance.current = this.config.allowance.total;
      }
    }

    // Reset monthly
    if (this.config.spending.lastReset.monthly !== thisMonth) {
      this.config.spending.thisMonth = 0;
      this.config.spending.lastReset.monthly = thisMonth;
      
      // Reset monthly allowance
      if (this.config.allowance.resetPeriod === 'monthly') {
        this.config.allowance.current = this.config.allowance.total;
      }
    }

    // Reset daily allowance
    if (this.config.allowance.resetPeriod === 'daily' && 
        this.config.spending.lastReset.daily !== today) {
      this.config.allowance.current = this.config.allowance.total;
    }

    this.save();
  }

  /**
   * Check if transaction is allowed
   */
  async checkTransaction(to, amount) {
    this.checkAndResetCounters();

    const checks = {
      allowed: true,
      requiresApproval: false,
      requiresMultiSig: false,
      violations: []
    };

    // Check per-transaction limit
    if (amount > this.config.limits.perTransaction) {
      checks.violations.push(
        `Amount ${amount} exceeds per-transaction limit ${this.config.limits.perTransaction}`
      );
      checks.allowed = false;
    }

    // Check daily limit
    if (this.config.spending.today + amount > this.config.limits.dailyTotal) {
      checks.violations.push(
        `Would exceed daily limit (spent: ${this.config.spending.today}, limit: ${this.config.limits.dailyTotal})`
      );
      checks.allowed = false;
    }

    // Check weekly limit
    if (this.config.spending.thisWeek + amount > this.config.limits.weeklyTotal) {
      checks.violations.push(
        `Would exceed weekly limit (spent: ${this.config.spending.thisWeek}, limit: ${this.config.limits.weeklyTotal})`
      );
      checks.allowed = false;
    }

    // Check monthly limit
    if (this.config.spending.thisMonth + amount > this.config.limits.monthlyTotal) {
      checks.violations.push(
        `Would exceed monthly limit (spent: ${this.config.spending.thisMonth}, limit: ${this.config.limits.monthlyTotal})`
      );
      checks.allowed = false;
    }

    // Check allowance
    if (amount > this.config.allowance.current) {
      checks.violations.push(
        `Insufficient allowance (current: ${this.config.allowance.current}, needed: ${amount})`
      );
      checks.requiresApproval = true;
      checks.allowed = false;
    }

    // Check approval thresholds
    if (amount >= this.config.approvalThresholds.requireHuman) {
      checks.requiresApproval = true;
    }

    if (amount >= this.config.approvalThresholds.requireMultiSig) {
      checks.requiresMultiSig = true;
    }

    // Check whitelist
    if (this.config.whitelist.enabled) {
      if (!this.config.whitelist.addresses.includes(to.toLowerCase())) {
        checks.violations.push(
          `Address ${to} not in whitelist`
        );
        checks.allowed = false;
      }
    }

    return checks;
  }

  /**
   * Record transaction (after it's executed)
   */
  recordTransaction(to, amount, hash) {
    this.checkAndResetCounters();

    this.config.spending.today += amount;
    this.config.spending.thisWeek += amount;
    this.config.spending.thisMonth += amount;
    this.config.allowance.current -= amount;

    this.config.spending.history.push({
      to,
      amount,
      hash,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 transactions
    if (this.config.spending.history.length > 100) {
      this.config.spending.history = this.config.spending.history.slice(-100);
    }

    this.save();
  }

  /**
   * Request allowance increase from human
   */
  async requestAllowance(amount, reason) {
    console.log(`\n🔔 ALLOWANCE REQUEST\n`);
    console.log(`Amount needed: ${amount} USDC`);
    console.log(`Current allowance: ${this.config.allowance.current} USDC`);
    console.log(`Reason: ${reason}\n`);
    console.log(`This would require human approval in production.\n`);
    
    // In production, this would:
    // 1. Send notification to human
    // 2. Wait for approval
    // 3. Update allowance if approved
    
    return {
      approved: false,
      message: 'Human approval required for allowance increase'
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    this.checkAndResetCounters();
    
    return {
      limits: this.config.limits,
      spending: {
        today: this.config.spending.today,
        todayRemaining: this.config.limits.dailyTotal - this.config.spending.today,
        thisWeek: this.config.spending.thisWeek,
        weekRemaining: this.config.limits.weeklyTotal - this.config.spending.thisWeek,
        thisMonth: this.config.spending.thisMonth,
        monthRemaining: this.config.limits.monthlyTotal - this.config.spending.thisMonth
      },
      allowance: {
        current: this.config.allowance.current,
        total: this.config.allowance.total,
        used: this.config.allowance.total - this.config.allowance.current,
        resetPeriod: this.config.allowance.resetPeriod
      },
      whitelist: this.config.whitelist
    };
  }

  /**
   * Update limits
   */
  updateLimits(newLimits) {
    this.config.limits = { ...this.config.limits, ...newLimits };
    this.save();
  }

  /**
   * Add address to whitelist
   */
  addToWhitelist(address) {
    if (!this.config.whitelist.addresses.includes(address.toLowerCase())) {
      this.config.whitelist.addresses.push(address.toLowerCase());
      this.save();
    }
  }

  /**
   * Enable/disable whitelist mode
   */
  setWhitelistMode(enabled) {
    this.config.whitelist.enabled = enabled;
    this.save();
  }
}

module.exports = { SpendingLimits };
