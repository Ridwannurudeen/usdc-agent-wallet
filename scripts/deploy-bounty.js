const hre = require("hardhat");

// USDC addresses per network
const USDC_ADDRESSES = {
  // Mainnets
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  polygon: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  
  // Testnets
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  amoy: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
  arbitrumSepolia: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
};

async function main() {
  const networkName = hre.network.name;
  console.log(`\n🚀 Deploying AgentBounty to ${networkName}...\n`);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get USDC address for this network
  const usdcAddress = USDC_ADDRESSES[networkName];
  if (!usdcAddress) {
    throw new Error(`USDC address not configured for network: ${networkName}`);
  }
  console.log("USDC address:", usdcAddress);

  // Platform fee: 2.5% (250 basis points)
  const platformFee = 250;
  
  // Deploy AgentBounty
  const AgentBounty = await hre.ethers.getContractFactory("AgentBounty");
  const bounty = await AgentBounty.deploy(usdcAddress, platformFee);
  await bounty.deployed();

  console.log("\n✅ AgentBounty deployed to:", bounty.address);
  console.log("USDC token:", usdcAddress);
  console.log("Platform fee:", platformFee / 100 + "%");
  console.log("Fee recipient:", deployer.address);
  console.log("Deployer:", deployer.address);

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    contract: "AgentBounty",
    address: bounty.address,
    usdcAddress: usdcAddress,
    platformFee: platformFee,
    platformFeePercent: platformFee / 100,
    feeRecipient: deployer.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    txHash: bounty.deployTransaction.hash,
  };

  console.log("\n📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for block confirmations before verifying
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("\n⏳ Waiting for 5 block confirmations...");
    await bounty.deployTransaction.wait(5);
    
    console.log("\n🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: bounty.address,
        constructorArguments: [usdcAddress, platformFee],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
      console.log("You can verify manually with:");
      console.log(`npx hardhat verify --network ${networkName} ${bounty.address} ${usdcAddress} ${platformFee}`);
    }
  }

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
