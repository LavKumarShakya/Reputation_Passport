// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationPassport
 * @notice Prototype smart contract for on-chain credential verification
 * 
 * ARCHITECTURE NOTES:
 * - This contract stores ONLY cryptographic hashes of credentials, not raw data
 * - Raw credential data is stored off-chain (simulated via JSON files in this prototype)
 * - Only whitelisted issuers can submit credential hashes
 * - Public verification allows anyone to check if a credential hash exists on-chain
 * 
 * SCALING PATH:
 * - Production: Replace JSON with IPFS/Arweave for off-chain storage
 * - Production: Add backend API for credential management
 * - This contract remains the source of truth for verification
 */
contract ReputationPassport {
    // ============ STATE VARIABLES ============
    
    // Owner of the contract (can whitelist issuers)
    address public owner;
    
    // Mapping: issuer address => is whitelisted
    mapping(address => bool) public issuers;
    
    // Mapping: user address => array of credential hashes
    mapping(address => bytes32[]) public userCredentials;
    
    // Mapping: credential hash => credential details
    mapping(bytes32 => Credential) public credentials;
    
    // ============ STRUCTS ============
    
    /**
     * @notice Credential metadata stored on-chain
     * @dev Only hash is stored, not raw data (PDFs, images, etc.)
     */
    struct Credential {
        bytes32 hash;           // SHA-256 hash of credential data
        address issuer;         // Wallet address of issuing institution
        uint256 timestamp;      // Block timestamp when credential was added
        string category;        // e.g., "Hackathon Win", "Certificate", "Achievement"
    }
    
    // ============ EVENTS ============
    
    event IssuerAdded(address indexed issuer, address indexed addedBy);
    event CredentialAdded(
        address indexed user,
        address indexed issuer,
        bytes32 indexed hash,
        string category,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyIssuer() {
        require(issuers[msg.sender], "Only whitelisted issuers can call this");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
        // Owner is automatically an issuer
        issuers[msg.sender] = true;
    }
    
    // ============ ISSUER MANAGEMENT ============
    
    /**
     * @notice Add an issuer to the whitelist
     * @dev Only contract owner can add issuers
     * @param issuer Address of the institution/issuer to whitelist
     */
    function addIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(!issuers[issuer], "Issuer already whitelisted");
        
        issuers[issuer] = true;
        emit IssuerAdded(issuer, msg.sender);
    }
    
    /**
     * @notice Remove an issuer from the whitelist
     * @dev Only contract owner can remove issuers
     * @param issuer Address of the issuer to remove
     */
    function removeIssuer(address issuer) external onlyOwner {
        require(issuers[issuer], "Issuer not whitelisted");
        issuers[issuer] = false;
    }
    
    // ============ CREDENTIAL MANAGEMENT ============
    
    /**
     * @notice Add a credential hash for a user
     * @dev Only whitelisted issuers can add credentials
     * @dev Hash must be computed off-chain from canonical JSON representation
     * @param user Address of the user receiving the credential
     * @param hash SHA-256 hash of the credential data (bytes32)
     * @param category Category of credential (e.g., "Hackathon Win", "Certificate")
     */
    function addCredential(
        address user,
        bytes32 hash,
        string calldata category
    ) external onlyIssuer {
        require(user != address(0), "Invalid user address");
        require(hash != bytes32(0), "Invalid hash");
        require(bytes(category).length > 0, "Category cannot be empty");
        
        // Check if credential already exists
        require(credentials[hash].timestamp == 0, "Credential hash already exists");
        
        // Store credential
        credentials[hash] = Credential({
            hash: hash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            category: category
        });
        
        // Add to user's credential list
        userCredentials[user].push(hash);
        
        emit CredentialAdded(user, msg.sender, hash, category, block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get all credential hashes for a user
     * @param user Address of the user
     * @return Array of credential hashes
     */
    function getCredentials(address user) external view returns (bytes32[] memory) {
        return userCredentials[user];
    }
    
    /**
     * @notice Get credential details by hash
     * @param hash Credential hash to look up
     * @return Credential struct with issuer, timestamp, and category
     */
    function getCredential(bytes32 hash) external view returns (Credential memory) {
        require(credentials[hash].timestamp != 0, "Credential not found");
        return credentials[hash];
    }
    
    /**
     * @notice Check if a credential hash exists on-chain
     * @param hash Credential hash to verify
     * @return true if credential exists, false otherwise
     */
    function credentialExists(bytes32 hash) external view returns (bool) {
        return credentials[hash].timestamp != 0;
    }
    
    /**
     * @notice Get credential count for a user
     * @param user Address of the user
     * @return Number of credentials
     */
    function getCredentialCount(address user) external view returns (uint256) {
        return userCredentials[user].length;
    }
}

