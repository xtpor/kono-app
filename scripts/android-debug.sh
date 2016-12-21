#!/bin/sh

npm run build
cordova-icon --config=config.xml --icon=www/assets/icon.png
cordova run android
