
'use strict';
var expect = require('chai').expect;
var assert = require('assert');
var _ = require('lodash');


function pointGuard (point) {
    if (0 <= point.x && point.x < 4 && 0 <= point.y && point.y < 4) {
        return point;
    }
}

function isInt (value) {
    return typeof value === 'number' && ~~value === value;
}

function validatePoint (point) {
    assert(isInt(point.x));
    assert(isInt(point.y));
    assert(pointGuard(point));
}

function up (point) {
    return point && pointGuard({x: point.x, y: point.y - 1});
}

function down (point) {
    return point && pointGuard({x: point.x, y: point.y + 1});
}

function left (point) {
    return point && pointGuard({x: point.x - 1, y: point.y});
}

function right (point) {
    return point && pointGuard({x: point.x + 1, y: point.y});
}

var oppsite;
{
    let oppsiteTable = {red: 'blue', blue: 'red', empty: 'empty'};
    oppsite = function (tile) {
        return oppsiteTable[tile];
    };
}

var mapPoints = function (cb) {
    var collector = [];
    _.times(4, function (x) {
        _.times(4, function (y) {
            collector.push(cb({x: x, y: y}));
        });
    });
    return collector;
};

var jsonClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

var Game = module.exports = function (spec) {
    var that = {};
    spec = spec || {};

    /* public fields */
    that.result = spec.result || undefined;
    that.current = spec.current || 'blue';

    /* private fields */
    var actionsListCache = null;

    var board = spec.board || _.times(4, function (x) {
        return _.times(4, function (y) {
            if (y < 2) {
                return 'blue';
            } else {
                return 'red';
            }
        });
    });

    /* public methods */
    that.at = function (point) {
        validatePoint(point);
        return board[point.x][point.y];
    };

    that.listActions = function () {
        if (that.result) {
            return [];
        }
        if (!actionsListCache) {
            actionsListCache = computeActionsList();
        }
        return actionsListCache;
    };

    that.act = function (action) {
        validateAction(action);
        board[action.to.x][action.to.y] = board[action.from.x][action.from.y];
        board[action.from.x][action.from.y] = 'empty';
        that.current = oppsite(that.current);

        // invalidate the action list cache
        actionsListCache = computeActionsList();

        if (_.isEmpty(actionsListCache)) {
            that.result = oppsite(that.current);
        }

        if (countTile(that.current) === 1) {
            that.result = oppsite(that.current);
        }

        return that;
    };

    that.childrenState = function () {
        return _.map(that.listActions(), action => () => that.nextRound(action));
    };

    that.nextRound = function (action) {
        return that.clone().act(action);
    };

    that.clone = function () {
        return Game({
            current: that.current,
            result: that.result,
            board: jsonClone(board)
        });
    };

    /* private methods */
    var validateAction = function (action) {
        // expect(that.listActions()).to.deep.include.members([action]);
        assert(_.some(that.listActions(), a => {
            return JSON.stringify(a) === JSON.stringify(action);
        }));
    };

    var computeActionsList = function () {
        var possibleActions = [];
        _.forEach([up, down, left, right], next => {
            mapPoints(p => {
                possibleActions.push(testMove(p, next));
                possibleActions.push(testAttackFar(p, next));
                possibleActions.push(testAttackClose(p, next));
            });
        });
        return _.compact(possibleActions);
    };

    var get = function (index) {
        if (index) {
            return that.at(index);
        }
    };

    var testMove = function (start, next) {
        var cond = get(start) === that.current &&
                   get(next(start)) === 'empty';
        if (cond) {
            return {from: start, to: next(start)};
        }
    };

    var testAttackClose = function (start, next) {
        var cond = get(start) === that.current &&
                   get(next(start)) === that.current &&
                   get(next(next(start))) === oppsite(that.current);
        if (cond) {
            return {from: start, to: next(next(start))};
        }
    };

    var testAttackFar = function (start, next) {
        var cond = get(start) === that.current &&
                   get(next(start)) === that.current &&
                   get(next(next(start))) === 'empty' &&
                   get(next(next(next((start))))) === oppsite(that.current);
        if (cond) {
            return {from: start, to: next(next(next(start)))};
        }
    };

    var countTile = function (tile) {
        return _.filter(mapPoints(get), function (t) {
            return t === tile;
        }).length;
    };

    return that;

};

module.exports.formatDebug = function (game) {
    let header = ['---- current:', game.current,
                  'result:', game.result,
                  'moves: ', game.listActions().length].join(' ');
    let board = _.times(4, j => {
        return _.times(4, i => {
            let tile = game.at({x: i, y: j});
            return {
                'empty': '.',
                'blue': 'B',
                'red': 'R'
            }[tile];
        }).join('');
    }).join('\n');

    return header + '\n' + board;
};

// exports helper functions
Game.mapPoints = mapPoints;
