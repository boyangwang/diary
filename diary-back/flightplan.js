const path = require('path');
const plan = require('flightplan');

if (!process.env.FLIGHTPLAN_KEY_PATH) {
  console.error(
    'You must specify envvar FLIGHTPLAN_KEY_PATH by export FLIGHTPLAN_KEY_PATH=foobar'
  );
  process.exit(1);
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

plan.remote(['mongodump'], (remote) => {
  remote.with(`cd ${projectsDir}/`, () => {
    remote.exec(`mongodump --host localhost --db diary --out mongodump`);
  });
});

plan.local(['mongorestore'], (local) => {
  local.exec(
    `scp -r root@playground.wangboyang.com:${projectsDir}/mongodump/ ./mongo/`
  );
  local.exec(`mongorestore ./mongo/mongodump/`);
});

plan.local(['mongorestore-from-local-backup-to-remote-1'], (local) => {
  local.exec(
    `scp -r ./mongo/mongodump root@playground.wangboyang.com:${projectsDir}/`
  );
});

plan.remote(['mongorestore-from-local-backup-to-remote-2'], (remote) => {
  remote.with(`cd ${projectsDir}`, () => {
    remote.exec(`mongorestore ./mongodump/`);
  });
});

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
    `mongod --bind_ip 127.0.0.1 --fork --dbpath ${projectsDir}/diary-data/mongo/data --logpath ${projectsDir}/diary-data/mongod.log`,
    { failsafe: true }
  );
});

plan.local(['copy-secrets', 'deploy-all'], (local) => {
  local.exec(
    `scp ../secrets.js root@playground.wangboyang.com:${projectsDir}/diary-master/`
  );
  local.exec('echo DONE copy-secrets `pwd`');
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
    // remote.exec(`yarn install --ignore-engines`);
    remote.exec(
      `ln -sf ${projectsDir}/diary-master/diary-front/config/diary-https.conf /etc/nginx/sites-enabled/`
    );
    remote.exec(`nginx -s reload`);
    remote.exec(`mkdir ./build`, { failsafe: true });
    remote.exec(`chmod -R 755 ./build`);
    // remote.exec(`yarn run build`);
  });
});

plan.local(['build-frontend-and-scp', 'deploy-all'], (local) => {
  local.with(`cd ../diary-front`, () => {
    local.exec(`yarn run build`);
    local.exec(`chmod -R 755 ./build`);
    local.exec(
      `scp -r ./build/* root@playground.wangboyang.com:${projectsDir}/diary-master/diary-front/build/`
    );
  });
});

plan.local(['link-nginx'], (local) => {
  const confAbsolutePath = path.resolve(
    '../diary-front/config/diary.local.conf'
  );
  local.exec(`ln -sf ${confAbsolutePath} /usr/local/etc/nginx/servers/`);
  local.exec(`nginx -s reload`);
});
