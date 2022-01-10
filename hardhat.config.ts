import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: "0.8.10",
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
