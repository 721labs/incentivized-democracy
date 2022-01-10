import { Contract } from "@ethersproject/contracts";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("HelloWorld.sol", async () => {
  let contract: Contract;

  before(async function () {
    const factory = await ethers.getContractFactory("HelloWorld");

    contract = await factory.deploy();
    await contract.deployed();
  });

  it("deploys", async () => {
    expect(contract.address).to.not.be.null;
  });
});
