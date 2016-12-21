#!/bin/sh

npm run build
npm run uglify
cordova-icon --config=config.xml --icon=www/assets/icon.png
cordova run android
