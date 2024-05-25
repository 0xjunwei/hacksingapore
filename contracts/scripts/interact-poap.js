const { ethers } = require("hardhat");
require("dotenv").config()

async function main() {
  // Replace with your deployed POAP contract address
  const poapAddress = "0x2853713eFc46065d203490e8Bc2561B199bcd083";

  // Connect to the Arbitrum Sepolia network
  const provider = new ethers.JsonRpcProvider(process.env.ARBI_SEPOLIA_RPC_URL);

  // Create a wallet instance
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // Get the contract ABI from the artifacts
  // Define the contract ABI
  const poapAbi = [
    {
      "inputs": [
        { "internalType": "address", "name": "initialOwner", "type": "address" },
        { "internalType": "string", "name": "_poapName", "type": "string" },
        { "internalType": "string", "name": "_poapShortName", "type": "string" },
        { "internalType": "string", "name": "_poapURL", "type": "string" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "poapURL",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "to", "type": "address" }],
      "name": "safeMint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  
  // Create a contract instance
  const poapContract = new ethers.Contract(poapAddress, poapAbi, wallet);

  // Get the POAP URL
  const poapURL = await poapContract.poapURL();
  console.log("POAP URL:", poapURL);

  // Mint a new token
  const recipientAddress = "0x5c6688532A27492DA6C534a37cedE11A86823152";
  const mintTx = await poapContract.safeMint(recipientAddress);
  await mintTx.wait();
  console.log("Token minted successfully to:", recipientAddress);
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
