// Configuration settings

const config = {
    APP_PORT: process.env.APP_PORT || 3000,
    DB_URL: process.env.DB_URL || 'mongodb://localhost:27017/cozyjet',
};

module.exports = config;