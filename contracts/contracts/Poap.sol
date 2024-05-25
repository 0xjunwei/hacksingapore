// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Poap is ERC721, Ownable {
    uint256 private _nextTokenId;
    string public poapURL;
    uint256 public tokenSupply;
    uint256 public volunteerSignUp;
    address[] public holders;
    bool public signUpEnabled;
    mapping(address => bool) private signUpWallet;
    mapping(address => uint256) private holderIndex; 

    constructor(
        address initialOwner,
        string memory _poapName,
        string memory _poapShortName,
        string memory _poapURL
    ) ERC721(_poapName, _poapShortName) Ownable(initialOwner) {
        poapURL = _poapURL;
        signUpEnabled = true;
    }

    function _baseURI() internal view override returns (string memory) {
        return poapURL;
    }

    // Function for the owner to enable or disable sign-ups
    function toggleSignUp() public onlyOwner {
        signUpEnabled = !signUpEnabled;
    }

    // Function to sign up a volunteer
    function signUp() public {
        require(signUpEnabled, "Sign-ups are currently disabled.");
        require(!signUpWallet[msg.sender], "You have already signed up.");
        signUpWallet[msg.sender] = true;
        volunteerSignUp++;
    }

    function safeMint(address to) public onlyOwner {
        require(signUpWallet[to], "Address has not signed up.");
        require(balanceOf(to) == 0, "Address already owns a POAP");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        tokenSupply++;
        holders.push(to);
        holderIndex[to] = holders.length - 1;
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(to != address(0), "Cannot transfer to a zero address");
        require(balanceOf(to) == 0, "Recipient already owns a POAP");

        // Update the holders list
        if (balanceOf(from) == 1) {
            _removeHolder(from);
        }

        if (balanceOf(to) == 0) {
            holders.push(to);
            holderIndex[to] = holders.length - 1;
        }

        // Call the original transferFrom function
        super.transferFrom(from, to, tokenId);
    }

    function _removeHolder(address holder) private {
        uint256 index = holderIndex[holder];
        address lastHolder = holders[holders.length - 1];
        
        holders[index] = lastHolder; // Move the last holder to the index being removed
        holderIndex[lastHolder] = index; // Update the moved holder's index

        holders.pop(); // Remove the last holder
        delete holderIndex[holder]; // Delete the index of the removed holder
        
    }
    function getHolders() public view returns (address[] memory) {
        return holders;
    }


}
