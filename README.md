# Crypto price indexer

This is an example of using [`@open-web3/indexer`](https://github.com/open-web3-stack/open-web3.js) indexer for a `Substrate` based chain.

## Setup

Clone this repo and open it in your favorite editor:

`git clone https://github.com/dastanbeksamatov/indexer`

Install dependencies:

`npm install`

## Launch Substrate sync node

For the indexer to work, you first need to run a local sync node of a Substrate based chain. This could be `Kusama`, `Polkadot` or a local node. For example, to run the `Kusama` sync node, run the following code:

```
curl https://getsubstrate.io -sSf | bash
git clone https://github.com/paritytech/polkadot kusama
cd kusama
./scripts/init.sh
cargo build --release
./target/release/polkadot --name "Kusama-node" --rpc-cors all --pruning=archive --chain=kusama
```

To index the `Polkadot` node, replace `--chain=kusama` with `--chain=polkadot`

For more information, refer to: https://wiki.polkadot.network/docs/maintain-wss/

## Run

In a separate terminal run the script:

`node index.js`

This should start the indexer, and will log each indexed block in the terminal.
