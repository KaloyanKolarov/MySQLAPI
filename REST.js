module.exports = REST_ROUTER;

function REST_ROUTER(router, connection, md5) {
    var self = this;
    self.handleRoutes(router, connection, md5);
}

REST_ROUTER.prototype.handleRoutes = function(router, connection, md5) {
    require('./routes')(router, connection, md5);
};

module.exports = REST_ROUTER;