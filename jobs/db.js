const { Model, DataTypes } = require('sequelize');

const _coinScheme = {
    timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    utc_date: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    coinprice_usd: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    volume_24h: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
};

const _fiatScheme = {
    timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    utc_date: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    price_usd: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    volume_24h: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
};

// models for cryptocurrencies
class BTC extends Model {};
class DOT extends Model {};
class ETH extends Model {};
class KSM extends Model {};

// models for fiat currencies
class EUR extends Model {};
class GBP extends Model {};
class CHF extends Model {};

/**
 * Class that keeps track whether price was indexed for a certain day
 */
class Status extends Model {};

/**
 * Initializes and sets up DB
 * @param {*} db Sequelize instance
 */
function init(db) {
    BTC.init(_coinScheme, {sequelize: db});
    DOT.init(_coinScheme, {sequelize: db});
    ETH.init(_coinScheme, {sequelize: db});
    KSM.init(_coinScheme, {sequelize: db});
    EUR.init(_fiatScheme, {sequelize: db});
    GBP.init(_fiatScheme, {sequelize: db});
    CHF.init(_fiatScheme, {sequelize: db});

    Status.init(
        {
            date: DataTypes.STRING,
            status: DataTypes.BOOLEAN
        },
        {sequelize: db}
    )
}

module.exports = {
    init,
    coins: {BTC, DOT, KSM, ETH},
    fiats: {EUR, GBP, CHF},
    Status
};