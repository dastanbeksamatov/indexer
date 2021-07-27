#!/bin/env node
"use strict";
/**
Build a postgres database model and indexer for storing crypto prices using nodejs (v14 or v16) from coincodex.com.

Model:
Database: pricesdb
Tables: BTC, DOT, KSM, ... (Symbols)
Tables format: timestamp, coinprice_usd, 24h volume in USD

Indexer:
Iterate trough all symbols once a day:
- From beginning of data
*/
const PriceIndexer = require("./indexer");
const { coins, fiats } = require("./models");

(async () => {
    const dbUrl = 'postgres://dastansamat:dastansamat@127.0.0.1:5432/pricesdb';
    const dbOptions = {
        logging: false,
        dialect: "postgres"
    };
    const indexer = await PriceIndexer.create(dbUrl, dbOptions, true, coins);
    
    await indexer.start();
})