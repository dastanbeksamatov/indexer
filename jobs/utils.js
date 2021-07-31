module.exports = {
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
     */
    unixTimeToDate: (timestamp) => {
        return new Date(timestamp*1000).toISOString();
    }
}