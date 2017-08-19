'use strict';

module.exports = {
  url: process.env.MONGO_URL || `mongodb://${process.env.MONGO_SERVER || 'localhost'}:27017/archDB`,
  options: { useMongoClient: true }
};
