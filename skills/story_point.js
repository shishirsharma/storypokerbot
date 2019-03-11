/*

Botkit Studio Skill module to enhance the "story_point" script

*/
'use strict';

const logger = require('winston');


module.exports = function(controller) {
    // define a before hook
    // you may define multiple before hooks. they will run in the order they are defined.
    // See: https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#controllerstudiobefore
    controller.studio.before('story_point', function(convo, next) {

        // do some preparation before the conversation starts...
        // for example, set variables to be used in the message templates
        //logger.info(`BEFORE: convo ${JSON.stringify(convo)}`);
        logger.info(convo);

        // convo.setVar('foo','bar');

        logger.info('BEFORE: story_point');
        // don't forget to call next, or your conversation will never continue.
        next();

    });

    /* Validators */
    // Fire a function whenever a variable is set because of user input
    // See: https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#controllerstudiovalidate
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    // Validate user input: question_1
    controller.studio.validate('story_point','question_1', function(convo, next) {

        var value = convo.extractResponse('question_1');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        logger.info('VALIDATE: story_point VARIABLE: question_1');

        // always call next!
        next();

    });

    // Validate user input: question_2
    controller.studio.validate('story_point','question_2', function(convo, next) {

        var value = convo.extractResponse('question_2');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        logger.info('VALIDATE: story_point VARIABLE: question_2');

        // always call next!
        next();

    });

    // Validate user input: question_3
    controller.studio.validate('story_point','question_3', function(convo, next) {

        var value = convo.extractResponse('question_3');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        logger.info('VALIDATE: story_point VARIABLE: question_3');

        // always call next!
        next();

    });

    /* Thread Hooks */
    // Hook functions in-between threads with beforeThread
    // See: https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#controllerstudiobeforethread
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    // Before the default thread starts, run this:
    controller.studio.beforeThread('story_point','default', function(convo, next) {

        /// do something fun and useful
        // convo.setVar('name','value');


        logger.info('In the script *story_point*, about to start the thread *default*');

        // always call next!
        next();
    });

    // Before the on_timeout thread starts, run this:
    controller.studio.beforeThread('story_point','on_timeout', function(convo, next) {

        /// do something fun and useful
        // convo.setVar('name','value');

        logger.info('In the script *story_point*, about to start the thread *on_timeout*');

        // always call next!
        next();
    });


    // define an after hook
    // you may define multiple after hooks. they will run in the order they are defined.
    // See: https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#controllerstudioafter
    controller.studio.after('story_point', function(convo, next) {

        logger.info('AFTER: story_point');

        // handle the outcome of the convo
        if (convo.successful()) {

            var responses = convo.extractResponses();
            // do something with the responses

        }

        // don't forget to call next, or your conversation will never properly complete.
        next();
    });
}
