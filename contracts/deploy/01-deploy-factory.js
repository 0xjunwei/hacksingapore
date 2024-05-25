const { network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
require("dotenv").config();
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // when going for localhost or hardhat network we want to use a mock
  const factory = await deploy("Factory", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 5,
  });

  if (
    network.name !== "hardhat" &&
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API
  ) {
    console.log("Verifying...");
    // Verify
    await verify(factory.address, []);
  } else {
    console.log(
      "Hardhat network detected or not verifying required, skipping verification."
    );
  }

  console.log("Contract deployed to address: " + factory.address);

  // Interact with the deployed Factory contract
  const factoryInstance = await ethers.getContractAt(
    "Factory",
    factory.address
  );

  // Deploy a new POAP contract via the Factory
  const tx = await factoryInstance.deployPOAP(
    deployer,
    "Red Cross",
    "RC",
    "https://hacksg.infura-ipfs.io/ipfs/Qmasof5kszUrML36VNicSs6iFGG98v4eaD3i32nK6HC7xt#"
  );
  const receipt = await tx.wait(); // Ensure the transaction is mined
  // Retrieve the address of the newly deployed POAP contract
  let poapAddress;
  for (const log of receipt.logs) {
    try {
      const parsedLog = factoryInstance.interface.parseLog(log);
      if (parsedLog.name === "ContractDeployed") {
        poapAddress = parsedLog.args.contractAddress;
        break;
      }
    } catch (e) {
      // Ignore logs that do not match the event signature
    }
  }

  if (poapAddress) {
    console.log("POAP contract deployed to address: " + poapAddress);

    // Verify the POAP contract on Etherscan if not on local development chains
    await verify(poapAddress, [
      deployer,
      "Red Cross",
      "RC",
      "https://hacksg.infura-ipfs.io/ipfs/Qmasof5kszUrML36VNicSs6iFGG98v4eaD3i32nK6HC7xt#",
    ]);
  }

  // Retrieve the deployed contracts
  const deployedContracts = await factoryInstance.getDeployedContracts();
  console.log("Deployed POAP contracts: " + deployedContracts.toString());
};
