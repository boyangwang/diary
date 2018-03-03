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
    rm -rf ./diary-master/ && 7z x master.zip -y`);
  // install and build
  // back
  remote.sudo(`cd ${projectsDir}/diary-master/diary-back &&
    yarn install --ignore-engines && ./node_modules/.bin/pm2 stop diary-back
    ./node_modules/.bin/pm2 start ./src/server.js --name diary-back`);
  // front
  remote.sudo(`cd ${projectsDir}/diary-master/diary-front &&
    yarn install --ignore-engines && yarn run build`);
  remote.sudo(`cd ${projectsDir}/diary-master/diary-front &&
    ln -sf ${projectsDir}/diary-master/diary-front/config/diary.conf /etc/nginx/sites-enabled/`);
  remote.sudo(`cd ${projectsDir} && chmod -R +X .`);
  remote.sudo(`cd ${projectsDir}/diary-master/diary-front &&
    chmod -R 755 ./build`);
  remote.sudo(`nginx -s reload`);
});

plan.remote(['start'], (remote) => {
});

plan.remote(['stop'], (remote) => {
});