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
});