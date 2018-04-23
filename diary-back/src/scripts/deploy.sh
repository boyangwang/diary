#!/usr/bin/env bash
echo "---------- PWD `pwd`"
# tagging and git
cd ../diary-front && yarn version --new-version patch && \
cd ../diary-back && yarn config set version-git-tag false && \
yarn version --new-version patch && yarn config set version-git-tag true && \
cd .. && git commit -am "DEPLOY: increment version" && git push --tags origin master
# flightplan back
cd diary-back
export FLIGHTPLAN_KEY_PATH=~/.ssh/id_rsa
fly deploy-all:staging --flightplan ./flightplan.js &
# build frontend
cd ../diary-front
yarn run build &

wait

cd ../diary-back
fly scp-frontend:staging --flightplan ./flightplan.js
