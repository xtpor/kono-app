
/* global -Promise */
const _ = require('lodash');
const Promise = require('promise');
const worker = require('webworkify');

const workerCount = 8;

let robots = _.times(workerCount, () => worker(require('./robot-worker')));
let currentIndex = 0;

function newRequestId () {
    // -> 0..65535
    return _.random(0, Math.pow(2, 16) - 1);
}

exports.alphabetaOptimal = function (game, depth) {
    console.log('alphabetaOptimal');
    return Promise.all(_.map(game.listActions(), action => new Promise((resolve, reject) => {
        alphabeta(game.nextRound(action), game.current, depth - 1)
            .then(rating => resolve({action, rating}));
    })))
    .then(choices => {
        console.log(require('util').inspect(choices, { depth: null }));
        return _.maxBy(_.shuffle(choices), 'rating');
    })
    .catch(err => {
        console.error(err);
    });
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
