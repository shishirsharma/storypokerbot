const env = require('node-env-file');
const logger = require('winston');

try {
  env(__dirname + '/../.env.production');
  // logger.info(JSON.stringify(process.env));
} catch (err) {
  logger.info('Warning: .env file not found hope environment is set some other way');
  process.exit();
}

let  mongoStorage, redisStorage;

if (process.env.MONGODB_URI) {
  mongoStorage = require('botkit-storage-mongo')({
    mongoUri: process.env.MONGODB_URI,
    tables: ['games']
  });
}

if (process.env.REDIS_URL) {
  var redis_config = {
    url: process.env.REDIS_URL,
    methods: ['games']
  };
  redisStorage = require('botkit-storage-redis')(redis_config);
}

let fromStorage = redisStorage ;
let toStorage = mongoStorage;

fromStorage.teams.all(function(err, list) {
  if (err) {
    throw new Error('Error: Could not load existing bots:', err);
  } else {
    for (let l = 0; l < list.length; l++) {
      logger.info("Saved team :"+l+":"+JSON.stringify(list[l]));
      toStorage.teams.save(list[l], (err, value) => {
        logger.info("Saved team :"+l+":"+JSON.stringify(list[l]));
      });
    }
  }
});

fromStorage.users.all(function(err, list) {
  if (err) {
    throw new Error('Error: Could not load existing bots:', err);
  } else {
    for (let l = 0; l < list.length; l++) {
      logger.info("Saved user :"+l+": "+JSON.stringify(list[l]));
      toStorage.users.save(list[l], (err, value) => {
        logger.info("Saved user :"+l+": "+JSON.stringify(list[l]));
      });
    }
  }
});
