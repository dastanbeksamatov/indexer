# Crypto price indexer

This script is used to index crypto and fiat price everyday. 

## Setup

Clone this repo and open it in your favorite editor:

`git clone https://github.com/dastanbeksamatov/indexer`

Install dependencies:

`npm install`

## Env variables

### API key
For indexing fiat, [**CurrencyLayer** API](https://api.currencylayer.com) is used and you will need to get `access key` to make requests to it.

Set your access key, if you want to index fiat currencies.

`export ACCESS_KEY=<your-access-key>`


### Database url

Also, make sure to set `DB_URL` with the valid url of your running `PostgreSQL` database:

`export DB_URL=<your-db-url>`

## Run

`price-indexer` can be run in two ways:

### **NodeJs**  
One way to run this script is to launch it with `cron-like` scheduler [`bree`](https://github.com/breejs/bree). The following command should start the indexer.

`node index.js`

However, for the indexer to run indefinetely, you will need to keep the `NodeJs` script running for as long as you need indexing. For this reason, it is recommended to use `crontab` for job scheduling.

### crontab  (Recommended) :construction:
NOTE! Under construction!  
`cron` also known as `cron job` is a time-based job scheduler.  
With the use of crontab, we can configure to run our script at certain time every day.

To create a cron job that runs this script every day at `00:05 am`, run:  
```bash
crontab -e
```
Inside the interactive editor, paste the following line (making sure that your have valid path to the `indexer`):

`05 00 * * * cd /<path-to-indexer> && node jobs/price-indexer.js >/tmp/stdout.log 2>/tmp/stderr.log`

This will index all the price feed for the past day.

#### What do the above commands mean?
- `50 23 * * *` - scheduled execution time of the job
- `cd /<path-to-indexer> && node jobs/price-indexer.js` - runs the indexing script
- `>/tmp/stdout.log 2>/tmp/stderr.log` - pipelines error and std output to log files

## Customize

### New currency
To add new currency to index, add corresponding model in the `/jobs/db.js`. For example, to add new cryptocurrency `DOGE`:

```js
// jobs/db.js

...
class KSM extends Model {};
// new currency
class DOGE extends Model {};

...
function init(db) {
    ...
    KSM.init(_coinScheme, {sequelize: db});
    // register in db initialization
    DOGE.init(_coinScheme, {sequelize: db});

module.exports = {
    ...
    // export DOGE along with other coins
    coins: {BTC, DOT, KSM, ETH, DOGE},
    ...
};
...
```

Follow the similar steps for the fiat currency. Just make sure to select `_fiatScheme` scheme while initializing.

### Customize execution schedule

Since both `Coincodex` and `Currencylayer` send historical data with UTC date format, it's adviced to run the script everyday after UTC midnight time, since doing otherwise would give incomplete historical data.

But if you still want to change the script execution time, you can change interval value in `index.js`:

```js       
            ...
			interval: 'every day at 02:22 am',
            ....
```
For `crontab`, you can use available [tools](https://crontab.guru/) that convert your desired scheduling time to a cron syntax.

## Tests

Tests are located at `/jobs/test` and can be run via:

`npm run test`

Before testing, obviously, make sure that you have set environmental variables for test database.
**WARNING** - test database should be only for testing and should not contain any sensitive info, since after every test case, database is dropped.

```bash
TEST_DB=<test-db-url>
ACCESS_KEY=<your-api-key>
```
