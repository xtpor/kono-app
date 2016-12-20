
'use strict';


exports.tile = function (x, y) {
    return {x: 46 + 180*x, y: 326 + 180*y, w: 86, h: 86};
};

exports.horiz = function (x, y) {
    return {x: 153 + 180*x, y: 364 + 180*y, w: 52, h: 11};
};

exports.verti = function (x, y) {
    return {x: 84 + 180*x, y: 434 + 180*y, w: 11, h: 52};
};

exports.playButton = {x: 250, y: 580, w: 220, h: 220};
exports.difficultyButton = {x: 60, y: 1026, w: 95, h: 100};
exports.colorButton = {x: 218, y: 1032, w: 100, h: 100};
exports.soundButton = {x: 376, y: 1036, w: 105, h: 90};
exports.tutorialButton = {x: 570, y: 1036, w: 75, h: 95};
