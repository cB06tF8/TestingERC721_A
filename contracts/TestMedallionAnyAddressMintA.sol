// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract TestMedallionAnyAddressMintA is ERC721, ERC721URIStorage, Pausable, Ownable {
    using Counters for Counters.Counter;
    using Strings for *;

	string public baseURI;
	Counters.Counter private _tokenIds;
    string public baseExtension = ".json"; // collection's metadata uses a baseExtension of ".json"	
    uint256 public maxSupply = 10; // collection's supply is capped
	uint256 public cost = 0.05 ether; // collection's item floor price
    	
	constructor() ERC721("TestMedallionAnyAddressMintA", "TMEDAMA") {
		// IMPORTANT: the baseURI to the metadata must be formatted for openSea  ("ipfs://" is replaced by a gateway by openSea)
		// this value is the default baseURI for this collection
		setBaseURI("ipfs://QmYZKposdkySD5muWZnHzCqcLm6VXM2UKg6v5QLJaz12Ze/");
	}

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
	
	function setBaseURI(string memory _newBaseURI) public onlyOwner {
		baseURI = _newBaseURI;
	}
  
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

	function setCost(uint256 _newCost) public onlyOwner {
		cost = _newCost;
	}
	
    function mint(uint256 _mintAmount) 
		public 
		payable  
		whenNotPaused 
		returns(uint totalTokens) 
	{
		require(_tokenIds.current() < maxSupply, "Limited minting has been completed");
        require(_mintAmount > 0, "mintAmount must be > 0");
        require((_mintAmount + _tokenIds.current()) <= maxSupply, "mintAmount is too large");
		uint newTokenId;
		
		if (msg.sender != owner()) {
		  require(msg.value >= cost * _mintAmount, "Minting cost not met");
		}
		
        // IMPORTANT: NFT json files are 1 based, not 0 based (newTokenId is 0 based)
        for (uint i = 1; i <= _mintAmount; i++) {
            _tokenIds.increment();
            newTokenId = _tokenIds.current();
            _safeMint(msg.sender, newTokenId);				 
            string memory _tokenURI = string(abi.encodePacked(newTokenId.toString(), baseExtension));
            _setTokenURI(newTokenId, _tokenURI);
        }
        return newTokenId;
    }  

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }
	
	/** @notice This will payout the owner all of the contract balance. Do not remove, 
	  * otherwise you will not be able to withdraw the funds. */
	function withdraw() public payable onlyOwner {
		(bool os, ) = payable(owner()).call{value: address(this).balance}("");
		require(os);
	}		

    receive() external payable { }
    fallback() external { }

    // The following functions are overrides required by Solidity.
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
