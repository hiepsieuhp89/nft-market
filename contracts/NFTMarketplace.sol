// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to price in wei
    mapping(uint256 => uint256) public tokenPrices;
    
    // Mapping from token ID to creator
    mapping(uint256 => address) public tokenCreators;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI, uint256 price);
    event NFTTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event PriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    
    constructor() ERC721("NFT Marketplace", "NFTM") Ownable(msg.sender) {}
    
    function mintNFT(
        address to,
        string memory uri,
        uint256 price
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        tokenPrices[tokenId] = price;
        tokenCreators[tokenId] = to;
        
        emit NFTMinted(tokenId, to, uri, price);
        
        return tokenId;
    }
    
    function transferNFT(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        require(to != address(0), "Invalid recipient address");
        
        address from = msg.sender;
        _transfer(from, to, tokenId);
        
        emit NFTTransferred(tokenId, from, to);
    }
    
    function updatePrice(uint256 tokenId, uint256 newPrice) public {
        require(ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        tokenPrices[tokenId] = newPrice;
        emit PriceUpdated(tokenId, newPrice);
    }
    
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIdCounter;
        uint256 tokenCount = 0;
        
        // Count tokens owned by the address
        for (uint256 i = 0; i < totalTokens; i++) {
            try this.ownerOf(i) returns (address tokenOwner) {
                if (tokenOwner == owner) {
                    tokenCount++;
                }
            } catch {
                // Token doesn't exist, skip
            }
        }
        
        // Create array and populate with token IDs
        uint256[] memory tokens = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < totalTokens; i++) {
            try this.ownerOf(i) returns (address tokenOwner) {
                if (tokenOwner == owner) {
                    tokens[index] = i;
                    index++;
                }
            } catch {
                // Token doesn't exist, skip
            }
        }
        
        return tokens;
    }
    
    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
