/**
 * configuration template.
 */
module.exports = {

  connection: {
    host: '0.0.0.0',
    port: 3000
  },

  MONGO_URL: process.env.MONGO_URL || `mongodb://${process.env.MONGO_SERVER || 'localhost'}:27017/archDB`

};