
/* global -Promise */
const Promise = require('promise');
const _ = require('lodash');
const kono = require('./kono');

function defer (func) {
    return new Promise((resolve, reject) => {
        _.defer(() => resolve(func()));
    });
}

function eachPoint (cb) {
    return _.flatten(_.times(4, x => _.times(4, y => cb({x, y}))));
}

function rate (game, player) {
    if (game.result === undefined) {
        return _.sum(_.map(eachPoint(p => {
            const tile = game.at(p);
            if (tile === 'empty') {
                return 0;
            } else if (tile === player) {
                return 1;
            } else {
                return -1;
            }
        })));
    } else if (game.result === player) {
        return 8;
    } else {
        return -8;
    }
}

const minimax = exports.minimax = function (game, player, maxDepth) {
    if (maxDepth === 0 || game.result) {
        return Promise.resolve(rate(game, player));
    } else {
        return Promise.all(_.map(game.childrenState(), state => defer(() => {
            return minimax(state(), player, maxDepth - 1);
        })))
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
    .then(pairs => {
        return _.maxBy(pairs, 'rating');
    });
};
