// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Poap.sol";

contract Factory {
    address[] public deployedPOAPs;
    


    event ContractDeployed(address indexed contractAddress);

    function deployPOAP(
        address _initialOwner,
        string memory _poapName,
        string memory _poapShortName,
        string memory _poapURL
    ) public {
        Poap newContract = new Poap(
            _initialOwner,
            _poapName,
            _poapShortName,
            _poapURL
        );
        deployedPOAPs.push(address(newContract));
        emit ContractDeployed(address(newContract));
    }

    function getDeployedContracts() public view returns (address[] memory) {
        return deployedPOAPs;
    }
}
