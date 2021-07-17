const Lottery = artifacts.require("Lottery")

contract("Lottery", () => { // Each contract / it test methods are independent

    let lottery = null;
    let accounts = null;
    let contractManager = null;
    let players = []

    before(async () => {
        lottery = await Lottery.deployed()
        accounts = await web3.eth.getAccounts()
        contractManager = accounts[0]
        players = [accounts[1], accounts[2], accounts[3], accounts[4]]
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

    it('Send ether to contract', async () => {
        let amaount = web3.utils.toWei('.05', 'ether');
        
        await lottery.enter({ // Send money to contract
            from: players[0],
            value: amaount
        })

        let contractBalance = await web3.eth.getBalance(lottery.address)
        let balanceInether = web3.utils.fromWei(contractBalance, 'ether')
        assert(Number(balanceInether) === 0.05)
    })
})