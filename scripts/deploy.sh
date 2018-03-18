#!/usr/bin/env bash

cd ../diary-front && yarn version --new-version patch && \
cd ../diary-back && yarn version --new-version patch || \
cd .. && git commit -am "DEPLOY: increment version" && git push origin master && \
cd diary-back && export FLIGHTPLAN_KEY_PATH=~/.ssh/id_rsa && \
fly deploy-all:staging --flightplan ./flightplan.js
