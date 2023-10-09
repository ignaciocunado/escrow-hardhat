require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: process.env.TEST_RPC_URL,
    },
  },
  paths: {
    artifacts: "./app/src/artifacts",
  },
};
