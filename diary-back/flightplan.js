const path = require('path');
const plan = require('flightplan');

if (!process.env.FLIGHTPLAN_KEY_PATH) {
  console.error(
    'You must specify envvar FLIGHTPLAN_KEY_PATH by export FLIGHTPLAN_KEY_PATH=foobar'
  );
}

plan.target('staging', {
  host: 'playground.wangboyang.com',
  port: 22,
  username: 'root',
  privateKey: process.env.FLIGHTPLAN_KEY_PATH,
  agent: process.env.SSH_AUTH_SOCK,
});

plan.target('localhost');

const projectsDir = '/var/www/diary_project';

plan.remote(['stop-backend', 'deploy-all'], (remote) => {
  remote.with(`cd ${projectsDir}/diary-master/diary-back`, () => {
    remote.exec(`./node_modules/.bin/pm2 stop diary-back`, { failsafe: true });
  });
});

plan.remote(['clear-and-download', 'deploy-all'], (remote) => {
  // download and unzip
  remote.exec(`mkdir ${projectsDir}`, { failsafe: true });
  remote.with(`cd ${projectsDir}`, () => {
    remote.exec(
      `wget https://github.com/boyangwang/diary/archive/master.zip -O master.zip`
    );
    remote.exec(`rm -rf ./diary-master && 7z x master.zip -y`);
    remote.exec(`chmod -R +X .`);
  });
});

plan.remote(['run-mongod', 'deploy-all'], (remote) => {
  // run mongod if not running
  remote.exec(`mkdir -p ${projectsDir}/diary-data/mongo/data`, {
    failsafe: true,
  });
  remote.exec(
    `nohup mongod --bind_ip 127.0.0.1 --dbpath ${projectsDir}/diary-data/mongo/data &
  `,
    { failsafe: true }
  );
});

plan.remote(['backend', 'deploy-all'], (remote) => {
  // backend
  remote.with(`cd ${projectsDir}/diary-master/diary-back`, () => {
    remote.exec(`yarn install --ignore-engines`);
    remote.exec(`export NODE_ENV=production`, { failsafe: true });
    remote.exec(`./node_modules/.bin/pm2 stop diary-back`, { failsafe: true });
    remote.exec(
      `./node_modules/.bin/pm2 start ./src/server.js --name diary-back --interpreter=$(which node)`
    );
  });
});

plan.remote(['frontend', 'deploy-all'], (remote) => {
  // front
  remote.with(`cd ${projectsDir}/diary-master/diary-front`, () => {
    remote.exec(`yarn install --ignore-engines`);
    remote.exec(
      `ln -sf ${projectsDir}/diary-master/diary-front/config/diary.conf /etc/nginx/sites-enabled/`
    );
    remote.exec(`nginx -s reload`);
    remote.exec(`mkdir ./build`, { failsafe: true });
    remote.exec(`chmod -R 755 ./build`);
    remote.exec(`yarn run build`);
  });
});

plan.local(['link-nginx'], (local) => {
  const confAbsolutePath = path.resolve('../diary-front/config/diary.local.conf');
  local.exec(`ln -sf ${confAbsolutePath} /usr/local/etc/nginx/servers/`);
  local.exec(`nginx -s reload`);
});
