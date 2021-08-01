#!/usr/bin/env node

/**
Build a postgres database model and indexer for storing crypto prices using nodejs (v14 or v16) from coincodex.com.

Model:
Database: pricesdb
Tables: BTC, DOT, KSM, ... (Symbols)
Tables format: timestamp, coinprice_usd, 24h volume in USD
50 23 * * * cd /{this_dir} && node price-indexer.js >/tmp/stdout.log 2>/tmp/stderr.log
Indexer:
Iterate trough all symbols once a day:
- From beginning of data
*/
const PriceIndexer = require("./indexer");
const { coins, fiats } = require("./db");

/**
 * Starts the price indexing script
 * Note: This will by default index prices from yesterday.
 * And since price APIs work with UTC time, it's adviced to run it after UTC midnight.
 * For example, you can schedule to run this script every day at UTC 00:05 am,
 * this way you will have complete price data for yesterday
 */
async function startIndexer() {
    const dbUrl = process.env.DB_URL;
    const dbOptions = {
        logging: false,
        dialect: "postgres"
    };
    const indexer = await PriceIndexer.create(dbUrl, dbOptions, true, coins, fiats);
    await indexer.start();
}

startIndexer().catch(err => {
    console.error(err);
    throw new Error(err.message);
}).finally(() => process.exit());
