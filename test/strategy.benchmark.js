
const expect = require('chai').expect;
const _ = require('lodash');
const kono = require('../src/kono');
const strategy = require('../src/strategy');

describe.skip('performance of alpha-beta prunning', function () {
    this.timeout(10000);

    it('benchmark #1', function () {
        let game = kono();
        let acceptance = 4500; // ms

        let start = _.now();
        return Promise.resolve()
        .then(() => {
            game.act({from: {x: 2, y: 0}, to: {x: 2, y: 2}});
            return strategy.alphabetaOptimal(game, 7);
        })
        .then(choice => {
            expect(choice.action).to.eql({from: {x: 0, y: 2}, to: {x: 2, y: 2}});
            game.act(choice.action);
            game.act({from: {x: 1, y: 0}, to: {x: 1, y: 2}});
            return strategy.alphabetaOptimal(game, 7);
        })
        .then(choice => {
            expect(choice.action).to.eql({from: {x: 3, y: 3}, to: {x: 3, y: 1}});
            let duration = _.now() - start;
            expect(duration).to.be.below(acceptance);
        });

    });

});
