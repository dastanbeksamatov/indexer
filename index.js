#!/bin/env sh
const Bree = require('bree');
const Cabin = require('cabin');

/**
 * bree instance that generates a cron job with a schedule
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