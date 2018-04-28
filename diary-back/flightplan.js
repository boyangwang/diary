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

plan.remote(['mkdir and download zip', 'deploy-all'], (remote) => {
  remote.exec(`mkdir ${projectsDir}`, { failsafe: true });
  remote.exec(
    `cd ${projectsDir} && wget https://github.com/boyangwang/diary/archive/master.zip -O master.zip`
  );
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

plan.remote(['stop-backend', 'deploy-all'], (remote) => {
  remote.exec(
    `cd ${projectsDir}/diary-master/diary-back && ./node_modules/.bin/pm2 stop diary-back`,
    { failsafe: true }
  );
});

plan.remote(
  [
    'rm all except node_modules, extract zip, install, copy secret',
    'deploy-all',
  ],
  (remote) => {
    remote.with(`cd ${projectsDir}`, () => {
      remote.exec(
        `find ./diary-master/diary-back/ -maxdepth 1 -not -name 'node_modules' -not -name 'diary-back' -print0 | xargs -0 rm -rf -- && 7z x master.zip -y`
      );
      remote.exec(
        `chmod -R +X . && cd ./diary-master/diary-back/ && yarn install --ignore-engines && export NODE_ENV=production`
      );
      remote.exec(
        `./node_modules/.bin/pm2 start ./src/server.js --name diary-back --interpreter=$(which node)`
      );
    });
  }
);

plan.local(['copy-secrets', 'deploy-all'], (local) => {
  local.exec(
    `scp ../secrets.js root@playground.wangboyang.com:${projectsDir}/diary-master/`
  );
  local.exec('echo DONE copy-secrets `pwd`');
});

plan.remote(['frontend-preparation', 'deploy-all'], (remote) => {
  // front
  remote.with(`cd ${projectsDir}`, () => {
    remote.exec(`mkdir -p ./diary-front-build`, {
      failsafe: true,
    });
    remote.exec(`chmod -R 755 ./diary-front-build`);
    remote.exec(
      `ln -sf ${projectsDir}/diary-master/diary-front/config/diary-https.conf /etc/nginx/sites-enabled/`
    );
    remote.exec(`nginx -s reload`);
  });
});

plan.local(
  [
    'scp-frontend',
    // don't do built-frontend with deploy-all, because this must wait
    // 'deploy-all'
  ],
  (local) => {
    local.with(`cd ../diary-front`, () => {
      // this is the time-consuming step. Do it separately and in parallel
      // local.exec(`yarn run build`);
      local.exec(`chmod -R 755 ./build`);
      local.exec(
        `scp -r ./build/* root@playground.wangboyang.com:${projectsDir}/diary-front-build/`
      );
    });
  }
);

plan.local(['link-nginx'], (local) => {
  const confAbsolutePath = path.resolve(
    '../diary-front/config/diary.local.conf'
  );
  local.exec(`ln -sf ${confAbsolutePath} /usr/local/etc/nginx/servers/`);
  local.exec(`nginx -s reload`);
});
