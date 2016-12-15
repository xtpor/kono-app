
/* global -Promise */
const _ = require('lodash');
const Promise = require('promise');
const worker = require('webworkify');
const util = require('./util');

const workerCount = 8;

function probsRobot (probs, filter=_.identity) {
    return function (game, depth) {
        return exports.alphabetaOptimalOptions(game, depth)
            .then(choices => {
                if (choices[0].rating >= 1000) {
                    // win immediately
                    return choices[0];
                } else {
                    let filtered = _.filter(choices, filter);
                    if (_.isEmpty(filtered)) {
                        console.warn('empty candidates');
                        filtered = choices;
                    }
                    return util.weightedRandom(probs, util.quartiles(filtered));
                }
            })
            .catch(e => console.error(e));
    };
}

exports.easyMode = probsRobot([0.1, 0.2, 0.4, 0.3, 0.1], a => a.rating >= -40);
exports.normalMode = probsRobot([0.3, 0.4, 0.3, 0.0, 0.0], a => a.rating >= -20);
exports.hardMode = probsRobot([0.7, 0.3, 0.0, 0.0, 0.0], a => a.rating >= 0);
exports.impossibleMode = probsRobot([1.0, 0.0, 0.0, 0.0, 0.0]);

let robots = _.times(workerCount, () => worker(require('./robot-worker')));
let currentIndex = 0;

function newRequestId () {
    // -> 0..65535
    return _.random(0, Math.pow(2, 16) - 1);
}

exports.alphabetaOptimal = function (game, depth) {
    return exports.alphabetaOptimalOptions(game, depth)
        .then(choices => _.maxBy(_.shuffle(choices), 'rating'));
};

exports.alphabetaOptimalOptions  = function (game, depth) {
    return Promise.all(_.map(game.listActions(), action => new Promise((resolve, reject) => {
        alphabeta(game.nextRound(action), game.current, depth - 1)
            .then(rating => resolve({action, rating}));
    })))
    .then(choices => _.reverse(_.sortBy(choices, 'rating')))
    .catch(err => console.error(err));
};

function alphabeta (game, player, depth) {
    return new Promise((resolve, reject) => {
        let requestId = newRequestId();
        let robot = robots[currentIndex];
        currentIndex = (currentIndex + 1) % workerCount;

        let handler = function (ev) {
            let {rid, rating} = ev.data;
            if (rid === requestId) {
                resolve(rating);
                robot.removeEventListener('message', handler);
            }
        };
        robot.addEventListener('message', handler);
        robot.postMessage({game, player, depth, rid: requestId});
    });
}
