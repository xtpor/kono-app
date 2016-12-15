
const _ = require('lodash');


exports.quartiles = function (sortedArray) {
    let range = sortedArray.length - 1;
    return _.times(5, i => sortedArray[~~(range * i/4)]);
};

exports.weightedRandom = function (probabilities, values) {
    function pick (p, probs, vals) {
        if (_.isEmpty(probs)) {
            return _.head(vals);
        } else if (p <= _.head(probs)) {
            return _.head(vals);
        } else {
            return pick(p - _.head(probs), _.tail(probs), _.tail(vals));
        }
    }
    return pick(Math.random(), probabilities, values);
};
