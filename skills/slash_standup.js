const uuidv4 = require('uuid/v4');

var debug = require('debug')('botkit:slash_command');


module.exports = function(controller) {

    controller.on('slash_command', function(bot, message) {

        if (message.channel_name == 'directmessage') {
            bot.replyPrivate(message, "Uh oh! That didn't work. Try that command in a channel.");
            return;
        }

        var slash_commands = {
            '/standup': function() {
                bot.replyPublic(message, "Ok, I am staring a stand up <!here> in the channel.");
            },
            '/pointstory': function() {
                console.log('playing pointing poker');
                // console.log(message);
                let value = {};
                bot.replyPublic(message, {
                    "text": `@${message.user_name} wants you to point story '${message.text}'`,
                    "attachments": [
                        {
                            "fallback": "Pre-filled because you have actions in your attachment.",
                            "color": "#bdc3c7",
                            "mrkdwn_in": [
                                "text",
                                "pretext",
                                "fields"
                            ],
                            "callback_id": "select_point_action",
                            "attachment_type": "default",
                            "actions": [
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
                            "callback_id": "select_point_action",
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
                                            "text": "21",
                                            "value": "21"
                                        },
                                        {
                                            "text": "34",
                                            "value": "34"
                                        },
                                        {
                                            "text": "55",
                                            "value": "55"
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
                            "callback_id": "select_poker_action",
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
                });
            },
            'default': function(){}
        };
        (slash_commands[message.command.split('_')[0]]|| slash_commands['default'])();

    });

}
