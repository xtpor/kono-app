
/* global -Promise */
const assert = require('assert');
const expect = require('chai').expect;
const Promise = require('promise');
const _ = require('lodash');
const kono = require('./kono');

function deferPs () {
    let p = 0.05;
    return new Promise((resolve, reject) => {
        if (Math.random() <= p) {
            _.defer(() => resolve());
        } else {
            resolve(undefined);
        }
    });
}

function originalRate (game, player, depth) {
    if (game.result === undefined) {
        return _.sum(kono.mapPoints(p => {
            const tile = game.at(p);
            if (tile === 'empty') {
                return 0;
            } else if (tile === player) {
                return 1;
            } else {
                return -1;
            }
        }));
    } else if (game.result === player) {
        return 8;
    } else {
        return -8;
    }
}

let gridWeight;
{
    let weight = [[0.4, 0.8, 0.8, 0.4],
                  [0.8, 1.0, 1.0, 0.8],
                  [0.8, 1.0, 1.0, 0.8],
                  [0.4, 0.8, 0.8, 0.4]];
    gridWeight = function ({x, y}) {
        return weight[x][y];
    };
}

function rate (game, player, depth) {
    if (game.result === undefined) {
        return _.sum(kono.mapPoints(p => {
            const tile = game.at(p);
            if (tile === 'empty') {
                return 0;
            } else if (tile === player) {
                return 50 * gridWeight(p) + depth;
            } else {
                return -50 * gridWeight(p) - depth;
            }
        }));
    } else if (game.result === player) {
        return 1000 + depth;
    } else {
        return -1000 - depth;
    }
}

const alphabeta = exports.alphabeta = function (game, player, depth, a, b) {
    function prunning (type, states, v, a, b) {
        expect(states.length).to.be.not.equal(0/* , kono.formatDebug(game) */);
        let [first, rest] = [_.head(states), _.tail(states)];
        return deferPs()
            .then(() => alphabeta(first(), player, depth - 1, a, b))
            .then(rating => {
                if (type === 'beta') {
                    v = Math.max(v, rating);
                    a = Math.max(a, v);
                } else if (type === 'alpha') {
                    v = Math.min(v, rating);
                    b = Math.min(b, v);
                }

                if (b <= a || _.isEmpty(rest)) {
                    return v;
                } else {
                    expect(states.length).to.be.not.equal(0);
                    return prunning(type, rest, v, a, b);
                }
            });
    }

    if (depth === 0 || game.result) {
        return Promise.resolve(rate(game, player, depth));
    } else if (game.current === player) {
        return prunning('beta', game.childrenState(), -Infinity, a, b);
    } else {
        return prunning('alpha', game.childrenState(), Infinity, a, b);
    }
};

const minimax = exports.minimax = function (game, player, maxDepth) {
    if (maxDepth === 0 || game.result) {
        return Promise.resolve(rate(game, player, maxDepth));
    } else {
        let childrenRatings = _.map(game.childrenState(), state => {
            return deferPs().then(() => minimax(state(), player, maxDepth - 1));
        });
        return Promise.all(childrenRatings)
            .then(ratings => {
                let combinator = game.current === player ? _.max : _.min;
                return combinator(ratings);
            });
    }
};

exports.minimaxOptimal = function (game, depth) {
    return Promise.all(_.map(game.listActions(), action => {
        return minimax(game.nextRound(action), game.current, depth - 1)
            .then(rating => ({action, rating}));
    }))
    .then(pairs => _.maxBy(pairs, 'rating'));
};

exports.alphabetaOptimal = function (game, depth) {
    return exports.alphabetaOptimalOptions(game, depth)
        .then(pairs => _.maxBy(pairs, 'rating'));
};

exports.alphabetaOptimalOptions = function (game, depth) {
    return Promise.all(_.map(game.listActions(), action => {
        return alphabeta(game.nextRound(action), game.current, depth - 1, -Infinity, Infinity)
            .then(rating => ({action, rating}));
    }));
};
