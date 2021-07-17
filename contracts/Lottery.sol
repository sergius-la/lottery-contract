// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Lottery {

  address public manager;
  address[] public players;

  constructor() public {
    manager = msg.sender;
  }

  function enter() 
    public
    payable 
    {
      require(msg.value > .01 ether, "msg.value is less than .01 (min ticket cost)");
      players.push(msg.sender);
    }
  
  function pickWinner() 
    public
    payable
    restricted
  {
    uint index = random() % players.length;
    address payable winner = address(uint160(players[index]));
    winner.transfer(address(this).balance);
    players = new address[](0);
  }

  function random()
    private
    view
    returns(uint)
  {
    return uint(keccak256((abi.encode(block.difficulty, block.timestamp, players))));
  }


  modifier restricted()
  {
    require(msg.sender == manager);
    _;
  }
}
