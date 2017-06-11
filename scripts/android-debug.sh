#!/bin/sh

mode=$1

npm run build
npm run uglify
cordova-icon --config=config.xml --icon=www/assets/icon.png
cordova-splash --config=config.xml --splash=www/assets/splash.png

cordova $mode android
