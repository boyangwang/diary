var plan = require('flightplan');

if (!process.env.FLIGHTPLAN_KEY_PATH) {
  console.error('You must specify envvar FLIGHTPLAN_KEY_PATH by export FLIGHTPLAN_KEY_PATH=XXX');
}

plan.target('staging', {
  host: 'playground.wangboyang.com',
  port: 22,
  username: 'root',
  privateKey: process.env.FLIGHTPLAN_KEY_PATH,
  agent: process.env.SSH_AUTH_SOCK
});

const projectsDir = '/var/www/diary_project';

plan.remote(['deploy'], (remote) => {
  // download and unzip
  remote.sudo(`mkdir ${projectsDir}`, { failsafe: true });
  remote.sudo(`cd ${projectsDir} &&
    wget https://github.com/boyangwang/diary/archive/master.zip -O master.zip &&
    7z x master.zip -y`);

  // install and build
  remote.sudo(`ls -a -l ${projectsDir}/diary-master/`);
  remote.sudo(`cd ${projectsDir}/diary-master/diary-back &&
    yarn install && ./node_modules/.bin/pm2 stop diary-back
    ./node_modules/.bin/pm2 start ./src/server.js --name diary-back`);

  remote.sudo(`cd ${projectsDir}/diary-master/diary-front &&
    yarn install && yarn run build`);
  remote.sudo(`cd ${projectsDir}/diary-master/diary-front &&
    ls -a -l`);
});

plan.remote(['start'], (remote) => {
});

plan.remote(['stop'], (remote) => {
});