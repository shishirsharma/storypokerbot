let request = require('request');
let md5 = require('md5');
let botkit_mixpanel_metrics = function(controller, options) {

  if (!options) {
    options = {
      debug: false,
      always_update: false,
    }
  }

  // Setup mixpanel
  // grab the Mixpanel factory
  let Mixpanel = require('mixpanel');

  // create an instance of the mixpanel client
  // initialize mixpanel client configured to communicate over https
  let mixpanel = Mixpanel.init(options.mixpanel_api_key, {
    protocol: 'https'
  });


  let bot_metrics_url_base = controller.config.studio_command_uri || 'https://api.botkit.ai';

  let debug = options.debug;

  let BotMetrics = {

    // callAPI: function(url, payload, cb) {

    //   let options = {
    //     rejectUnauthorized: false,
    //     url: bot_metrics_url_base + url + '?access_token=' + controller.config.studio_token,
    //     method: 'POST',
    //     headers: {
    //       "content-type": "application/json",
    //     },
    //     body: JSON.stringify(payload),
    //   };

    //   if (controller.config.studio_token) {


    //     request(options, function(err, res, body) {

    //       if (err) {
    //         return cb(err);
    //       }

    //       if (res.statusCode === 202) {
    //         return cb(null, {});
    //       }



    //       try {
    //         json = JSON.parse(body);
    //       } catch (e) {
    //         return cb(e);
    //       }
    //       if (json.error) {
    //         if (res.statusCode === 401) {
    //           console.error(json.error);
    //         }
    //         return cb(json.error);
    //       } else if (json.errors) {
    //         if (res.statusCode === 401) {
    //           console.error(json.errors[0]);
    //         }
    //         return cb(json.errors[0]);
    //       } else {
    //         return cb(null, json.data);
    //       }

    //     });
    //   }
    // }
    // ,
    receiveEvent: function(bot, message) {

      let that = this;

      // {
      //   distinct_id: 'some unique client id',
      //   as: 'many',
      //   properties: 'as',
      //   you: 'want'
      // }
      let payload = {
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
        //       for (let m = 0; m < res.messages.length; m++) {
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
    // sendEvent: function(bot, message) {

    //   let that = this;

    //   let payload = {
    //     instance_uid: bot.identity.id, // slack team id
    //     provider: 'generic',
    //     event: {
    //       text: message.text,
    //       event_type: 'message',
    //       is_for_bot: false,
    //       is_from_bot: true,
    //       is_im: false,
    //       timestamp: new Date(),
    //       user_id: message.to,
    //     }
    //   }

    //   if (debug) {
    //     console.log('Send event', payload);
    //   }

    //   that.callAPI('/api/v2/stats/events', payload, function(err, res) {
    //     if (err) {
    //       if (debug) console.error('METRICS ERROR', err);
    //     } else {
    //       if (res.messages) {
    //         for (let m = 0; m < res.messages.length; m++) {
    //           if (res.messages[m].code == 'bot_user_not_found') {
    //             that.user(bot, {
    //               user: message.to,
    //               channel: message.channel
    //             });
    //           }

    //           if (res.messages[m].code == 'bot_instance_not_found') {
    //             that.instance(bot, message);
    //           }
    //         }
    //       }
    //     }
    //   });
    // },
    user: function(bot, message) {

      let that = this;


      if (!bot.getMessageUserMixpanel) {
        if (debug) {
          console.log('Setting bot.getMessageUserMixpanel');
        }

        bot.getMessageUserMixpanel = function(message, cb) {
          return new Promise(function(resolve, reject) {
            bot.api.users.info({user: message.user}, function(err, identity) {
              if (err) {
                if (cb) {
                  cb(err);
                }
                return reject(err);
              }
              // normalize this into what botkit wants to see
              let profile = {
                id: message.user,
                username: identity.user.profile.display_name,
                first_name: identity.user.profile.first_name,
                last_name: identity.user.profile.last_name,
                full_name: identity.user.profile.real_name,
                email: identity.user.profile.email, // may be blank
                gender: null, // no source for this info
                timezone_offset: (identity.user.tz_offset / (60 * 60)), // convert from seconds to hours
                timezone: identity.user.tz
              };
              if (cb) {
                cb(null, profile, identity);
              }
              resolve({profile, identity});
            });
          });

        };
      }

      bot.getMessageUserMixpanel(message).then(function(options) {
        let profile = options.profile;
        let identity = options.identity;
        let payload = {
          $first_name: profile.first_name || 'unknown',
          $last_name: profile.last_name || 'unknown',
          $email: profile.email || 'unknown',
          $phone: profile.phone || 'unknown',
          title: profile.title || 'unknown',
          // $created: (new Date()).toISOString(),
          instance_uid: bot.identity.id,
          user_id: profile.id,
          team_id: identity.user.team_id,
          is_admin: identity.user.is_admin,
          is_owner: identity.user.is_owner,
          is_primary_owner: identity.user.is_primary_owner,
          is_restricted: identity.user.is_restricted,
          is_ultra_restricted: identity.user.is_ultra_restricted,
          is_bot: identity.user.is_bot,
          profile_pic_url: identity.user.profile.image_512,
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
    // instance: function(bot, message) {
    //   let that = this;
    //   let payload = {
    //     uid: bot.identity.id,
    //     attributes: {
    //       name: bot.identity.name,
    //       id: bot.identity.id,
    //     }
    //   }

    //   if (bot.getInstanceInfo) {
    //     bot.getInstanceInfo().then(function(instance) {

    //       payload.attributes.name = instance.identity.name;
    //       payload.attributes.id = instance.identity.id;
    //       payload.attributes.team_name = instance.team.name;
    //       payload.attributes.team_url = instance.team.url;
    //       payload.attributes.team_id = instance.team.id;

    //       if (debug) {
    //         console.log('Send instance', payload);
    //       }

    //       that.callAPI('/api/v2/stats/instances', payload, function(err, res) {
    //         if (err) {
    //           if (debug) console.error('Error in bot instance metrics API: ', err);
    //         }
    //       });
    //     }).catch(function(err) {
    //       if (err) {
    //         if (debug) console.error('Error in bot instance metrics API: ', err);
    //       }
    //     });
    //   } else {
    //     if (debug) {
    //       console.log('Send instance', payload);
    //     }

    //     that.callAPI('/api/v2/stats/instances', payload, function(err, res) {
    //       if (err) {
    //         if (debug) console.error('Error in bot instance metrics API: ', err);
    //       }
    //     });
    //   }
    // }

  }

  // controller.middleware.heard.use(function(bot, message, next) {
  //   BotMetrics.receiveEvent(bot, message);
  //   if (options.always_update) {
  //     BotMetrics.user(bot, message);
  //     BotMetrics.instance(bot, message);
  //   }
  //   next();
  // });

  controller.middleware.triggered.use(function(bot, message, next) {
    let relevant_events = ['message_received', 'direct_message', 'direct_mention', 'mention', 'ambient', 'facebook_postback', 'interactive_message_callback', 'slash_command', 'invoke'];
    if (message && message.type && relevant_events.indexOf(message.type) != -1) {
      BotMetrics.receiveEvent(bot, message);
      if (options.always_update) {
        BotMetrics.user(bot, message);
        // BotMetrics.instance(bot, message);
      }
    }
    next();
  });

  // controller.middleware.send.use(function(bot, message, next) {
  //   BotMetrics.sendEvent(bot, message);
  //   if (options.always_update) {
  //     BotMetrics.instance(bot, message);
  //   }
  //   next();
  // });

  return BotMetrics;

}

module.exports = function(controller) {


  // Dashbot is a turnkey analytics platform for bots.
  // Sign up for a free key here: https://www.dashbot.io/ to see your bot analytics in real time.
  if (process.env.MIXPANEL_API_KEY) {
    // Setup mixpanel
    botkit_mixpanel_metrics(controller, {mixpanel_api_key: process.env.MIXPANEL_API_KEY, debug: true, always_update: true});
    // // grab the Mixpanel factory
    // let Mixpanel = require('mixpanel');

    // // create an instance of the mixpanel client
    // // initialize mixpanel client configured to communicate over https
    // let mixpanel = Mixpanel.init(process.env.MIXPANEL_API_KEY, {
    //     protocol: 'https'
    // });

    // // let dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;
    // // controller.middleware.receive.use(dashbot.receive);
    // // controller.middleware.send.use(dashbot.send);
    // // controller.log.info('Thanks for using Dashbot. Visit https://www.dashbot.io/ to see your bot analytics in real time.');
  } else {
    controller.log.info('No MIXPANEL_API_KEY specified.');
  }

}
