const axios = require('axios').default;
const { handleDate } = require('./utils');
/**
 * @description Class representinng Coincodex API 
 */
class API {
    constructor() {
        this.coinUrl = 'https://coincodex.com/api/coincodex';
        this.fiatUrl = 'https://api.currencylayer.com';
    }
    /**
     * Gets an array coin states of format [[timestamp, price, volume], ...]
     * @param {*} symbol unique symbol of a coin [required]
     * @param {*} from starting date
     * @param {*} to ending date
     * @param {*} samples number of samples
     */
    async getCoinHistory(symbol, from = new Date(), samples = 1000) {
        const today = handleDate(from);
        const yesterday = handleDate(from, true);
        const url = `${symbol}/${today}/${yesterday}/${samples}`;
        const response = await axios.get(`/get_coin_history/${url}`, {baseURL: this.coinUrl});
        if(response.status !== 200) {
            return { error: response.statusText }
        }
        return { data: response.data }
    }

    /**
     * Get historical data for fiat currencies
     * @param {*} symbol 
     * @param {*} from - defaults to now
     * @returns 
     */
    async getFiatHistory(symbol, from = new Date()) {
        from = handleDate(from);
        const accesKey = process.env.ACCESS_KEY;
        const response = await axios.get('/historical', {
            baseURL: this.fiatUrl,
            params: {
                access_key: accesKey,
                format: 1,
                date: from,
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