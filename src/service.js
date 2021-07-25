const axios = require('axios').default;

/**
 * @description Class representinng Coincodex API 
 */
class Coincodex {
    constructor() {
        let service = axios.create({ baseURL: 'https://coincodex.com/api/coincodex'});
        service.interceptors.response.use(this._handleSuccess, this._handleError);
        this.service = service;
        this.url = '';
    }
    /**
     * Gets an array coin states of format [[timestamp, price, volume], ...]
     * @param {*} symbol unique symbol of a coin [required]
     * @param {*} from starting date
     * @param {*} to ending date
     * @param {*} samples number of samples
     */
    async getCoinHistory(symbol, from = new Date(), to = new Date(), samples = 1000, offset = 0) {
        from = this._handleDate(from, offset);
        to = this._handleDate(to, offset);
        const url = `${symbol}/${from}/${to}/${samples}`;
        console.log(`querying: ${url}`);
        const response = await this.service.get(`/get_coin_history/${url}`);
        if(response.status !== 200) {
            return { error: response.statusText }
        }
        return { data: response.data }
    }

    /**
     * Makes sure date is in correct format for request
     * YYYY-MM-DD - format
     * @param {*} date either of type string or Date
     * @param {*} offset how many days to substract from date
     * @returns string object of date format `YYYY-MM-DD`
     */
    _handleDate(date, offset = 0) {
        if (typeof(date) === 'string') {
            return date;
        }
        else if(date instanceof Date && offset) {
            date.setDate(date.getDate() - offset);
            return date.toISOString().slice(0, 10);
        }
        return date.toISOString().slice(0, 10);
    }

    /**
     * 
     * @param {*} response response from the request
     * @returns axios response object
     */
    _handleSuccess(response) {
        return response;
    }

    /**
     * 
     * @param {*} error error object
     * @returns axios error object
     */
    _handleError(error) {
        return Promise.reject(error);
    }
}

module.exports = Coincodex;