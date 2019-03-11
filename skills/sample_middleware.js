const logger = require('winston');

module.exports = function(controller) {

    controller.middleware.receive.use(function(bot, message, next) {

        // do something...
        logger.info('RCVD:', message);
        next();

    });


    controller.middleware.send.use(function(bot, message, next) {

        // do something...
        logger.info('SEND:', message);
        next();

    });

}
