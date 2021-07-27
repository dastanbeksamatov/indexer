const { Sequelize } = require("sequelize");
const {init, coins, Status} = require("./models");
const API = require("./service");

/**
 * Class that represents price indexer for coins
 * @field db - instance of Sequelize
 * @field coins - list of coins to price index: string[] or Model[]
 */
class PriceIndexer {
    constructor (db, _coins, _fiats) {
        this.db = db;
        this.coinSymbols = this._isStringArray(_coins) ? _coins : Object.keys(coins);
        this.fiatSymbols = this._isStringArray(_fiats) ? _fiats : Object.keys(this.fiats);
    }

    /**
     * Create instance of PriceIndexer
     * @param {*} dbUrl postgres db url 
     * @param {*} dbOptions options for db
     * @param {*} sync option to sync db, defaults to true
     * @returns 
     */
    static async create(dbUrl, dbOptions, sync = true, coins = [], fiats = []) {
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
        if (!coins.length) {
            console.log('Error: Empty coins list!');
            return ;
        }

        return new PriceIndexer(db, coins, fiats);
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
        try {
            const api = new API();
            await Promise.all(this.coinSymbols.forEach(async (symbol, i) => {
                    const response = await api.getCoinHistory(symbol, from, to, samples, offset);
                    if(response.error) {
                        return this._handleError(response.error);
                    }
                    await this.pushCoins(symbol, response.data);
                })
            )
            await this.pushFiats(api);
            await this.syncStatus(from);
        } catch (err) {
            return this._handleError(err);
        }

    }

    async pushFiats(api) {
        const t = await this.db.transaction();
        const response = await api.get
    }
    /**
     * Push indexed data to db
     */
    async pushCoins(symbol, data) {
        try {
            const t = await this.db.transaction();
            data = data[symbol];

            await Promise.all([
                this.syncCoins(symbol, data, { transaction: t }),
            ])
            .then(() => {
                return t.commit();
            })
            .then(() => {
                console.log(`Finished indexing coins: ${symbol}`);
                return ;
            })
            .catch((error) => {
                t.rollback();
                console.error(`error during indexing coins: ${error.message}`);
                return ;
            })
        } catch (err) {
            return this._handleError(err);
        }
    }

    /**
     * Sync fetched data with db
     * @param {*} symbol 
     * @param {*} data 
     * @param {*} options 
     */
    async syncCoins(symbol, data, options) {
        const requests = [];
        for (const [timestamp, coinprice_usd, volume_24h, _] of data) {
            requests.push(
                {
                    timestamp,
                    coinprice_usd,
                    volume_24h
                }
            );
        }
        await coins[symbol].bulkCreate(requests, options);
    }


    /**
     * Sync indexing status for the date in db
     * @param {*} date 
     * @param {*} status 
     */
    async syncStatus(date, status, options) {
        await Status.upsert(
            {
                date,
                status
            },
            options
        )
    }
    /**
     * Check if db is already populated
     * @param date - date to check
     */
    async _checkPopulated(date) {
        const status = await Status.findOne({ date: date });
        return status ? status.get('status') : false;
    }

    /**
     * Handler for error
     * @param {*} error - instance of error
     */
    _handleError(error) {
        console.log(`Error: ${error.toString()}`);
        console.log(`Will retry later`);
    }

    /**
     * Checks if variable is a string array
     * @param {*} value 
     * @returns boolean 
     */
    _isStringArray(value) {
        return value instanceof Array && value.every(element => (typeof element === 'string'))
    }
}

module.exports = PriceIndexer;