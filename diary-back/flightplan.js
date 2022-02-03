const path = require('path');
const plan = require('flightplan');

if (!process.env.FLIGHTPLAN_KEY_PATH) {
  console.error(
    'You must specify envvar FLIGHTPLAN_KEY_PATH by export FLIGHTPLAN_KEY_PATH=foobar'
  );
  process.exit(1);
}

const config = {
  staging: {
    conn: {
      // host: 'deardiary.network',
      // host: 'playground.wangboyang.com',
      host: '188.166.243.67',
      port: 22,
      username: 'root',
      privateKey: process.env.FLIGHTPLAN_KEY_PATH,
      agent: process.env.SSH_AUTH_SOCK,
    },
    conf: {
      projectDir:
        /*'/var/www/diary_project',*/ '/data/server-apps/diary_project',
    },
  },
};

plan.target('staging', config.staging.conn, config.staging.conf);

plan.target('localhost');

plan.remote(['test'], (remote) => {
  remote.log(`Logging remote: ${plan.runtime.target}`);
  remote.log(`Logging remote: ${plan.runtime.task}`);
  remote.log(`Logging remote: ${config[plan.runtime.target].conf.projectDir}`);
});

plan.local(['test'], (local) => {
  local.log(`Logging local: ${plan.runtime.target}`);
  local.log(`Logging local: ${plan.runtime.task}`);
  local.log(`Logging local: ${config[plan.runtime.target].conf.projectDir}`);
  local.exec('whoami');
});

plan.remote(['mongodump', 'mongorestore'], (remote) => {
  remote.with(`cd ${config[plan.runtime.target].conf.projectDir}/`, () => {
    remote.exec(`mongodump --host localhost --db diary --out mongodump`);
  });
});

plan.local(['mongorestore'], (local) => {
  local.exec(
    `scp -r root@${config[plan.runtime.target].conn.host}:${
      config[plan.runtime.target].conf.projectDir
    }/mongodump/ ./mongo/`
  );
  local.exec(`yarn run-mongo`);
  local.exec(`mongorestore ./mongo/mongodump/`);
});

plan.local(['mongorestore-from-local-backup-to-remote-1'], (local) => {
  local.exec(
    `scp -r ./mongo/mongodump root@deardiary.network:${
      config[plan.runtime.target].conf.projectDir
    }/`
  );
});

plan.remote(['mongorestore-from-local-backup-to-remote-2'], (remote) => {
  remote.with(`cd ${config[plan.runtime.target].conf.projectDir}`, () => {
    remote.exec(`mongorestore ./mongodump/`);
  });
});

plan.remote(['mkdir and download zip', 'deploy-all'], (remote) => {
  remote.exec(`mkdir ${config[plan.runtime.target].conf.projectDir}`, {
    failsafe: true,
  });
  remote.exec(
    `cd ${
      config[plan.runtime.target].conf.projectDir
    } && wget https://github.com/boyangwang/diary/archive/master.zip -O master.zip`
  );
});

plan.remote(['run-mongod', 'deploy-all'], (remote) => {
  // run mongod if not running
  remote.exec(
    `mkdir -p ${
      config[plan.runtime.target].conf.projectDir
    }/diary-data/mongo/data`,
    {
      failsafe: true,
    }
  );
  remote.exec(
    `mongod --bind_ip 127.0.0.1 --fork --dbpath ${
      config[plan.runtime.target].conf.projectDir
    }/diary-data/mongo/data --logpath ${
      config[plan.runtime.target].conf.projectDir
    }/diary-data/mongod.log`,
    { failsafe: true }
  );
});

plan.remote(['stop-backend', 'deploy-all'], (remote) => {
  remote.exec(
    `cd ${
      config[plan.runtime.target].conf.projectDir
    }/diary-master/diary-back && ./node_modules/.bin/pm2 stop diary-back`,
    { failsafe: true }
  );
});

plan.remote(
  [
    'rm all except node_modules, extract zip, install, copy secret',
    'deploy-all',
  ],
  (remote) => {
    remote.with(`cd ${config[plan.runtime.target].conf.projectDir}`, () => {
      remote.exec(
        `find ./diary-master/diary-back/ -maxdepth 1 -not -name 'node_modules' -not -name 'diary-back' -print0 | xargs -0 rm -rf -- && 7z x master.zip -y`
      );
      remote.exec(
        `chmod -R +X . && cd ./diary-master/diary-back/ && yarn install --ignore-engines && export NODE_ENV=production`
      );
      remote.exec(
        `cd ./diary-master/diary-back/ && ./node_modules/.bin/pm2 start ./src/server.js --name diary-back --interpreter=$(which node)`
      );
    });
  }
);

plan.local(['copy-secrets', 'deploy-all'], (local) => {
  local.exec(
    `scp ../secrets.js root@deardiary.network:${
      config[plan.runtime.target].conf.projectDir
    }/diary-master/`
  );
  local.exec('echo DONE copy-secrets `pwd`');
});

plan.remote(['frontend-preparation', 'deploy-all'], (remote) => {
  // front
  remote.with(`cd ${config[plan.runtime.target].conf.projectDir}`, () => {
    remote.exec(`mkdir -p ./diary-front-build`, {
      failsafe: true,
    });
    remote.exec(`chmod -R 755 ./diary-front-build`);
    remote.exec(
      `ln -sf ${
        config[plan.runtime.target].conf.projectDir
      }/diary-master/diary-front/nginx-config/diary-https.conf /etc/nginx/sites-enabled/`
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
        `scp -r -v ./build/* root@deardiary.network:${
          config[plan.runtime.target].conf.projectDir
        }/diary-front-build/`
      );
    });
  }
);

plan.local(['link-nginx'], (local) => {
  const confAbsolutePath = path.resolve(
    '../diary-front/nginx-config/diary.local.conf'
  );
  local.exec(`ln -sf ${confAbsolutePath} /usr/local/etc/nginx/servers/`);
  local.exec(`nginx -s reload`);
});

plan.local(['link-nginx-ubuntu'], (local) => {
  const confAbsolutePath = path.resolve(
    '../diary-front/nginx-config/diary.local.conf'
  );
  local.exec(`ln -sf ${confAbsolutePath} /etc/nginx/sites-enabled/`);
  local.exec(`nginx -s reload`);
});
