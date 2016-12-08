
/*jshint browser: true*/
const app = require('./src/main.js');

document.addEventListener("deviceready", function () {
    app();
}, false);
