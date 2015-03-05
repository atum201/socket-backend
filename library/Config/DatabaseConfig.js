var DatabaseConfig = {
    host: 'localhost',
    port: 27017,
    database: 'mic',
    getConnectionString: function() {
        return 'mongodb://' + this.host + ':' + this.port + '/' + this.database;
    }
};

module.exports = DatabaseConfig;