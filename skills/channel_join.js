const debug = require('debug')('botkit:channel_join');
const logger = require('winston');

module.exports = function(controller) {

    controller.on('bot_channel_join', function(bot, message) {

        controller.studio.run(bot, 'channel_join', message.user, message.channel).catch(function(err) {
            debug('Error: encountered an error loading onboarding script from Botkit Studio:', err);
        });

    });

}
