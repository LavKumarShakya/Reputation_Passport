// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationPassport
 * @notice Prototype smart contract for on-chain credential verification and SBT minting
 * 
 * ARCHITECTURE NOTES:
 * - This contract stores ONLY cryptographic hashes of credentials, not raw data
 * - Raw credential data is stored off-chain
 * - Only whitelisted issuers can submit credential hashes
 * - Public verification allows anyone to check if a credential hash exists on-chain
 * - Users can mint a Soulbound Token (SBT) representing their passport
 */
contract ReputationPassport is ERC721URIStorage, Ownable {
    // ============ STATE VARIABLES ============
    
    uint256 private _nextTokenId;
    
    // Mapping: issuer address => is whitelisted
    mapping(address => bool) public issuers;
    
    // Mapping: user address => array of credential hashes
    mapping(address => bytes32[]) public userCredentials;
    
    // Mapping: credential hash => credential details
    mapping(bytes32 => Credential) public credentials;
    
    // Mapping: user address => boolean if they have minted their SBT
    mapping(address => bool) public hasMintedSBT;
    
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
    event IssuerRemoved(address indexed issuer, address indexed removedBy);
    event CredentialAdded(
        address indexed user,
        address indexed issuer,
        bytes32 indexed hash,
        string category,
        uint256 timestamp
    );
    event SBTMinted(address indexed user, uint256 tokenId, string uri);
    
    // ============ MODIFIERS ============
    
    modifier onlyIssuer() {
        require(issuers[msg.sender], "Only whitelisted issuers can call this");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() ERC721("Reputation Passport", "RPASS") {
        // Owner is automatically an issuer
        issuers[msg.sender] = true;
        _nextTokenId = 1;
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
        emit IssuerRemoved(issuer, msg.sender);
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
    
    // ============ SOULBOUND TOKEN (SBT) MANAGEMENT ============
    
    /**
     * @notice Mint a Soulbound Token representing the user's reputation passport
     * @dev Each user can only mint ONE token. The token is non-transferable.
     * @param uri The metadata URI for the token (can point to dynamic API or IPFS)
     */
    function mintSBT(string memory uri) external {
        require(!hasMintedSBT[msg.sender], "SBT already minted for this address");
        
        uint256 tokenId = _nextTokenId++;
        hasMintedSBT[msg.sender] = true;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit SBTMinted(msg.sender, tokenId, uri);
    }

    /**
     * @notice Overrides _beforeTokenTransfer from ERC721 to make tokens soulbound
     * @dev Reverts if it's a transfer (from != 0 and to != 0)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override {
        // Allow minting (from == 0) or burning (to == 0)
        // Disallow standard transfers
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer failed");
        }
        
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
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
