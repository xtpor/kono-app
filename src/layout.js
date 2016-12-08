
'use strict';
var _ = require('underscore');


var rawPosition = {
    'board': [47, 184, 400, 400],
    'enemyIcon': [50, 648, 70, 70],
    'enemyName': [140, 648, 300, 70],
    'selfIcon': [195, 50, 70, 70],
    'selfName': [140, 50, 300, 70],
    'grid:0,0': [59, 496, 75, 75],
    'grid:0,1': [59, 396, 75, 75],
    'grid:0,2': [59, 296, 75, 75],
    'grid:0,3': [59, 196, 75, 75],
    'grid:1,0': [159, 496, 75, 75],
    'grid:1,1': [159, 396, 75, 75],
    'grid:1,2': [159, 296, 75, 75],
    'grid:1,3': [159, 196, 75, 75],
    'grid:2,0': [259, 496, 75, 75],
    'grid:2,1': [259, 396, 75, 75],
    'grid:2,2': [259, 296, 75, 75],
    'grid:2,3': [259, 196, 75, 75],
    'grid:3,0': [359, 496, 75, 75],
    'grid:3,1': [359, 396, 75, 75],
    'grid:3,2': [359, 296, 75, 75],
    'grid:3,3': [359, 196, 75, 75],
    'panel': [35, 284, 430, 200],
    'panelText': [35, 346, 430, 75],
    'screen': [0, 0, 512, 768],
};

var screenHeight = rawPosition.screen[3];

module.exports = _.object(_.map(rawPosition, function (pos, name) {
    return [name, {
        x: pos[0],
        y: screenHeight - pos[1] - pos[3],
        w: pos[2],
    h: pos[3]}];
}));
