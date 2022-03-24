// contracts/HelloWorld.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract HelloWorld {
  mapping(address => uint256) public voteAllowance;

  // For example sake, voting is on a single proposition.
  mapping(uint8 => mapping(address => uint256)) public votes;

  // Deployer governs the election
  address public governor;

  // The citizens
  address private _bob;
  address private _alice;
  address private _sue;

  constructor(
    address bob,
    address alice,
    address sue
  ) {
    // Assign deployer as the governor of the contract.
    governor = msg.sender;

    // Add the citizens' addresses
    _bob = bob;
    _alice = alice;
    _sue = sue;

    // Give each of our example "citizens" 10 votes to start.
    voteAllowance[bob] = 10;
    voteAllowance[alice] = 10;
    voteAllowance[sue] = 10;

    // Instantiate vote count
    votes[1][bob] = 0;
    votes[1][sue] = 0;
    votes[1][alice] = 0;
    votes[2][bob] = 0;
    votes[2][sue] = 0;
    votes[2][alice] = 0;
  }

  /// @notice Casting votes
  /// @param count How many votes does this citizen want to use?
  function vote(uint256 count, uint8 option) public {
    require(count <= voteAllowance[msg.sender], "Not enough votes");
    require(option == 1 || option == 2, "Bad option");

    // In quadratic voting, the square root of the number of votes cast are applied;
    // this enforces a linearly increasing marginal cost on power concentration and acts to
    // counterbalance our vote award / dilution system.
    if (count == 1) {
      votes[option][msg.sender] += 1;
    } else if (count == 4) {
      votes[option][msg.sender] += 2;
    } else if (count == 9) {
      votes[option][msg.sender] += 3;
    } else {
      require(false, "Count must be quadratic");
    }

    // Subtract votes from voter.
    voteAllowance[msg.sender] -= count;
  }

  /// @notice Determine how many votes each voter should have in the next election.
  /// If citizen cast a vote, provide an additional vote next time.
  /// If citizen didn't cast a vote, remove a vote next time.
  /// Future: This could be expanded to add/subtrack proportional to the number of votes cast to incentivize
  /// people to cast all of their votes.
  /// @param voter Voter address to check.
  function setNextVoteAllowance(address voter) internal {
    if (votes[1][voter] == 0 && votes[2][voter] == 0) {
      voteAllowance[voter] = 9;
    } else {
      voteAllowance[voter] = 11;
    }
  }

  /// @notice Counts number of votes for a given option id.
  /// @param option option id.
  /// @return vote count
  function getVoteCount(uint8 option) public view returns (uint256) {
    require(option == 1 || option == 2, "Bad option");
    return votes[option][_bob] + votes[option][_sue] + votes[option][_alice];
  }

  /// @return ID of winning option
  function closeVoting() public returns (uint256) {
    // Only the governor can close elections
    require(msg.sender == governor, "Governor only");

    // Set vote allowance for next election
    setNextVoteAllowance(_bob);
    setNextVoteAllowance(_sue);
    setNextVoteAllowance(_alice);

    // Return the winning option
    if (getVoteCount(1) > getVoteCount(2)) {
      return 1;
    } else {
      return 2;
    }
  }
}
