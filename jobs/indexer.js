const { Sequelize } = require("sequelize");
const {init, coins, fiats, Status} = require("./db");
const API = require("./service");
const { handleDate, unixTimeToDate, isSameDate } = require("./utils");

/**
 * Class that represents price indexer for coins
 * @field db - instance of Sequelize
 * @field coins - list of coins to price index: string[] or Model[]
 */
class PriceIndexer {
    constructor (api, db, _coins, _fiats) {
        this.api = api;
        this.db = db;
        this.coinSymbols = this._isStringArray(_coins) ? _coins : Object.keys(coins);
        this.fiatSymbols = this._isStringArray(_fiats) ? _fiats : Object.keys(fiats);
    }

    /**
     * One day represented as milliseconds
     */
    static ONE_DAY_AS_MILLIS = 86400000;

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
        const api = new API();
        console.log('Initializing db');
        init(db);
        if(sync) {
            console.log('Syncing db');
            await db.sync();
            console.log('Succesfully synced db!');
        }
        if (!coins && !fiats) {
            console.log('Error: Empty coins list!');
            return ;
        }

        return new PriceIndexer(api, db, coins, fiats);
    }

    /**
     * Start indexing prices for a range of days
     * @param {*} symbol Coin symbol
     * @param {*} from start date - defaults to today
     * @param {*} to end date of days to index - defaults to today
     * @param {*} samples number of samples
     */
    async start(from = new Date(), to = new Date(), samples = 1000) {
        if(isSameDate(from, to)) {
            await this.indexDay(from, samples);
        }
        to = new Date(to);
        
        for(let day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {
            await this.indexDay(day, samples);
        }
    }

    /**
     * Indexes prices for a certain day
     * @param {*} day 
     */
    async indexDay(day, samples = 1000) {
        const date = handleDate(day);
        const isPopulated = await this._checkPopulated(date);
        if(isPopulated) {
            console.log('already indexed for: ' + date);
            return ;
        }
        try {
            console.log('start indexing for date: ' + date);
            console.log('start indexing fiats...');
            await this.pushFiats(date);

            console.log('start indexing crypto...' + this.coinSymbols.join(','));
            await Promise.all(this.coinSymbols.map(async (symbol) => {
                const response = await this.api.getCoinHistory(symbol, date, samples);
                if(response.error) {
                    return this._handleError(response.error);
                }
                await this.pushCoin(symbol, response.data);
            })
            ).then(async () => {
                await this.syncStatus(date, 1);
                return ;
            })
        } catch (err) {
            return this._handleError(err);
        }
    }
    
    /**
     * Index fiats
     * @param {*} day 
     */
    async pushFiats(day) {
        try {
            const t = await this.db.transaction();
            const requests = [];
            for (const fiat of this.fiatSymbols) {
                const response = await this.api.getFiatHistory(fiat, day);
                if(response.error) {
                    return this._handleError(response.error);
                }
                requests.push(
                    fiats[fiat].upsert(
                        {
                            timestamp: response.data['timestamp'],
                            utc_date: unixTimeToDate(response.data['timestamp']),
                            price_usd: response.data['quotes'][`${fiat}USD`],
                        },
                        {
                            transaction: t
                        }
                    )
                )
            }
            await Promise.all(requests)
                .then(() => {
                    return t.commit();
                })
                .then(() => {
                    console.log('finished indexing fiats');
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
     * Push indexed data to db
     */
    async pushCoin(symbol, data) {
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
                console.log(`Finished indexing coin: ${symbol}`);
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
                    utc_date: unixTimeToDate(timestamp),
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
    async syncStatus(date, status) {
        const t = await this.db.transaction();
        await Status.upsert(
            { date, status},
            { transaction: t }
        ).then(() => {
            return t.commit();
        })
        .then(() => {
            console.log('finished indexing');
            return;
        })
        .catch((error) => {
            t.rollback();
            this._handleError(error);
            return ;
        })
    }
    /**
     * Check if db is already populated
     * @param date - date to check
     */
    async _checkPopulated(date) {
        const status = await Status.findOne({ where: { date: date} });
        return status ? status.get('status'): false;
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