var debug = require('debug')('botkit:slash_command');
var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;

module.exports = function(controller) {

    // create special handlers for certain actions in buttons
    // if the button action is 'action', trigger an event
    // if the button action is 'say', act as if user said that thing
    controller.on('interactive_message_callback', function(bot, trigger) {
        console.log(trigger);
        dashbot.logIncoming(bot.identity, bot.team_info, trigger);

        // if (trigger.actions[0].name.match(/^action$/)) {
        //     controller.trigger(trigger.actions[0].value, [bot, trigger]);
        //     return false; // do not bubble event
        // }
        // if (trigger.actions[0].name.match(/^say$/)) {

        //     var message = {
        //         user: trigger.user,
        //         channel: trigger.channel,
        //         text: '<@' + bot.identity.id + '> ' + trigger.actions[0].value,
        //         type: 'message',
        //     };

        //     var reply = trigger.original_message;

        //     for (var a = 0; a < reply.attachments.length; a++) {
        //         reply.attachments[a].actions = null;
        //     }

        //     var person = '<@' + trigger.user.id + '>';
        //     if (message.channel[0] == 'D') {
        //         person = 'You';
        //     }

        //     reply.attachments.push({
        //         text: person + ' said, ' + trigger.actions[0].value,
        //     });

        //     reply.channel = message.channel;
        //     dashbot.logOutgoing(bot.identity, bot.team_info, reply);
        //     bot.replyInteractive(trigger, reply);

        //     controller.receiveMessage(bot, message);
        //     return false; // do not bubble event
        // }
        if (trigger.callback_id.match(/^select_poker_action$/)) {

            var message = {
                user: trigger.user,
                channel: trigger.channel,
                text: '<@' + bot.identity.id + '> ' + trigger.actions[0].value,
                type: 'message',
            };

            if (trigger.actions[0].name.match(/^Reveal$/)) {
                var reply = trigger.original_message;

                var value = JSON.parse(reply.attachments[2].actions[0].value);

                reply.attachments = [ {
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
                            "name": "Repoint",
                            "text": "Repoint",
                            "type": "button",
                            "style": "default",
                            "value": `${JSON.stringify({})}`
                        },
                        {
                            "name": "Dismiss",
                            "text": "Dismiss",
                            "type": "button",
                            "style": "default",
                            "value": "Dismiss"
                        }
                    ]
                }];

                Object.keys(value).forEach(function(key, index) {
                    reply.attachments.push({
                        "text": `<@${key}> pointed: ${value[key]}`
                    });
                });
                console.log(reply.attachments);
            } else if(trigger.actions[0].name.match(/^Repoint$/)){
                var person = '<@' + trigger.user + '>';
                var value = {};
                var reply =  trigger.original_message;
                reply.attachments =  [
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
                                            "text": "4",
                                            "value": "4"
                                        },
                                        {
                                            "text": "5",
                                            "value": "5"
                                        },
                                        {
                                            "text": "6",
                                            "value": "6"
                                        },
                                        {
                                            "text": "7",
                                            "value": "7"
                                        },
                                        {
                                            "text": "8",
                                            "value": "8"
                                        },
                                        {
                                            "text": "9",
                                            "value": "9"
                                        },
                                        {
                                            "text": "10",
                                            "value": "10"
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
                    ]


            }else if(trigger.actions[0].name.match(/^Dismiss$/)){
                var person = '<@' + trigger.user + '>';
                var reply = trigger.original_message;
                reply.attachments = [];
                reply.attachments.push({
                    "text": `${person} has dismissed`
                });
            }

            //console.log(JSON.stringify(reply));

            // console.log(reply);
            reply.channel = message.channel;
            dashbot.logOutgoing(bot.identity, bot.team_info, reply);
            bot.replyInteractive(trigger, reply);

            return false; // do not bubble event
        }
        if (trigger.callback_id.match(/^select_point_action$/)) {

            var message = {
                user: trigger.user,
                channel: trigger.channel,
                text: '<@' + bot.identity.id + '> ' + trigger.actions[0].value,
                type: 'message',
            };

            var reply = trigger.original_message;

            var person = '<@' + trigger.user + '>';
            if (message.channel[0] == 'D') {
                person = 'You';
            }
            var action_payload;
            if (trigger.actions[0].type === 'select') {
                console.log('action_payload select');
                action_payload = trigger.actions[0].selected_options[0].value;
                console.log('action_payload');
                console.log(trigger.actions[0].selected_options[0]);
            } else {
                console.log('action_payload button');
                action_payload = trigger.actions[0].value;
                console.log('action_payload');
                console.log(trigger.actions[0]);
            }

            var value = JSON.parse(reply.attachments[2].actions[0].value);

            console.log('action_payload');
            console.log(action_payload);
            value[trigger.user] = action_payload;
            console.log('Updated value');
            console.log(JSON.stringify(value));

            reply.attachments[2].actions[0].value = `${JSON.stringify(value)}`;

            reply.attachments.push({
                "text": `${person} has pointed`
            });
            //console.log(JSON.stringify(reply));

            // console.log(reply);
            reply.channel = message.channel;
            dashbot.logOutgoing(bot.identity, bot.team_info, reply);
            bot.replyInteractive(trigger, reply);

            return false; // do not bubble event
        }

    });


}
