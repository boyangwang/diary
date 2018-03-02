var plan = require('flightplan');

plan.target('staging', {
  host: 'playground.wangboyang.com',
  port: 22,
  username: 'root'
});

const projectsDir = '/var/www/';

plan.remote(['deploy'], (remote) => {
  // download and unzip
  remote.sudo(`cd ${projectsDir}`, { failsafe: true });
  remote.sudo(`mkdir diary_project`, { failsafe: true });
  remote.sudo(`cd diary_project`, { failsafe: true });
  remote.sudo(`wget https://github.com/boyangwang/diary/archive/master.zip`, { failsafe: true });
  remote.sudo(`7z x master.zip`, { failsafe: true });
  remote.sudo(`cd diary-master`, { failsafe: true });

  // install and build
  remote.sudo(`cd diary-back`, { failsafe: true });
  remote.sudo(`yarn install`, { failsafe: true });
  remote.sudo(`./node_modules/.bin/pm2 stop diary-back`,
    { failsafe: true });
  remote.sudo(`./node_modules/.bin/pm2 start ./src/server.js --name diary-back`,
    { failsafe: true });

  remote.sudo(`cd ../diary-front`, { failsafe: true });
  remote.sudo(`yarn install`, { failsafe: true });
  remote.sudo(`yarn run build`, { failsafe: true });

  remote.sudo(``, { failsafe: true });
});

plan.remote(['start'], (remote) => {
  remote.sudo(`which pm2`, { failsafe: true });
});
