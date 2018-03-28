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

- `yarn test`

- `yarn start`

- In diary-front, `yarn install`

- `yarn test`

- `yarn start`

- On local dev env, we also need to link nginx conf. This is to make sure front+back are accessed port same origin (including port), so that we simulate prod CORS environment. In diary-back directory, run `yarn run flightplan -- link-nginx:localhost`

- Access localhost:14432 from browser (not :3000)

- If need to use upload image functionality, see https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js

```
~/.aws/credentials:
[default]
aws_access_key_id=your_access_key
aws_secret_access_key=your_secret_key
```

### husky hooks

If installed using yarn, install script is ignored. Trigger it mannually by `node node_modules/husky/bin/install.js`

## Build and deploy

`yarn run deploy`

- ~~We also increment version number. You will need `yarn config set version-git-tag false` to prevent creating git tag (because 2 package.json will create dup tags)~~

- No need to turn off git-tag now. In deploy.sh made second yarn version call fail-safe

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
