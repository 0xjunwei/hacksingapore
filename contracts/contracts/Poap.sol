// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Poap is ERC721, Ownable {
    uint256 private _nextTokenId;
    string public poapURL;

    constructor(
        address initialOwner,
        string memory _poapName,
        string memory _poapShortName,
        string memory _poapURL
    ) ERC721(_poapName, _poapShortName) Ownable(initialOwner) {
        poapURL = _poapURL;
    }

    function _baseURI() internal view override returns (string memory) {
        return poapURL;
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}
