module.exports = {
    handleDate: (date, yesterday = false) => {
        if (typeof(date) === 'string' && date.length === 10) {
            return date;
        }
        else if(date instanceof Date && yesterday) {
            date.setDate(date.getDate() - 1);
            return date.toISOString().slice(0, 10);
        }
        return date.toISOString().slice(0, 10);
    }
}