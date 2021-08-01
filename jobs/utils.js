module.exports = {
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
        return date.toLocaleDateString('en-CA');
    },
    /**
     * Returns unix timestamp converted to ISO date
     * @param {*} timestamp
     * @returns - string date in ISO format
     */
    unixTimeToDate: (timestamp) => {
        return new Date(timestamp*1000).toISOString();
    }
}
