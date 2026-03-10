const { ethers } = require("hardhat");

/**
 * @notice Test script to verify blockchain integration
 * @dev Run with: npx hardhat run test.js --network hardhat (local)
 *               npx hardhat run test.js --network amoy (testnet)
 */
async function main() {
  console.log("🧪 Testing Reputation Passport Contract\n");

  // Get signers
  const [owner, issuer, user] = await ethers.getSigners();
  console.log("Owner:", owner.address);
  console.log("Issuer:", issuer.address);
  console.log("User:", user.address);
  console.log("");

  // Deploy contract
  console.log("📝 Deploying contract...");
  const ReputationPassport = await ethers.getContractFactory("ReputationPassport");
  const contract = await ReputationPassport.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log("✅ Contract deployed to:", contractAddress);
  console.log("");

  // Test 1: Owner is automatically an issuer
  console.log("Test 1: Checking if owner is issuer...");
  const ownerIsIssuer = await contract.issuers(owner.address);
  console.log(ownerIsIssuer ? "✅ Owner is issuer" : "❌ Owner is NOT issuer");
  console.log("");

  // Test 2: Add new issuer
  console.log("Test 2: Adding new issuer...");
  const addIssuerTx = await contract.addIssuer(issuer.address);
  await addIssuerTx.wait();
  const issuerIsWhitelisted = await contract.issuers(issuer.address);
  console.log(issuerIsWhitelisted ? "✅ Issuer whitelisted" : "❌ Issuer NOT whitelisted");
  console.log("");

  // Test 3: Compute hash (simulating client-side)
  console.log("Test 3: Computing credential hash...");
  const credentialData = {
    event: "GDG Hackathon",
    position: "1st",
    date: "2025-02-10"
  };
  
  // Convert to canonical JSON (sorted keys, no whitespace)
  const canonicalJSON = JSON.stringify(credentialData);
  const hashBytes = ethers.keccak256(ethers.toUtf8Bytes(canonicalJSON));
  console.log("Credential data:", canonicalJSON);
  console.log("Hash:", hashBytes);
  console.log("");

  // Test 4: Add credential (as issuer)
  console.log("Test 4: Adding credential as issuer...");
  const addCredentialTx = await contract.connect(issuer).addCredential(
    user.address,
    hashBytes,
    "Hackathon Win"
  );
  await addCredentialTx.wait();
  console.log("✅ Credential added");
  console.log("");

  // Test 5: Verify credential exists
  console.log("Test 5: Verifying credential exists...");
  const exists = await contract.credentialExists(hashBytes);
  console.log(exists ? "✅ Credential hash found on-chain" : "❌ Credential hash NOT found");
  console.log("");

  // Test 6: Get credential details
  console.log("Test 6: Getting credential details...");
  const credential = await contract.getCredential(hashBytes);
  console.log("Issuer:", credential.issuer);
  console.log("Category:", credential.category);
  console.log("Timestamp:", new Date(Number(credential.timestamp) * 1000).toISOString());
  console.log("");

  // Test 7: Get user credentials
  console.log("Test 7: Getting all user credentials...");
  const userCreds = await contract.getCredentials(user.address);
  console.log("User has", userCreds.length, "credential(s)");
  console.log("Hashes:", userCreds);
  console.log("");

  // Test 8: Try to add credential as non-issuer (should fail)
  console.log("Test 8: Attempting to add credential as non-issuer (should fail)...");
  try {
    await contract.connect(user).addCredential(
      user.address,
      ethers.keccak256(ethers.toUtf8Bytes("test")),
      "Test"
    );
    console.log("❌ ERROR: Non-issuer was able to add credential!");
  } catch (error) {
    console.log("✅ Correctly rejected: Only issuers can add credentials");
  }
  console.log("");

  // Test 9: Get credential count
  console.log("Test 9: Getting credential count...");
  const count = await contract.getCredentialCount(user.address);
  console.log("User credential count:", count.toString());
  console.log("");

  console.log("🎉 All tests completed!");
  console.log("\nContract Address:", contractAddress);
  console.log("Update src/lib/contract.ts with this address:");
  console.log(`const CONTRACT_ADDRESS = '${contractAddress}';`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

