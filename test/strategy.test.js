
const expect = require('chai').expect;
const kono = require('../src/kono');
const strategy = require('../src/strategy');


describe('minimax algorithm', function () {
    this.timeout(5000);

    it('know how to win #1', function () {
        let game = kono({
            result: undefined,
            current: 'blue',
            board: [
                ['empty', 'blue', 'empty', 'empty'],
                ['empty', 'blue', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty'],
                ['empty', 'red', 'red', 'empty']
            ]
        });

        return strategy.minimaxOptimal(game, 1).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 1}, to: {x: 3, y: 1}});
            expect(strategy.rating).to.be.equal(8);
        });
    });

    it('know how to win #2', function () {
        let game = kono({
            result: undefined,
            current: 'blue',
            board: [
                ['red', 'blue', 'empty', 'blue'],
                ['red', 'blue', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty']
            ]
        });

        return strategy.minimaxOptimal(game, 3).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 3}, to: {x: 0, y: 2}});
            expect(strategy.rating).to.be.equal(8);
        });
    });

    it('alphabeta #1', function () {
        let game = kono({
            result: undefined,
            current: 'blue',
            board: [
                ['empty', 'blue', 'empty', 'empty'],
                ['empty', 'blue', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty'],
                ['empty', 'red', 'red', 'empty']
            ]
        });

        return strategy.alphabetaOptimal(game, 1).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 1}, to: {x: 3, y: 1}});
            expect(strategy.rating).to.be.equal(8);
        });
    });

    it('alphabeta #2', function () {
        let game = kono({
            result: undefined,
            current: 'blue',
            board: [
                ['red', 'blue', 'empty', 'blue'],
                ['red', 'blue', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty'],
                ['empty', 'empty', 'empty', 'empty']
            ]
        });

        return strategy.alphabetaOptimal(game, 3).then(strategy => {
            expect(strategy.action).to.be.eql({from: {x: 0, y: 3}, to: {x: 0, y: 2}});
            expect(strategy.rating).to.be.equal(8);
        });
    });
});
