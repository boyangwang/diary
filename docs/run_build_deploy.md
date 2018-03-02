# run_build_deploy

## run and devleop

### Windows

`& 'C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe' --bind_ip 127.0.0.1 --dbpath C:\projects\diary\diary-back\mongo\data`

`& 'C:\Program Files\MongoDB\Server\3.4\bin\mongo.exe'`

### Mac

- install brew

- check [CN homebrew guide](./cn_homebrew) if needed

- install mongodb
  ```
  brew install mongodb
  # if run service at startup
  brew services start mongodb
  # if adhoc
  mongod --config /usr/local/etc/mongod.conf
  ```

- In diary-back, `yarn install`

- `npm test`

- `npm start`

- In diary-front, `yarn install`

- `npm test`

- `npm start`

## build and deploy