#!/bin/env sh
const Bree = require('bree');

/**
 * bree instance that generates a scheduled cron job
 */
const bree = new Bree({
	jobs: [
		{
			name: 'price-indexer',
			interval: 'every day at 03:15 am',
		}
	]
})

console.log('starting the job...');
bree.start();