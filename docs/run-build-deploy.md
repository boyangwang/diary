# run-build-deploy

## 2019-Jan-06 Update Forensics on Aliyun ECS
```bash
export projectsDir=/var/www/diary_project; mongod --bind_ip 127.0.0.1 --fork --dbpath ${projectsDir}/diary-data/mongo/data --logpath ${projectsDir}/diary-data/mongod.log

./node_modules/.bin/pm2 start ./src/server.js --name diary-back --interpreter=$(which node)
```

## Run and devleop

### Windows

`& 'C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe' --bind_ip 127.0.0.1 --dbpath C:\projects\diary\diary-back\mongo\data`

`& 'C:\Program Files\MongoDB\Server\3.4\bin\mongo.exe'`

### Mac

- install brew

- check [CN homebrew guide](./cn-homebrew) if needed

- install mongodb
  ```
  brew install mongodb
  # if run service at startup
  brew services start mongodb
  # if adhoc
  mongod --config /usr/local/etc/mongod.conf
  ```

- In diary-back, `yarn install`

- If needed, use CN mirror
  `yarn config set registry 'https://registry.npm.taobao.org'`

- `yarn test`

- `yarn start`

- In diary-front, `yarn install`

- `yarn test`

- `yarn start`

- On local dev env, we also need to link nginx conf. This is to make sure front+back are accessed port same origin (including port), so that we simulate prod CORS environment. In diary-back directory, run `yarn run flightplan -- link-nginx:localhost`

- Access localhost:14432 from browser (not :3000)

- ~If need to use upload image functionality, see https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js~ No longer needed since it's put in secrets now

```
~/.aws/credentials:
[default]
aws_access_key_id=your_access_key
aws_secret_access_key=your_secret_key
```

- There are oauth secrets like GitHub. They are in secrets.js - one that needs to be created per env and maintained. See secrets.js.sample, create `secrets.js` in same location, fill values

- To make oauth work, in hosts file direct deardiary.network to 127.0.0.1

### husky hooks

If installed using yarn, install script is ignored. Trigger it mannually by `node node_modules/husky/bin/install.js`

## Build and deploy

`yarn run deploy`

- ~~We also increment version number. You will need `yarn config set version-git-tag false` to prevent creating git tag (because 2 package.json will create dup tags)~~

- No need to turn off git-tag now. In deploy.sh made second yarn version call fail-safe

### Deploy Walkthrough, ver1

- assume mongodb

- assume wget, 7z
  `sudo apt-get install wget p7zip-full`

- download zip, unzip

- assume yarn exists
  ```
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
  sudo apt-get update && sudo apt-get install yarn
  ```

- go in, run yarn install, yarn build. Assume g++ build-essential

- pm2 stop prev back

- pm2 start back

- assume nginx, link nginx conf, reload

### Deploy Walkthrough, ver2

- local tasks...

- start frontend build &

- back &
  - download zip
  - start mongo
  - DISRUPTION
    - stop pm2
    - rm all except node_modules on diary-back
    - extract zip
    - install
    - copy secret
  - start pm2

- scp upload frontend build

## all about oauth

- if changed url/port/domain, need to update on github side

## all about HTTPS

- Assume certbot ``

- Yes, this creates a new genre of prod/dev inconsistency problem, by making it https on prod but not on dev

- nginx listen 443, proxy to 14464, reflected in nginx conf

- cert sign domain, let's encrypt, certbot. Install as per https://certbot.eff.org/lets-encrypt/ubuntutrusty-nginx

- because certbot not readily available on ubuntu 15.04, decided to revamp servers... big project

- certbot all working

## setup server from scratch (no docker for now, sigh...)

```bash
sudo apt-get update

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot

sudo apt-get update

apt-get install -y git wget p7zip-full mongodb-org nodejs nginx python-certbot-nginx yarn g++ build-essential
```

- To avoid clash remove default.conf in sites-enabled

- `certbot --nginx certonly` and then update nginx conf
