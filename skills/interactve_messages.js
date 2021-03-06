const debug = require('debug')('botkit:slash_command');
const dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;
const logger = require('winston');
const uuidv4 = require('uuid/v4');

module.exports = function(controller) {

  // create special handlers for certain actions in buttons
  // if the button action is 'action', trigger an event
  // if the button action is 'say', act as if user said that thing
  controller.on('interactive_message_callback', function(bot, trigger) {
    logger.info(trigger);
    dashbot.logIncoming(bot.identity, bot.team_info, trigger);

    function showResult(bot, message, raw_reply, uuid, value, opts) {
      if(!opts) {
        opts = {type: 'reveal'};
      } else if( !opts.type ) {
        opts.type = 'reveal';
      }
      let reply = {
        blocks: raw_reply.attachments
      };
      // let reply = raw_reply;



      let graph = {
        '0': 0, '1': 0, '2': 0, '3': 0, '5': 0, '8': 0,
        '13': 0, '21': 0, '34': 0, '55': 0
      };
      let grouped_users = {};

      Object.keys(value).forEach(function(key, index) {
        graph[value[key]] += 1;
        if(!grouped_users[value[key]]) {
          grouped_users[value[key]] = [`<@${key}>`];
        } else {
          grouped_users[value[key]].push(`<@${key}>`);
        }
        //reply.attachments.push({
        //  text: `<@${key}> pointed: ${value[key]}`
        //});
      });

      let graph_string = ['Points ▼ │ Count ►','──┬───'];
      let graph_data = [];
      Object.keys(graph).forEach(function(point, index) {
        let count = graph[point];
        let count_str = count === 0 ? '' : count;
        graph_data.push(count);
        graph_string.push(point.padStart(2) + '│' + '█'.repeat(count) + ' ' + count_str);
      });
      graph_string.push('──┴───');

      // reply.attachments[0].pretext = `\`\`\`${graph_string.join('\n')}\`\`\``;
      // `http://chart.apis.google.com/chart?chs=480x256&cht=bvs&chtt=LivePreview&chd=s:CDDEFH,Wps679&chco=ff0000,0000ff&chdl=sales|visits&chxl=0:|jan|feb|mar|apr|may|jun|&chxt=x`
      // reply.attachments[0].image_url = `http://chart.apis.google.com/chart?` +
      //   `cht=bvs&` +
      //   `chs=160x160&` +
      //   `chd=s:AAAAAAAzA&` +
      //   `chdl=Points&` +
      //   `chco=5131C9&` +
      //   `chxt=x&` +
      //   `chxl=0:|1|2|3|5|8|13|21|34|55&` +
      //   `chxs=0,000000,8,-1&` +
      //   `chf=bg,s,FFFFFF|c,s,FFFFFF&` +
      //   `chbh=a&` +
      //   `chtt=Points%20Histogram&` +
      //   `chts=000000,12`;
      // http://chart.googleapis.com/chart?cht=bvg&chs=250x150&chd=s:Monkeys&chxt=x,y&chxs=0,ff0000,12,0,lt|1,0000ff,10,1,lt
      // https://chart.googleapis.com/chart?cht=bhg&chs=200x125&chd=s:el,or&chco=4d89f9,c6d9fd

      debug("graph_data.join(',')", graph_data.join(','));

      let image_url = `https://chart.googleapis.com/chart?cht=bvs&chs=480x270&chd=t:${graph_data.join(',')}&chdl=Points&chco=5131C9&chxt=x&chxl=0:|0|1|2|3|5|8|13|21|34|55&chxs=0,000000,14,-1&chf=bg,s,FFFFFF|c,s,FFFFFF&chbh=a&chtt=Points%20Histogram&chts=000000,12&chds=a&chm=N,000000,0,-1,11&bla.png`;
      //reply.attachments[0].image_url = "https://secure.gravatar.com/avatar/cc40079a1972ee5ed84472d3383cb354.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2F00b63%2Fimg%2Favatars%2Fava_0005-512.png";

      // reply.attachments[0].image_url = image_url;
      //reply.attachments[0].pretext = ``;


      reply.blocks = [
        {
		      "type": "section",
		      "text": {
			      "type": "mrkdwn",
			      "text": raw_reply.text
		      }
	      },
        {
		      "type": "image",
		      "title": {
			      "type": "plain_text",
			      "text": "Points vs People",
			      "emoji": true
		      },
		      "image_url": image_url,
		      "alt_text": "Points vs People"
	      },
      ];
      debug("Value for next action is ", JSON.stringify(value));
      if(opts.type !== 'done') {

        reply.attachments = [
          {
            "fallback": "Pre-filled because you have actions in your attachment.",
            "color": "#bdc3c7",
            "mrkdwn_in": [
              "text",
              "pretext",
              "fields"
            ],
            "callback_id": `select_poker_action:${uuid}`,
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
                "name": "Done",
                "text": "Done",
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
        ];

      }

      Object.keys(grouped_users).forEach(function(key, index) {
        debug('print', grouped_users[key], key);
        reply.blocks.push(
          {
		        "type": "section",
		        "text": {
			        "type": "mrkdwn",
			        "text": `${grouped_users[key].join(', ')} pointed: ${key}`,
		        }
	        }
        );
      });

      logger.info("reply.attachments", reply.attachments);

      // logger.info(reply);
      reply.channel = message.channel;
      // dashbot.logOutgoing(bot.identity, bot.team_info, reply);
      bot.replyInteractive(trigger, reply);

    }

    function showGame(bot, message, raw_reply, uuid, value, opts) {
      if(!opts) {
        opts = {type: 'reveal'};
      } else if( !opts.type ) {
        opts.type = 'reveal';
      }

      let reply = {
        text: raw_reply.text,
        attachments: raw_reply.attachments
      };

      reply.attachments =  [
        {
          "fallback": "Pre-filled because you have actions in your attachment.",
          "color": "#bdc3c7",
          "mrkdwn_in": [
            "text",
            "pretext",
            "fields"
          ],
          "callback_id": `select_point_action:${uuid}`,
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
          "callback_id": `select_point_action:${uuid}`,
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
          "callback_id": `select_poker_action:${uuid}`,
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

      // logger.info(reply);
      reply.channel = message.channel;
      // dashbot.logOutgoing(bot.identity, bot.team_info, reply);
      bot.replyInteractive(trigger, reply);

    }


    // if (trigger.actions[0].name.match(/^action$/)) {
    //     controller.trigger(trigger.actions[0].value, [bot, trigger]);
    //     return false; // do not bubble event
    // }
    // if (trigger.actions[0].name.match(/^say$/)) {

    //     let message = {
    //         user: trigger.user,
    //         channel: trigger.channel,
    //         text: '<@' + bot.identity.id + '> ' + trigger.actions[0].value,
    //         type: 'message',
    //     };

    //     let reply = trigger.original_message;

    //     for (let a = 0; a < reply.attachments.length; a++) {
    //         reply.attachments[a].actions = null;
    //     }

    //     let person = '<@' + trigger.user.id + '>';
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
    if (trigger.callback_id.match(/^select_poker_action/)) {

      let message = {
        user: trigger.user,
        channel: trigger.channel,
        text: '<@' + bot.identity.id + '> ' + trigger.actions[0].value,
        type: 'message',
      };

      let uuid = trigger.callback_id.split(':')[1];

      if(!uuid) {
        uuid = uuidv4();
      }

      let reply = trigger.original_message;
      // delete reply.type;
      // delete reply.subtype;
      // delete reply.ts;

      let value = {};


      if (trigger.actions[0].name.match(/^Reveal$/)) {
        try {
          value = JSON.parse(reply.attachments[2].actions[0].value);
          logger.info('Value error reply.attachments[2].actions:', value);
        } catch(error) {
          logger.info('Value error reply.attachments[2].actions:', reply);
          value = {};
        }

        debug("asdfasdfasdf");
        showResult(bot, message, reply, uuid, value);

        // //let value = JSON.parse(reply.attachments[2].actions[0].value);
        // controller.storage.games.get(uuid, (err, data) => {
        //   if(data) {
        //     value = data.value;
        //   }

        //   showResult(bot, message, reply, uuid, value);

        // });
      } else if(trigger.actions[0].name.match(/^Done$/)) {

        try {
          value = JSON.parse(reply.attachments[0].actions[1].value);
          logger.info('Value error reply.attachments[2].actions:', value);
        } catch(error) {
          logger.info('Value error reply.attachments[2].actions:', reply);
          value = {};
        }


        //let value = JSON.parse(trigger.actions[0].value);

        showResult(bot, message, reply, uuid, value, {type: 'done'});

      } else if(trigger.actions[0].name.match(/^Repoint$/)) {
        let person = '<@' + trigger.user + '>';
        let value = {};
        // This is considered a new game.
        uuid = uuidv4();

        showGame(bot, message, reply, uuid, value);

      } else if(trigger.actions[0].name.match(/^Dismiss$/)){
        let person = '<@' + trigger.user + '>';
        reply.attachments = [];
        reply.attachments.push({
          "text": `${person} has dismissed`
        });

        // logger.info(reply);
        reply.channel = message.channel;
        // dashbot.logOutgoing(bot.identity, bot.team_info, reply);
        bot.replyInteractive(trigger, reply);
      }

      //logger.info(JSON.stringify(reply));
      return false; // do not bubble event
    } else if (trigger.callback_id.match(/^select_point_action/)) {
      let message = {
        user: trigger.user,
        channel: trigger.channel,
        text: '<@' + bot.identity.id + '> ' + trigger.actions[0].value,
        type: 'message',
      };
      let uuid = trigger.callback_id.split(':')[1];
      if(!uuid) {
        uuid = uuidv4();
      }

      let reply = trigger.original_message;

      let person = '<@' + trigger.user + '>';
      if (message.channel[0] == 'D') {
        person = 'You';
      }
      let action_payload;
      if (trigger.actions[0].type === 'select') {
        logger.info('action_payload select');
        action_payload = trigger.actions[0].selected_options[0].value;
        logger.info('action_payload');
        logger.info(trigger.actions[0].selected_options[0]);
      } else {
        logger.info('action_payload button');
        action_payload = trigger.actions[0].value;
        logger.info('action_payload');
        logger.info(trigger.actions[0]);
      }

      let value = {};

      // try {
      //   //value = JSON.parse(reply.attachments[2].actions[0].value);
      //   logger.info('Value from persistence', value);

      // } catch(error) {
      //   logger.info('Value error reply.attachments[2].actions:', reply.attachments[2].actions);
      // }

      controller.storage.games.get(uuid, (err, data) => {
        if(!data) {
          value = JSON.parse(reply.attachments[2].actions[0].value);
        } else {
          value = data.value;
        }

        logger.info('action_payload');
        logger.info(action_payload);

        value[trigger.user] = action_payload;
        let games = controller.db.get('games');
        games.update({
          id: uuid
        },{
          $set: {
            id: uuid,
            [`value.${trigger.user}`]: action_payload,
            lastModified: new Date()
          }
        }, {
          upsert: true,
          returnNewDocument: true
        }, (err, data) => {
          logger.info('finally saved ' + err + " # " + JSON.stringify(data));
        });

        logger.info('Updated value');
        logger.info(JSON.stringify(value));


        reply.attachments[2].actions[0].value = `${JSON.stringify(value)}`;
        let user_count = Object.keys(value).length;
        reply.attachments[0].pretext = `Total Pointed: \`${user_count}\``;
        reply.attachments[3] = {
          "text": `${Object.keys(value).map(u => '<@' + u + '>').join(', ')} has pointed`
        };

        //logger.info(JSON.stringify(reply));

        // logger.info(reply);
        reply.channel = message.channel;
        // dashbot.logOutgoing(bot.identity, bot.team_info, reply);
        bot.replyInteractive(trigger, reply);

      });
      return false; // do not bubble event
    }

  });


};
