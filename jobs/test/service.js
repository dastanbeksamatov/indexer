const API = require("../service");
const { expect} = require("chai");
const PriceIndexer = require("../indexer");
const { fiats, coins, Status } = require("../db");
const sequelize = require("sequelize");
const { handleDate } = require("../utils");

describe.only("test api service", function() {
    this.timeout(10000);
    
    let api = new API();
    let TEST_DB = process.env.TEST_DB;
    let coinList = Object.keys(coins);
    let fiatList = Object.keys(fiats);
    const dbOptions = {
        logging: false,
        dialect: "postgres"
    };
    const NUMBER_SAMPLES = 1000;

    /**
     * Indexer instance for testing
    */
    let indexer = {};
    
    /**
     * Counts how many objects a Model (currency in our case) has in a db in a given day
     * @param {*} symbol - unique symbol of the currency
     * @param {*} date - which day
     * @param {*} type - type of the currency
     * @returns number
     */
    async function getCount(symbol, date, type) {
        switch(type){
            case 'fiat': {
                const all = await fiats[symbol].count({where: sequelize.where(sequelize.fn('date', sequelize.col('createdAt')), '=', date)});
                console.log(`count: ${all}`);
                return all;
            }
            case 'coin': {
                const all = await coins[symbol].count({where: sequelize.where(sequelize.fn('date', sequelize.col('createdAt')), '=', date)});
                return all;
            }
            default: {
                return 0;
            }
        }
    }

    this.beforeEach(async function() {
        indexer = await PriceIndexer.create(TEST_DB, dbOptions, true, coinList, fiatList);
    })

    it("should index price for yesterday if not specified", async function() {
        await indexer.start();

        const day = handleDate(new Date(), true);
        const status = await Status.findOne({where: {date: day}});
        
        expect(status.status).to.be.equal(true, "Indexer did not complete successfully");
        expect(status.date).to.be.equal(day, "Days don't match");
    })

    it("should index all returned data from API request", async function() {
        const day = handleDate(new Date());

        await indexer.start(day, NUMBER_SAMPLES);

        const expectedCounter = {};
        const actualCounter = {};

        const yesterday = handleDate(day, true);

        for (const coin of coinList) {
            const response = await api.getCoinHistory(coin);
            const count = await getCount(coin, yesterday, 'coin');
            expectedCounter[coin] = response.data[coin].length;
            actualCounter[coin] = count;
        }

        for (const fiat of fiatList) {
            const response = await api.getFiatHistory(fiat, yesterday);
            const count = await getCount(fiat, yesterday, 'fiat');
            expectedCounter[fiat] = response.data['quotes'][`${fiat}USD`] && 1
            actualCounter[fiat] = count;
        }

        console.log(`actual count: ${JSON.stringify(actualCounter)}`);
        console.log(`expected count: ${JSON.stringify(expectedCounter)}`);

        expect(actualCounter).to.deep.equal(expectedCounter, 'Indexed object count is not equal to fetched object count');
    })


    afterEach(async () => {
        console.log(`dropping test db!`);
        await indexer.db.drop();
    })
})
