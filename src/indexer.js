const { Sequelize } = require("sequelize");
const {init, coins, Status} = require("./models");
const Coincodex = require("./service");

/**
 * Class that represents price indexer for coins
 * @field db - instance of Sequelize
 * @field coins - list of coins to price index: string[] or Model[]
 */
class PriceIndexer {
    constructor (db, _coins) {
        this.db = db;
        const isStringArray = _coins instanceof Array && _coins.every(coin => (typeof coin === 'string'));
        this.symbols = isStringArray ? _coins : Object.keys(coins);
    }

    /**
     * Create instance of PriceIndexer
     * @param {*} dbUrl postgres db url 
     * @param {*} dbOptions options for db
     * @param {*} sync option to sync db, defaults to true
     * @returns 
     */
    static async create(dbUrl, dbOptions, sync = true, coins = [], retry = 1) {
        console.log('creating price indexer');
        const db = new Sequelize(dbUrl, dbOptions);
        await db.authenticate();

        console.log('Initializing db');
        init(db);
        if(sync) {
            console.log('Syncing db');
            await db.sync();
            console.log('Succesfully synced db!');
        }
        if (coins.length) {
            console.log('Error: Empty coins list!');
            return ;
        }

        return new PriceIndexer(db, coins);
    }

    /**
     * Start indexing prices
     * @param {*} symbol Coin symbol
     * @param {*} from start date
     * @param {*} to end date
     * @param {*} samples number of samples
     * @param {*} offset date offset, i.e how many days behind
     */
    async start(from = new Date(), to = new Date(), samples = 1000, offset = 0) {
        const api = new Coincodex();
        try {
            this.symbols.forEach(async (symbol, i) => {
                const response = await api.getCoinHistory(symbol, from, to, samples, offset);
                if(response.error) {
                    return this._handleError(response.error);
                }
                await this.pushData(symbol, response.data[symbol]);
            })
        } catch (err) {
            return this._handleError(err);
        }

    }

    /**
     * Push indexed data to db
     */
    async pushData(symbol, data) {
        try {
            const t = await this.db.transaction();

            await Promise.all([
                this.syncData(symbol, data, { transaction: t }),
                this.syncStatus({ transaction: t }, 1)
            ])
            .then(() => {
                return t.commit();
            })
            .then(() => {
                console.log(`Finished indexing: ${symbol}`);
                return ;
            })
            .catch(async (error) => {
                t.rollback();
                console.error(`error during indexing: ${error.message}`);
                await this.syncStatus({ transaction: t }, 0);
            })
        } catch (err) {
            return this._handleError(err);
        }
    }

    async syncData(symbol, data, options) {
        const requests = [];
        for (const [timestamp, coinprice_usd, volume_24h, _] of data) {
            requests.push(
                coins[symbol].upsert(
                    {
                        timestamp,
                        coinprice_usd,
                        volume_24h
                    },
                    options
                )
            );
        }
        await Promise.all(requests);
    }

    /**
     * Update status of the coin
     * @param {*} symbol 
     * @param {*} date 
     */
    async syncStatus(options, status, date = new Date()) {
        const requests = [];
        for(const symbol of this.symbols) {
            requests.push(
                await Status.upsert({
                    date: typeof date === 'string' ? new Date(date): date,
                    symbol,
                    status: status,
                },
                options
                )
            );
        }  
        await Promise.all(requests);
    }
    /**
     * Check if db is already populated
     */
    checkPopulated() {

    }

    _handleError(error) {
        console.log(`Error: ${error.toString()}`);
        console.log(`Will retry later`);
    }
}

module.exports = PriceIndexer;