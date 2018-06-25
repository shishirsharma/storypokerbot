var request = require('request');
var md5 = require('md5');
var botkit_mixpanel_metrics = function(controller, options) {

  if (!options) {
    options = {
      debug: false,
      always_update: false,
    }
  }

  // Setup mixpanel
  // grab the Mixpanel factory
  var Mixpanel = require('mixpanel');

  // create an instance of the mixpanel client
  // initialize mixpanel client configured to communicate over https
  var mixpanel = Mixpanel.init(options.mixpanel_api_key, {
    protocol: 'https'
  });


  var bot_metrics_url_base = controller.config.studio_command_uri || 'https://api.botkit.ai';

  var debug = options.debug;

  var BotMetrics = {

    callAPI: function(url, payload, cb) {

      var options = {
        rejectUnauthorized: false,
        url: bot_metrics_url_base + url + '?access_token=' + controller.config.studio_token,
        method: 'POST',
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      };

      if (controller.config.studio_token) {


        request(options, function(err, res, body) {

          if (err) {
            return cb(err);
          }

          if (res.statusCode === 202) {
            return cb(null, {});
          }



          try {
            json = JSON.parse(body);
          } catch (e) {
            return cb(e);
          }
          if (json.error) {
            if (res.statusCode === 401) {
              console.error(json.error);
            }
            return cb(json.error);
          } else if (json.errors) {
            if (res.statusCode === 401) {
              console.error(json.errors[0]);
            }
            return cb(json.errors[0]);
          } else {
            return cb(null, json.data);
          }

        });
      }
    },
    receiveEvent: function(bot, message) {

      var that = this;

      // {
      //   distinct_id: 'some unique client id',
      //   as: 'many',
      //   properties: 'as',
      //   you: 'want'
      // }
      var payload = {
        distinct_id: message.user,
        instance_uid: bot.identity.id,
        provider: 'generic',
        event_text: message.text,
        event_type: message.type,
        is_for_bot: true,
        is_from_bot: false,
        is_im: false,
        timestamp: new Date(),
        user_id: message.user,
        bot_id: bot.identity.id,
        bot_name: bot.identity.name,
      }

      if (bot.getInstanceInfo) {
        bot.getInstanceInfo().then(function(instance) {
          payload.team_name = instance.team.name;
          payload.team_url = instance.team.url;
          payload.team_id = instance.team.id;

          if (debug) {
            console.log('Send instance', payload);
          }

          // track an event with optional properties
          mixpanel.track(message.type, payload);

        }).catch(function(err) {
          if (err) {
            if (debug) console.error('Error in bot instance metrics API: ', err);
          }
        });
      } else {

        if (debug) {
          console.log('Send event', payload);
        }

        // track an event with optional properties
        mixpanel.track(message.type, payload);

        // that.callAPI('/api/v2/stats/events', payload, function(err, res) {
        //   if (err) {
        //     if (debug) console.error('METRICS ERROR', err);
        //   } else {
        //     if (res.messages) {
        //       for (var m = 0; m < res.messages.length; m++) {
        //         if (res.messages[m].code == 'bot_user_not_found') {
        //           that.user(bot, message);
        //         }

        //         if (res.messages[m].code == 'bot_instance_not_found') {
        //           that.instance(bot, message);
        //         }
        //       }
        //     }
        //   }
        // });
      }
    },
    sendEvent: function(bot, message) {

      var that = this;

      var payload = {
        instance_uid: bot.identity.id, // slack team id
        provider: 'generic',
        event: {
          text: message.text,
          event_type: 'message',
          is_for_bot: false,
          is_from_bot: true,
          is_im: false,
          timestamp: new Date(),
          user_id: message.to,
        }
      }

      if (debug) {
        console.log('Send event', payload);
      }

      that.callAPI('/api/v2/stats/events', payload, function(err, res) {
        if (err) {
          if (debug) console.error('METRICS ERROR', err);
        } else {
          if (res.messages) {
            for (var m = 0; m < res.messages.length; m++) {
              if (res.messages[m].code == 'bot_user_not_found') {
                that.user(bot, {
                  user: message.to,
                  channel: message.channel
                });
              }

              if (res.messages[m].code == 'bot_instance_not_found') {
                that.instance(bot, message);
              }
            }
          }
        }
      });
    },
    user: function(bot, message) {

      var that = this;
      if (bot.getMessageUser) {
        bot.getMessageUser(message).then(function(profile) {
          var payload = {
            $first_name: profile.first_name || 'unknown',
            $last_name: profile.last_name || 'unknown',
            $email: profile.email || 'unknown',
            $phone: profile.phone || 'unknown',
            title: profile.title || 'unknown',
            // $created: (new Date()).toISOString(),
            instance_uid: bot.identity.id,
            user_id: profile.id,
            profile_pic_url: null,
            nickname: profile.username || 'unknown',
            full_name: profile.full_name || 'unknown',
            gender: profile.gender || 'unknown',
            timezone: profile.timezone || "America/Los_Angeles",
            timezone_offset: profile.timezone_offset || null,
          }

          if (debug) {
            console.log('Send user', payload);
          }

          // create or update a user in Mixpanel Engage without altering $last_seen
          // - pass option $ignore_time: true to prevent the $last_seen property from being updated
          mixpanel.people.set(message.user, payload, {
            $ignore_time: true
          });

          // that.callAPI('/api/v2/stats/bot_users', payload, function(err, res) {
          //   if (err) {
          //     if (debug) console.error('Error in bot user metrics API: ', err);
          //   }
          // });
        }).catch(function(err) {
          if (err) {
            if (debug) console.error('Error in bot user metrics API: ', err);
          }
        });
      }
    },
    instance: function(bot, message) {
      var that = this;
      var payload = {
        uid: bot.identity.id,
        attributes: {
          name: bot.identity.name,
          id: bot.identity.id,
        }
      }

      if (bot.getInstanceInfo) {
        bot.getInstanceInfo().then(function(instance) {

          payload.attributes.name = instance.identity.name;
          payload.attributes.id = instance.identity.id;
          payload.attributes.team_name = instance.team.name;
          payload.attributes.team_url = instance.team.url;
          payload.attributes.team_id = instance.team.id;

          if (debug) {
            console.log('Send instance', payload);
          }

          that.callAPI('/api/v2/stats/instances', payload, function(err, res) {
            if (err) {
              if (debug) console.error('Error in bot instance metrics API: ', err);
            }
          });
        }).catch(function(err) {
          if (err) {
            if (debug) console.error('Error in bot instance metrics API: ', err);
          }
        });
      } else {
        if (debug) {
          console.log('Send instance', payload);
        }

        that.callAPI('/api/v2/stats/instances', payload, function(err, res) {
          if (err) {
            if (debug) console.error('Error in bot instance metrics API: ', err);
          }
        });
      }
    }

  }

  controller.middleware.heard.use(function(bot, message, next) {
    // BotMetrics.receiveEvent(bot, message);
    // if (options.always_update) {
    //   BotMetrics.user(bot, message);
    //   BotMetrics.instance(bot, message);
    // }
    next();
  });

  controller.middleware.triggered.use(function(bot, message, next) {
    var relevant_events = ['message_received', 'direct_message', 'direct_mention', 'mention', 'ambient', 'facebook_postback', 'interactive_message_callback', 'slash_command', 'invoke'];
    if (message && message.type && relevant_events.indexOf(message.type) != -1) {
      BotMetrics.receiveEvent(bot, message);
      if (options.always_update) {
        BotMetrics.user(bot, message);
        // BotMetrics.instance(bot, message);
      }
    }
    next();
  });

  controller.middleware.send.use(function(bot, message, next) {
    // BotMetrics.sendEvent(bot, message);
    // if (options.always_update) {
    //   BotMetrics.instance(bot, message);
    // }
    next();
  });

  return BotMetrics;

}

module.exports = function(controller) {


  // Dashbot is a turnkey analytics platform for bots.
  // Sign up for a free key here: https://www.dashbot.io/ to see your bot analytics in real time.
  if (process.env.MIXPANEL_API_KEY) {
    // Setup mixpanel
    botkit_mixpanel_metrics(controller, {mixpanel_api_key: process.env.MIXPANEL_API_KEY, debug: false, always_update: true});
    // // grab the Mixpanel factory
    // var Mixpanel = require('mixpanel');

    // // create an instance of the mixpanel client
    // // initialize mixpanel client configured to communicate over https
    // var mixpanel = Mixpanel.init(process.env.MIXPANEL_API_KEY, {
    //     protocol: 'https'
    // });

    // // var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;
    // // controller.middleware.receive.use(dashbot.receive);
    // // controller.middleware.send.use(dashbot.send);
    // // controller.log.info('Thanks for using Dashbot. Visit https://www.dashbot.io/ to see your bot analytics in real time.');
  } else {
    controller.log.info('No MIXPANEL_API_KEY specified.');
  }

}
