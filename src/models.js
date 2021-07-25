const { Model, DataTypes } = require('sequelize');
/**
 * Represents common scheme for every coin
 */
const _coinScheme = {
    timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
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
class BTC extends Model {};
class DOT extends Model {};
class ETH extends Model {};
class KSM extends Model {};

/**
 * Class that keeps track whether price was indexed for a certain date
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
}

module.exports = {
    init,
    coins: {BTC, DOT, KSM, ETH},
    Status
};