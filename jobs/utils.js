const utils = {
    /**
    * Formats date to correct format for API request
    * Format is: yyyy-mm-dd
    * @param {*} date - date to convert
    * @param {*} yesterday - should date revert back to yesterday
    * @returns - string date of format yyyy-mm-dd
    */
    handleDate: (date, yesterday = false) => {
        date = new Date(date);
        if(yesterday) {
            date.setDate(date.getDate() - 1);
        }
        return date.toISOString().slice(0, 10);
    },
    /**
     * Returns unix timestamp converted to ISO date
     * @param {*} timestamp
     * @returns - string date in ISO format
     */
    unixTimeToDate: (timestamp) => {
        return new Date(timestamp*1000).toISOString();
    },
    /**
     * Compare dates
     * @param {*} a - date a 
     * @param {*} b - date b
     */
    isSameDate(a, b) {
        a = new Date(a).toISOString().slice(0, 10);
        b = new Date(b).toISOString().slice(0, 10);
        return a === b;
    }
}

module.exports = utils;