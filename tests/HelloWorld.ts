import { Contract } from "@ethersproject/contracts";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("HelloWorld.sol", async () => {
  let contract: Contract;

  let governor: Contract;

  let bob: Contract;
  let bobAddress: string;

  let sue: Contract;
  let sueAddress: string;

  let alice: Contract;
  let aliceAddress: string;

  const provider = hre.waffle.provider;
  let snapshot: any;

  async function snapshotEVM(): Promise<void> {
    snapshot = await provider.send("evm_snapshot", []);
  }

  before(async function () {
    const signers = await ethers.getSigners();

    bobAddress = await signers[1].getAddress();
    sueAddress = await signers[2].getAddress();
    aliceAddress = await signers[3].getAddress();

    const factory = await ethers.getContractFactory("HelloWorld");
    contract = await factory.deploy(bobAddress, aliceAddress, sueAddress);
    await contract.deployed();

    governor = contract.connect(signers[0]);
    bob = contract.connect(signers[1]);
    sue = contract.connect(signers[2]);
    alice = contract.connect(signers[3]);

    await snapshotEVM();
  });

  // Reset contract state
  beforeEach(async function () {
    await provider.send("evm_revert", [snapshot]);
    await snapshotEVM();
  });

  it("deploys", async () => {
    expect(contract.address).to.not.be.null;
  });

  describe("Voting", async () => {
    it("Does not allow casting more than allowance", async () => {
      await expect(bob.vote(11, 1)).to.be.revertedWith("Not enough votes");
    });

    it("To simplify the example, vote counts must be quadratic", async () => {
      await expect(bob.vote(2, 1)).to.be.revertedWith(
        "Count must be quadratic"
      );
    });

    it("Votes are counted quadratically", async () => {
      // 1 credit -> 1 vote on 1
      await bob.vote(1, 1);
      expect(await contract.getVoteCount(1)).to.equal(1);
      expect(await contract.voteAllowance(bobAddress)).to.equal(9);

      // 4 credits -> 2 votes on 2
      await bob.vote(4, 2);
      expect(await contract.getVoteCount(2)).to.equal(2);
      expect(await contract.voteAllowance(bobAddress)).to.equal(5);

      // 9 credits -> 3 votes on 2
      await sue.vote(9, 2);
      expect(await contract.getVoteCount(2)).to.equal(5);
    });
  });

  describe("Vote Allowance Determination", async () => {
    it("Decreases future allowance by 1 if citizen didn't vote", async () => {
      await bob.vote(1, 1);
      await alice.vote(4, 2);

      await governor.closeVoting();

      expect(await contract.voteAllowance(sueAddress)).to.equal(9);
      expect(await contract.voteAllowance(bobAddress)).to.not.equal(9);
      expect(await contract.voteAllowance(aliceAddress)).to.not.equal(9);
    });

    it("Increases future allowance by 1 if citizen voted", async () => {
      await bob.vote(1, 1);
      await alice.vote(4, 2);

      await governor.closeVoting();

      expect(await contract.voteAllowance(sueAddress)).to.not.equal(11);
      expect(await contract.voteAllowance(bobAddress)).to.equal(11);
      expect(await contract.voteAllowance(aliceAddress)).to.equal(11);
    });
  });
});
