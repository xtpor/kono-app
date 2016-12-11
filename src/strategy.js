
/* global -Promise */
const Promise = require('promise');
const _ = require('lodash');
const kono = require('./kono');

function defer (func) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            _.defer(() => resolve(func(...args)));
        });
    };
}

function rate (game, player) {
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

const minimax = exports.minimax = function (game, player, maxDepth) {
    if (maxDepth === 0 || game.result) {
        return Promise.resolve(rate(game, player));
    } else {
        let childrenRatings = _.map(game.childrenState(), defer(state => {
            return minimax(state(), player, maxDepth - 1);
        }));
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
    .then(pairs => {
        return _.maxBy(pairs, 'rating');
    });
};
