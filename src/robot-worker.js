
const minimax = require('./minimax');
const kono = require('./kono');


module.exports = function (self) {
    self.addEventListener('message', ev => {
        let {game, player, depth, rid} = ev.data;
        game = kono(game);

        let rating = minimax.alphabeta(game, player, depth, -Infinity, Infinity);
        self.postMessage({rid, rating});
    });
};
