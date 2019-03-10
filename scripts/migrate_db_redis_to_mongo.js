var env = require('node-env-file');
try {
  env(__dirname + '/../.env.production');
  // console.log(JSON.stringify(process.env));
} catch (err) {
  console.log('Warning: .env file not found hope environment is set some other way');
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
      console.log("Saved team :"+l+":"+JSON.stringify(list[l]));
      toStorage.teams.save(list[l], (err, value) => {
        console.log("Saved team :"+l+":"+JSON.stringify(list[l]));
      });
    }
  }
});

fromStorage.users.all(function(err, list) {
  if (err) {
    throw new Error('Error: Could not load existing bots:', err);
  } else {
    for (let l = 0; l < list.length; l++) {
      console.log("Saved user :"+l+": "+JSON.stringify(list[l]));
      toStorage.users.save(list[l], (err, value) => {
        console.log("Saved user :"+l+": "+JSON.stringify(list[l]));
      });
    }
  }
});
