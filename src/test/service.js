const Coincodex = require("../service");
const {assert} = require("chai");

describe.only("test api service", function() {
    this.timeout(10000);
    let api = new Coincodex();
    let coins = ["BTC", "DOT"];

    it("should get history of the coin", async () => {
        let today = new Date();
        let yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const response = await api.getCoinHistory(coins[0], yesterday, today, 1000);
        console.log(`data: ${response}`)
        assert.isArray(response.data[], "Experienced error");
    })
})