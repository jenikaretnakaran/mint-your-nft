// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "hardhat/console.sol";

contract MyEpicNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event NewEpicNFTMinted(address sender, uint256 tokenId);
    // mapping (uint256 => string) private _tokenURIs;

    constructor() ERC721("RandomNFT", "RANDOM") {
        console.log("This is my NFT contract. Whoa!");
    }

    // A function our user will hit to get their NFT.
    function makeAnEpicNFT(string memory IPFSHash) public {
        // Get the current tokenId, this starts at 0.
        uint256 newItemId = _tokenIds.current();
        console.log(newItemId);

        require(newItemId <= 15, "minting limit exceeded");

        // Actually mint the NFT to the sender using msg.sender.
        _safeMint(msg.sender, newItemId);

        _setTokenURI(newItemId, IPFSHash);
        // Return the NFT's metadata
        // tokenURI(newItemId);

        // _tokenURIs[newItemId] = IPFSHash;

        // Increment the counter for when the next NFT is minted.
        _tokenIds.increment();
        console.log(
            "An NFT w/ ID %s has been minted to %s",
            newItemId,
            msg.sender
        );
        console.log(_tokenIds.current());
        emit NewEpicNFTMinted(msg.sender, newItemId);
    }
    function totalNFTminted() public view returns(uint256) {
        return _tokenIds.current();
    }
}








