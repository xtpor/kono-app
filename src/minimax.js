
let kono = require('./kono');
let _ = require('lodash');


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

function alphabeta (game, player, depth, alpha, beta) {
    if (depth === 0 || game.result) {
        return rate(game, player, depth);
    } else if (game.current === player) {
        let v = -Infinity;
        _.some(game.childrenState(), state => {
            v = Math.max(v, alphabeta(state(), player, depth - 1, alpha, beta));
            alpha = Math.max(alpha, v);
            return beta <= alpha; // (* beta cut-off *)
        });
        return v;
    } else {
        let v = Infinity;
        _.some(game.childrenState(), state => {
            v = Math.min(v, alphabeta(state(), player, depth - 1, alpha, beta));
            beta = Math.min(beta, v);
            return beta <= alpha; // (* alpha cut-off *)
        });
        return v;
    }
}

function alphabetaOptimalOptions (game, depth) {
    return _.map(game.listActions(), action => {
        return {
            action: action,
            rating: alphabeta(game.nextRound(action), game.current, depth - 1, -Infinity, Infinity)
        };
    });
}

function alphabetaOptimal (game, depth) {
    return _.maxBy(_.shuffle(alphabetaOptimalOptions(game, depth)), 'rating');
}

exports.alphabeta = alphabeta;
exports.alphabetaOptimal = alphabetaOptimal;
