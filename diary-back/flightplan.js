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
  remote.exec(`mkdir ${projectsDir}`, { failsafe: true });
  remote.with(`cd ${projectsDir}`, () => {
    remote.exec(`wget https://github.com/boyangwang/diary/archive/master.zip -O master.zip`);
    remote.exec(`rm -rf ./diary-master/ && 7z x master.zip -y`);
    remote.exec(`chmod -R +X .`);
  });
  // install and build
  // back
  // run mongod if not running
  remote.exec(`nohup mongod --bind_ip 127.0.0.1 --dbpath ${projectsDir}/diary-master/diary-back/mongo/data &`, { failsafe: true });
  remote.with(`cd ${projectsDir}/diary-master/diary-back`, () => {
    remote.exec(`yarn install --ignore-engines`);
    remote.exec(`./node_modules/.bin/pm2 stop diary-back`, { failsafe: true });
    remote.exec(`./node_modules/.bin/pm2 start ./src/server.js --name diary-back --interpreter=$(which node)`);
  })
  // front
  remote.with(`cd ${projectsDir}/diary-master/diary-front`, () => {
    remote.exec(`yarn install --ignore-engines`);
    remote.exec(`yarn run build`);
    remote.exec(`ln -sf ${projectsDir}/diary-master/diary-front/config/diary.conf /etc/nginx/sites-enabled/`);
    remote.exec(`chmod -R 755 ./build`);
    remote.exec(`nginx -s reload`);
  });
});

plan.remote(['start'], (remote) => {
});

plan.remote(['stop'], (remote) => {
});