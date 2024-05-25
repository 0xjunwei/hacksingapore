require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SIGNUP_WALLET = process.env.SIGNER_WALLET;
const ARBI_SEPOLIA_RPC_URL = process.env.ARBI_SEPOLIA_RPC_URL;
const AMOY_RPC_URL = process.env.AMOY_RPC_URL;
const ETHERSCAN_API = process.env.ETHERSCAN_API;
const POLYSCAN_API = process.env.POLYSCAN_API;
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    amoy: {
      url: AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
      gasPrice: 3000000000,
      chainId: 80002,
    },
    sepolia: {
      url: ARBI_SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY, SIGNUP_WALLET],
      gasPrice: "auto",
      chainId: 421614,
    },
  },
  solidity: "0.8.24",
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API,
      polygon: POLYSCAN_API,
      amoy: POLYSCAN_API,
    },
    customChains: [
      {
        network: "sepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/",
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  mocha: {
    timeout: 500000,
  },
};
