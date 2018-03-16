# run-build-deploy

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

- `npm test`

- `npm start`

- In diary-front, `yarn install`

- `npm test`

- `npm start`

### husky hooks

If installed using yarn, install script is ignored. Trigger it mannually by `node node_modules/husky/bin/install.js`

## Build and deploy

`yarn run deploy`

- We also increment version number. You will need `yarn config set version-git-tag false` to prevent creating git tag (because 2 package.json will create dup tags)

### Walkthrough

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

- go in, run yarn install, yarn build

- pm2 stop prev back

- pm2 start back

- link nginx conf, reload
