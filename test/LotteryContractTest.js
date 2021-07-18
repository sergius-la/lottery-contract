const assert = require('assert');
const Lottery = artifacts.require("Lottery")
const User = require('./User.js')

contract("Lottery", () => { // Each contract / it test methods are independent

    let lottery = null;
    let accounts = null;
    let contractManager = null;
    let players = []
    let users = []
    
    const ticketCostWei = web3.utils.toWei('.05', 'ether');
    const ticketCostEther = web3.utils.fromWei(ticketCostWei, 'ether')

    before(async () => {
        lottery = await Lottery.deployed()
        accounts = await web3.eth.getAccounts()
        contractManager = accounts[0]
        players = [accounts[1], accounts[2], accounts[3], accounts[4]]
        // Init Users
        players.forEach(async (address) => {
            users.push(new User(address, await getBalance(address)))
        })
    })

    it('Shoud deploy smart contract properly', async () => {
        console.log("Address of contract", lottery.address)
        assert(lottery.address !== '')
    })

    it('Verify contract manager', async () => {
        let manager = await lottery.manager() // "Call()" data from the contract
        console.log("Contract manager", manager);
        assert(manager === contractManager)
    })

    it('All players buy a ticket', async () => {
        
        // Buy tickets for all players
        for (i=0; i < players.length; i++) {
            await lottery.enter({
                  from: players[i],
                  value: ticketCostWei
            })
        }
        
        let contractBalanceWei = await getBalance(lottery.address)
        
        // Balance of contract should match to the amaount = ticket cost * num of players
        let expectedBalance = ticketCostEther * players.length;
        let contractBalanceEther = web3.utils.fromWei(contractBalanceWei, 'ether');
        
        assert(contractBalanceEther, expectedBalance, "Contract ballance not match") 
    })
    
    it('Verify number of purchases', async () => {
        const buyers = await lottery.getPlayers()

        // Number of buyers shoud match to the number of players
        assert(buyers.length == players.length, "Number of players not match to buyers")
        
        // All buyers should be in the list of players
        buyers.forEach(address => {
            assert(players.includes(address), "The address should be in buyers and players lists")
        })
    })

    it('Pick a winner', async () => {
        
        // Select a winner
        await lottery.pickWinner()

        // Update users with latests ballances
        for (i=0; i < users.length; i++) {
            let endBallanceValue = await getBalance(users[i].address)
            users[i].endBallance = endBallanceValue // Assing new property
        }

        // Get list of losers
        let losers = users.filter((user) => {
            return Number(user.endBallance) < Number(user.initBallance)
        })
        
        // Expected number of loosers shoud be number of players - 1 
        let expectedNumLosers = players.length - 1
        assert(losers.length, expectedNumLosers, "Number of losers not match to expected")

        // Get list of winners
        let winners = users.filter((user) => {
            return Number(user.endBallance) > Number(user.initBallance)
        })
        assert(winners.length, 1, "Number of winners not match to expected")
    })
})

async function getBalance(address) {
    return await await web3.eth.getBalance(address)
}