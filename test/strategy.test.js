
const expect = require('chai').expect;
const kono = require('../src/kono');
const strategy = require('../src/strategy');


describe('minimax algorithm', function () {
    this.timeout(7500);

    it('know how to win #1', function () {
        let game = kono({
            result: undefined,
            current: 'blue',
            _board: [
                ['empty', 'blue', 'empty', 'empty'],
                ['empty', 'blue', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty'],
                ['empty', 'red', 'red', 'empty']
            ]
        });

        return strategy.minimaxOptimal(game, 1).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 1}, to: {x: 3, y: 1}});
            expect(strategy.rating).to.be.equal(1000);
        });
    });

    it('know how to win #2', function () {
        let game = kono({
            result: undefined,
            current: 'blue',
            _board: [
                ['red', 'blue', 'empty', 'blue'],
                ['red', 'blue', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty']
            ]
        });

        return strategy.minimaxOptimal(game, 3).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 3}, to: {x: 0, y: 2}});
            expect(strategy.rating).to.be.equal(1000);
        });
    });

    it('alphabeta #1', function () {
        let game = kono({
            result: undefined,
            current: 'blue',
            _board: [
                ['empty', 'blue', 'empty', 'empty'],
                ['empty', 'blue', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty'],
                ['empty', 'red', 'red', 'empty']
            ]
        });

        return strategy.alphabetaOptimal(game, 1).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 1}, to: {x: 3, y: 1}});
            expect(strategy.rating).to.be.equal(1000);
        });
    });

    it('alphabeta #2', function () {
        let game = kono({
            result: undefined,
            current: 'blue',
            _board: [
                ['red', 'blue', 'empty', 'blue'],
                ['red', 'blue', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty']
            ]
        });

        return strategy.alphabetaOptimal(game, 3).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 3}, to: {x: 0, y: 2}});
            expect(strategy.rating).to.be.equal(1000);
        });
    });

    it('alphabeta: take the shortest path to win', function () {
        let game = kono({
            result: undefined,
            current: 'red',
            _board: [
                ['red', 'blue', 'red', 'red'],
                ['red', 'red', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty'],
                ['empty', 'blue', 'empty', 'empty']
            ]
        });

        return strategy.alphabetaOptimal(game, 7).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 3}, to: {x: 0, y: 1}});
        });
    });

    it('alphabeta: kill the enemy as quick as possible', function () {
        let game = kono({
            result: undefined,
            current: 'red',
            _board: [
                ['red', 'empty', 'empty', 'red'],
                ['red', 'empty', 'red', 'empty'],
                ['empty', 'blue', 'empty', 'empty'],
                ['blue', 'empty', 'blue', 'empty']
            ]
        });
    });

    it('minimax is working properly when win by no possible move', function () {
        let game = kono();
        game.act({from: {x: 2, y: 0}, to: {x: 2, y: 2}});

        return strategy.alphabetaOptimal(game, 7).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 2}, to: {x: 2, y: 2}});
            game.act(strategy.action);
        })
        .then(() => {
            game.act({from: {x: 3, y: 0}, to: {x: 3, y: 2}});
            return strategy.alphabetaOptimal(game, 7);
        })
        .then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 1, y: 2}, to: {x: 3, y: 2}});
        });
    });
});
