
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

var cloneBoard = function (from) {
    return _.times(4, function (x) {
        return _.times(4, function (y) {
            return from[x][y];
        });
    });
};

var Game = module.exports = function (spec) {
    var that = _.create(Game.prototype, spec);
    _.defaults(that, {
        result: undefined,
        current: 'blue',
        _actionsListCache: null,
        _board: _.times(4, function (x) {
            return _.times(4, function (y) {
                if (y < 2) {
                    return 'blue';
                } else {
                    return 'red';
                }
            });
        })
    });

    return that;
};

    /* public methods */
Game.prototype.at = function (point) {
    validatePoint(point);
    return this._board[point.x][point.y];
};

Game.prototype.listActions = function () {
    if (this.result) {
        return [];
    }
    if (!this._actionsListCache) {
        this._actionsListCache = this._computeActionsList();
    }
    return this._actionsListCache;
};

Game.prototype.act = function (action) {
    this._validateAction(action);
    this._board[action.to.x][action.to.y] = this._board[action.from.x][action.from.y];
    this._board[action.from.x][action.from.y] = 'empty';
    this.current = oppsite(this.current);

    // invalidate the action list cache
    this._actionsListCache = this._computeActionsList();

    if (_.isEmpty(this._actionsListCache)) {
        this.result = oppsite(this.current);
    }

    if (this._countTile(this.current) === 1) {
        this.result = oppsite(this.current);
    }

    return this;
};

Game.prototype.childrenState = function () {
    return _.map(this.listActions(), action => () => this.nextRound(action));
};

Game.prototype.nextRound = function (action) {
    return this.clone().act(action);
};

Game.prototype.clone = function () {
    return Game({
        current: this.current,
        result: this.result,
        _board: cloneBoard(this._board),
        _actionsListCache: this._actionsListCache
    });
};

Game.prototype._validateAction = function (action) {
    // expect(that.listActions()).to.deep.include.members([action]);
    assert(_.some(this.listActions(), a => {
        return JSON.stringify(a) === JSON.stringify(action);
    }));
};

Game.prototype._computeActionsList = function () {
    var possibleActions = [];
    _.forEach([up, down, left, right], next => {
        mapPoints(p => {
            possibleActions.push(this._testMove(p, next));
            possibleActions.push(this._testAttackFar(p, next));
            possibleActions.push(this._testAttackClose(p, next));
        });
    });
    return _.compact(possibleActions);
};

Game.prototype._get = function (index) {
    if (index) {
        return this.at(index);
    }
};

Game.prototype._testMove = function (start, next) {
    var cond = this._get(start) === this.current &&
               this._get(next(start)) === 'empty';
    if (cond) {
        return {from: start, to: next(start)};
    }
};

Game.prototype._testAttackClose = function (start, next) {
    var cond = this._get(start) === this.current &&
               this._get(next(start)) === this.current &&
               this._get(next(next(start))) === oppsite(this.current);
    if (cond) {
        return {from: start, to: next(next(start))};
    }
};

Game.prototype._testAttackFar = function (start, next) {
    var cond = this._get(start) === this.current &&
               this._get(next(start)) === this.current &&
               this._get(next(next(start))) === 'empty' &&
               this._get(next(next(next((start))))) === oppsite(this.current);
    if (cond) {
        return {from: start, to: next(next(next(start)))};
    }
};

Game.prototype._countTile = function (tile) {
    return _.filter(mapPoints(i => this._get(i)), function (t) {
        return t === tile;
    }).length;
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
