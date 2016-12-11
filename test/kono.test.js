
/* mocha globals */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';
var Kono = require('../src/kono');
var expect = require('chai').expect;


var act = function (game, fromX, fromY, toX, toY) {
    game.act({
        from: {x: fromX, y: fromY},
        to: {x: toX, y: toY}
    });
};

describe('Kono', function () {
    it('kono#listActions', function () {
        var game = Kono();
        expect(game.listActions()).to.be.eql([
            {from: {x: 0, y: 0}, to: {x: 0, y: 2}},
            {from: {x: 1, y: 0}, to: {x: 1, y: 2}},
            {from: {x: 2, y: 0}, to: {x: 2, y: 2}},
            {from: {x: 3, y: 0}, to: {x: 3, y: 2}},
        ]);
    });

    it('simulation #1', function () {
        var game = Kono();
        act(game, 3, 0, 3, 2);
        act(game, 1, 2, 3, 2);
        act(game, 2, 0, 2, 2);
        act(game, 0, 3, 0, 1);
        act(game, 2, 1, 0, 1);

        act(game, 3, 3, 3, 1);
        act(game, 0, 1, 3, 1);
        act(game, 1, 3, 0, 3);
        act(game, 1, 1, 1, 2);
        act(game, 0, 3, 0, 0);

        act(game, 2, 2, 0, 2);
        act(game, 3, 2, 3, 3);
        act(game, 1, 0, 1, 1);
        act(game, 0, 0, 0, 1);
        act(game, 3, 1, 2, 1);

        act(game, 0, 1, 0, 0);
        act(game, 2, 1, 2, 0);
        act(game, 0, 0, 0, 1);
        act(game, 2, 0, 1, 0);
        act(game, 0, 1, 0, 0);

        act(game, 0, 2, 0, 1);
        act(game, 2, 3, 2, 2);
        act(game, 1, 2, 0, 2);
        act(game, 3, 3, 3, 2);
        act(game, 0, 2, 0, 0);

        act(game, 2, 2, 2, 3);
        act(game, 1, 1, 2, 1);
        act(game, 3, 2, 2, 2);
        act(game, 1, 0, 1, 1);
        act(game, 2, 3, 2, 1);

        act(game, 0, 1, 2, 1);

        expect(game.listActions()).to.be.eql([]);
        expect(game.result).to.be.equal('blue');
    });

    it('clone method should produce two distinct instances', function () {
        let original = Kono();
        let cloned = original.clone();

        original.act({from: {x: 0, y: 0}, to: {x: 0, y: 2}});
        expect(original.at({x: 0, y: 0})).to.be.equal('empty');
        expect(original.at({x: 0, y: 2})).to.be.equal('blue');

        expect(cloned.at({x: 0, y: 0})).to.be.equal('blue');
        expect(cloned.at({x: 0, y: 2})).to.be.equal('red');
    });
});
