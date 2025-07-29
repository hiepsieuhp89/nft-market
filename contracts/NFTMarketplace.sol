// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from token ID to price in wei
    mapping(uint256 => uint256) public tokenPrices;
    
    // Mapping from token ID to creator
    mapping(uint256 => address) public tokenCreators;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI, uint256 price);
    event NFTTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event PriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    
    constructor() ERC721("NFT Marketplace", "NFTM") {}
    
    function mintNFT(
        address to,
        string memory tokenURI,
        uint256 price
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        tokenPrices[tokenId] = price;
        tokenCreators[tokenId] = to;
        
        emit NFTMinted(tokenId, to, tokenURI, price);
        
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
        uint256 totalTokens = _tokenIdCounter.current();
        uint256 tokenCount = 0;
        
        // Count tokens owned by the address
        for (uint256 i = 0; i < totalTokens; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokenCount++;
            }
        }
        
        // Create array and populate with token IDs
        uint256[] memory tokens = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < totalTokens; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }
    
    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
