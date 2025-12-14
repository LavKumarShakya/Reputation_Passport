const { ethers } = require("hardhat");

/**
 * @notice Deployment script for ReputationPassport contract
 * @dev Deploys to the network specified in hardhat.config.js
 * 
 * USAGE:
 *   npx hardhat run scripts/deploy.js --network amoy
 *   npx hardhat run scripts/deploy.js --network sepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ReputationPassport contract
  const ReputationPassport = await ethers.getContractFactory("ReputationPassport");
  const reputationPassport = await ReputationPassport.deploy();

  await reputationPassport.waitForDeployment();
  const address = await reputationPassport.getAddress();

  console.log("ReputationPassport deployed to:", address);
  console.log("\nNext steps:");
  console.log("1. Update lib/contract.ts with the deployed contract address");
  console.log("2. Verify contract on block explorer (optional)");
  console.log("3. Add issuer addresses using addIssuer() function");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

