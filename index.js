#!/bin/env node

const Indexer = require('@open-web3/indexer');

const run = async () => {
  const dbUrl = '<db-url>';
  const dbOptions = {
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false        
      },
    }
  };
  const wsUrl = 'ws://127.0.0.1:9944';

  const indexer = await Indexer.indexer.create({
    dbUrl,
    dbOptions,
    wsUrl,
    sync: true
  });

  await indexer.start(); 
};

run().catch((err) => {
  console.error(err);
  throw new Error(err.message)
});