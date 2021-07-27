#!/bin/env node
const Bree = require('bree');
const Cabin = require('cabin');
const path = require('path');

const logger = new Cabin();

/**
 * bree instance that generates a cron job with a schedule
 */
const bree = new Bree({
	logger,
	jobs: [
		{
			name: 'price-indexer',
			interval: 'at 11:50 pm',
			path: path.resolve(__dirname, './src/index.js')
		}
	]
})

bree.start();