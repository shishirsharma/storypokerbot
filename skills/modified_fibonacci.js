const uuidv4 = require('uuid/v4');

var debug = require('debug')('botkit:slash_command');
var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;

module.exports = function(controller) {

    controller.on('slash_command', function(bot, message) {
        dashbot.logIncoming(bot.identity, bot.team_info, message);

        if (message.channel_name == 'directmessage') {
            bot.replyPrivate(message, "Uh oh! That didn't work. Try that command in a channel.");
            return;
        }

        var slash_commands = {
            '/standup': function() {
                bot.replyPublic(message, "Ok, I am starting a stand up <!here> in the channel.");
            },
            '/modfibpoints': function() {
                console.log('starting story pointing with modified Fibonacci sequence');
                // console.log(message);
                let value = {};
                let replyMessage = {
                    "text": `@${message.user_name} wants you to point a story using a modified Fibonacci sequence '${message.text}'`,
                    "attachments": [
                        {
                            "fallback": "Pre-filled because you have actions in your attachment.",
                            "color": "#bdc3c7",
                            "mrkdwn_in": [
                                "text",
                                "pretext",
                                "fields"
                            ],
                            "callback_id": "select_point_action_modfib",
                            "attachment_type": "default",
                            "actions": [
                                {
                                    "name": "0",
                                    "text": "0",
                                    "type": "button",
                                    "style": "default",
                                    "value": "0"
                                },
                                {
                                    "name": "1",
                                    "text": "1",
                                    "type": "button",
                                    "style": "default",
                                    "value": "1"
                                },
                                {
                                    "name": "2",
                                    "text": "2",
                                    "type": "button",
                                    "style": "default",
                                    "value": "2"
                                },
                                {
                                    "name": "3",
                                    "text": "3",
                                    "type": "button",
                                    "style": "default",
                                    "value": "3"
                                },
                                {
                                    "name": "5",
                                    "text": "5",
                                    "type": "button",
                                    "style": "default",
                                    "value": "5"
                                },
                                {
                                    "name": "8",
                                    "text": "8",
                                    "type": "button",
                                    "style": "default",
                                    "value": "8"
                                },
                                {
                                    "name": "13",
                                    "text": "13",
                                    "type": "button",
                                    "style": "default",
                                    "value": "13"
                                },
                                {
                                    "name": "20",
                                    "text": "20",
                                    "type": "button",
                                    "style": "default",
                                    "value": "20"
                                },
                                {
                                    "name": "40",
                                    "text": "40",
                                    "type": "button",
                                    "style": "default",
                                    "value": "40"
                                },
                                {
                                    "name": "100",
                                    "text": "100",
                                    "type": "button",
                                    "style": "default",
                                    "value": "100"
                                },
                                {
                                    "name": "SuggestBreak",
                                    "text": "Break Pls",
                                    "type": "button",
                                    "style": "default",
                                    "value": "Break Pls"
                                }
                            ]
                        },
                        {
                            "fallback": "Pre-filled because you have actions in your attachment.",
                            "color": "#bdc3c7",
                            "mrkdwn_in": [
                                "text",
                                "pretext",
                                "fields"
                            ],
                            "callback_id": "select_point_action_modfib",
                            "attachment_type": "default",
                            "actions": [
                                {
                                    "name": "Select point",
                                    "text": "Select point",
                                    "type": "select",
                                    "value": "Select point",
                                    "data_source": "static",
                                    "options": [
                                        {
                                            "text": "0",
                                            "value": "0"
                                        },
                                        {
                                            "text": "1",
                                            "value": "1"
                                        },
                                        {
                                            "text": "2",
                                            "value": "2"
                                        },
                                        {
                                            "text": "3",
                                            "value": "3"
                                        },
                                        {
                                            "text": "5",
                                            "value": "5"
                                        },
                                        {
                                            "text": "8",
                                            "value": "8"
                                        },
                                        {
                                            "text": "13",
                                            "value": "13"
                                        },
                                        {
                                            "text": "20",
                                            "value": "20"
                                        },
                                        {
                                            "text": "40",
                                            "value": "40"
                                        },
                                        {
                                            "text": "100",
                                            "value": "100"
                                        },
                                        {
                                            "text": "Break Pls",
                                            "value": "Break Pls"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "fallback": "Pre-filled because you have actions in your attachment.",
                            "color": "#bdc3c7",
                            "mrkdwn_in": [
                                "text",
                                "pretext",
                                "fields"
                            ],
                            "callback_id": "select_poker_action_modfib",
                            "attachment_type": "default",
                            "actions": [
                                {
                                    "name": "Reveal",
                                    "text": "Reveal",
                                    "type": "button",
                                    "style": "default",
                                    "value": `${JSON.stringify(value)}`
                                },
                                {
                                    "name": "Repoint",
                                    "text": "Repoint",
                                    "type": "button",
                                    "style": "default",
                                    "value": `${JSON.stringify(value)}`
                                },
                                {
                                    "name": "Dismiss",
                                    "text": "Dismiss",
                                    "type": "button",
                                    "style": "default",
                                    "value": "Dismiss"
                                }
                            ]
                        }
                    ],
                    "response_type": "ephemeral",
                    "delete_original": true,
                    "replace_original": true
                };

                replyMessage.channel = message.channel;
                dashbot.logOutgoing(bot.identity, bot.team_info, replyMessage);
                bot.replyPublic(message, replyMessage);
            },
            'default': function(){}
        };
        (slash_commands[message.command.split('_')[0]]|| slash_commands['default'])();

    });

}
