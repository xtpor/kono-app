
const expect = require('chai').expect;
const kono = require('../src/kono');
const minimax = require('../src/minimax');


describe('synchronize minimax algorithm', function () {
    this.timeout(7500);

    it('pick a winning move', function () {
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

        let choice = minimax.alphabetaOptimal(game, 1);
        expect(choice.rating).to.be.equal(1000);
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

        let choice = minimax.alphabetaOptimal(game, 3);
        expect(choice.rating).to.be.least(1000);
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

        let choice = minimax.alphabetaOptimal(game, 7);
        expect(choice.rating).to.be.least(1000);
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

        let choice = minimax.alphabetaOptimal(game, 7);
        expect(choice.rating).to.be.equal(70);
    });

    it('minimax is working properly when win by no possible move', function () {
        let game = kono();
        game.act({from: {x: 2, y: 0}, to: {x: 2, y: 2}});

        let choice = minimax.alphabetaOptimal(game, 7);
        expect(choice.action).to.be.eql({from: {x: 0, y: 2}, to: {x: 2, y: 2}});
        game.act(choice.action);

        game.act({from: {x: 3, y: 0}, to: {x: 3, y: 2}});
        choice = minimax.alphabetaOptimal(game, 7);
        expect(choice.action).to.be.eql({from: {x: 1, y: 2}, to: {x: 3, y: 2}});
    });

});
