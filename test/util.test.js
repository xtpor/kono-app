
const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../src/util');


describe('util', function () {
    it('util.quartiles() #1', function () {
        expect(util.quartiles([0, 1, 2, 3, 4])).to.be
            .eql([0, 1, 2, 3, 4]);
    });

    it('util.quartiles() #2', function () {
        expect(util.quartiles([0, 1, 2, 3, 4, 5, 6, 7, 8])).to.be
            .eql([0, 2, 4, 6, 8]);
    });

    it('util.quartiles() #3', function () {
        expect(util.quartiles([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).to.be
            .eql([0, 2, 5, 7, 10]);
    });

    function collectResults (probabilities, values, trials=1000) {
        return _(_.times(trials))
            .map(() => util.weightedRandom(probabilities, values))
            .countBy()
            .mapValues(i => i / trials)
            .value();
    }

    it('util.weightedRandom() #1', function () {
        let results = collectResults([0.3, 0.7], ['a', 'b']);
        expect(results.a).to.be.closeTo(0.3, 0.05);
        expect(results.b).to.be.closeTo(0.7, 0.05);
    });

    it('util.weightedRandom() #1', function () {
        let results = collectResults([0.2, 0.3, 0.5], ['a', 'b', 'c']);
        expect(results.a).to.be.closeTo(0.2, 0.05);
        expect(results.b).to.be.closeTo(0.3, 0.05);
        expect(results.c).to.be.closeTo(0.5, 0.05);
    });

});
