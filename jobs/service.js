const axios = require('axios').default;
const { handleDate } = require('./utils');
/**
 * @description Class representing API instance for indexer
 */
class API {
    constructor() {
        this.coinUrl = 'https://coincodex.com/api/coincodex';
        this.fiatUrl = 'https://api.currencylayer.com';
    }
    /**
     * Gets an array coin states of format [[timestamp, price, volume], ...]
     * @param {*} symbol unique symbol of a coin [required]
     * @param {*} date indexing day
     * @param {*} samples number of samples
     */
    async getCoinHistory(symbol, date = new Date(), samples = 1000) {
        const from = handleDate(date, true);
        const to = handleDate(date);
        const url = `${symbol}/${from}/${to}/${samples}`;
        const response = await axios.get(`/get_coin_history/${url}`, {baseURL: this.coinUrl});
        if(response.status !== 200) {
            return { error: response.statusText }
        }
        return { data: response.data }
    }

    /**
     * Get historical data for fiat currencies
     * @param {*} symbol 
     * @param {*} date - defaults to now
     * @returns 
     */
    async getFiatHistory(symbol, date = new Date()) {
        /**
         * if given date is today, get info for yesterday
         */
        if(date instanceof Date) {
            date = handleDate(date, true);
        }

        const accesKey = process.env.ACCESS_KEY;
        const response = await axios.get('/historical', {
            baseURL: this.fiatUrl,
            params: {
                access_key: accesKey,
                format: 1,
                date,
                currencies: 'USD',
                source: symbol
            }
        });
        if(response.status !== 200) {
            return { error: response.statusText }
        }
        return { data: response.data }
    }
}

module.exports = API;
