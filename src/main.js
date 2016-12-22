
/*jshint browser: true */
const assert = require('assert');
const Crafty = require('craftyjs');
const _ = require('lodash');

require('./androidev');
const kono = require('./kono');
const robot = require('./robot');
const res = require('./res');
const viewport = require('./viewport');
const layout = require('./layout');


const config = {
    designedRes: [720, 1280],
    searchDepth: 7,

    difficulty: 'easy',
    color: 'blue',
    sound: true,
};

function img (str) {
    return `assets/images/${str}`;
}

function shiftDifficulty () {
    let options = ['easy', 'normal', 'hard', 'impossible'];
    let next = options[(options.indexOf(config.difficulty) + 1) % options.length];
    config.difficulty = next;
    return next;
}

function shiftColor () {
    config.color = config.color === 'red' ? 'blue' : 'red';
    return config.color;
}

function shiftSound () {
    config.sound = !config.sound;
    return config.sound;
}

Crafty.c('RotatingGradient', {
    required: '2D, Canvas',
    init () {
        this._rot = 0;
        this._rotSpeed = Crafty.math.degToRad(60);
        this._hue = 0;
        this._hueOffset = 90;
        this._hueSpeed = 30;
        this._saturation = 40;
        this._lightness = 45;

        /* canvas rendering protocal */
        this.ready = true;
        this.bind('Draw', this._render);
    },
    _gradient (ctx) {
        function rotate ([x, y], k) {
            return [x*Math.cos(k) + y*Math.sin(k), y*Math.cos(k) - x*Math.sin(k)];
        }

        let basePoint = [this.x - this.w/2, this.y - this.h/2];
        let args = [...rotate(basePoint, this._rot),
                    ...rotate(basePoint, this._rot + Math.PI)];
        let firstStop = `hsl(${this._hue}, ${this._saturation}%, ${this._lightness}%)`;
        let finalStop = `hsl(${this._hue + this._hueOffset}, ${this._saturation}%, ${this._lightness}%)`;

        let gradient = ctx.createLinearGradient(...args);
        gradient.addColorStop(0, firstStop);
        gradient.addColorStop(1, finalStop);

        return gradient;
    },
    _render ({ctx, pos, co}) {
        ctx.save();
        ctx.translate(this.x + this.w/2, this.y + this.h/2);

        ctx.fillStyle = this._gradient(ctx);
        ctx.fillRect(this.x - this.w/2, this.y - this.h/2, this.w, this.h);
        ctx.restore();
    },
    events: {
        EnterFrame ({frame, dt}) {
            this._rot += (dt / 1000) * this._rotSpeed;
            this._hue += (dt / 1000) * this._hueSpeed;
            this.trigger('Invalidate');
        },
        Change () {
            this.trigger('Invalidate');
        }
    }
});

function main () {
    Crafty.init(window.innerWidth, window.innerHeight, 'stage');
    Crafty.background('black');

    viewport.scaling(config.designedRes);

    Crafty.e('2D, Canvas, RotatingGradient, Persist')
        .attr({x: 0, y: 0, w: config.designedRes[0], h: config.designedRes[1]});

    function renderTiles (game, tileTypeFn) {
        const blankingDuration = 500; // ms
        let tiles = {};

        kono.mapPoints(point => {
            let tile = game.at(point);
            let entity = Crafty.e('2D, DOM, Image, Mouse, Delay, Tile')
                .attr(layout.tile(point.x, point.y))
                .attr({point: point})
                .image(img(`tile/${tile}.png`));
            tiles[`${point.x},${point.y}`] = entity;

            let type = tileTypeFn(point, entity);

            if (type === 'emphasized') {
                entity.requires('Emphasized')
                    .image(img(`tile/${tile}Em.png`));
            } else if (type === 'flashing') {
                let state = true;
                entity.requires('Flashing')
                    .delay(function () {
                        state = !state;
                        if (state) {
                            entity.image(img(`tile/${tile}.png`));
                        } else {
                            entity.image(img(`tile/${tile}Em.png`));
                        }
                    }, blankingDuration, -1);
            } else {
                entity.requires('Normal');
            }
        });

        return tiles;
    }

    function clearMessages () {
        Crafty('Message').each(function () {
            this.destroy();
        });
    }

    function displayMessage (str, attr, duration=2000) {
        let ent = Crafty.e('2D, DOM, Text, Tween, Delay, Message')
            .attr({x: 0, y: 900, w: 720, h: 60})
            .attr(attr)
            .css('text-align', 'center')
            .textColor('white')
            .text(str)
            .textFont({size: '50px', family: 'HankenLight'});

        if (duration > 0) {
            ent
            .tween({alpha: 0.0}, duration, "easeOutQuad")
            .delay(function () {
                this.destroy();
            }, duration);
        }
    }

    function gameStatus (str) {
        displayMessage(str, {y: 200}, 0);
    }

    function gameInfo (str) {
        displayMessage(str, {y: 1050}, 0);
    }

    function backButtonExit () {
        Crafty.e('2D, MobileBackButton, Delay')
            .bind('BackButton', function () {
                if (this.pressed) {
                    Crafty.scene('menu');
                } else {
                    const promptDuration = 1500;
                    this.pressed = true;
                    displayMessage('press again to exit', {y: 1050}, promptDuration);
                    this.delay(function () {
                        this.pressed = false;
                    }, promptDuration);
                }
            });
    }

    function moveTile (game, tiles, action, completeCb) {
        let duration = 750;
        let delta = 50;
        let {from: {x: fx, y: fy}, to: {x: tx, y: ty}} = action;
        let target = layout.tile(tx, ty);

        Crafty('Tile').each(function () {
            this.unbind('MouseUp');
        });

        tiles[`${fx},${fy}`].image(img('tile/empty.png'));
        Crafty.e('2D, DOM, Image, Tween')
            .attr(layout.tile(fx, fy))
            .image(img(`tile/${game.at(action.from)}Em.png`))
            .tween({x: target.x, y: target.y}, duration, 'smoothStep');
        // ensure the animation is completed
        setTimeout(completeCb, duration + delta);
    }

    function renderBars (game) {
        let bars = {horizontal: {}, vertical: {}};

        _.times(4, i => {
            _.times(3, j => {
                let up = game.at({x: i, y: j});
                let down = game.at({x: i, y: j+1});

                bars.vertical[`${i},${j}`] = Crafty.e('2D, DOM, Image, Bar')
                    .attr(layout.verti(i, j))
                    .image(img(`vertical/${up}-${down}.png`));
            });
        });
        _.times(3, i => {
            _.times(4, j => {
                let left = game.at({x: i, y: j});
                let right = game.at({x: i+1, y: j});

                bars.horizontal[`${i},${j}`] = Crafty.e('2D, DOM, Image, Bar')
                    .attr(layout.horiz(i, j))
                    .image(img(`horizontal/${left}-${right}.png`));
            });
        });

        return bars;
    }

    function fromPoint (actions, point) {
        return _.some(actions, ({from, to}) => {
            return _.isEqual(from, point);
        });
    }

    Crafty.scene('pickFirstTile', function ({game, lastMoved}) {
        let actions = game.listActions();

        gameStatus('YOUR TURN');

        renderTiles(game, (point, entity) => {
            if (_.isEqual(point, lastMoved)) {
                return 'emphasized';
            } else if (fromPoint(actions, point)) {
                entity.bind('MouseUp', function () {
                    Crafty.audio.play('select');
                    Crafty.scene('pickSecondTile', {game, lastMoved, selected: point});
                });
                return 'flashing';
            } else {
                return 'normal';
            }
        });
        renderBars(game);
        backButtonExit();
    });

    Crafty.scene('pickSecondTile', function ({game, lastMoved, selected}) {
        let actions = game.listActions();
        function toPoint (point) {
            return _.some(actions, ({from, to}) => {
                return _.isEqual(from, selected) && _.isEqual(to, point);
            });
        }

        gameStatus('YOUR TURN');

        let tiles = renderTiles(game, (point, entity) => {
            if (toPoint(point)) {
                entity.bind('MouseUp', function () {
                    Crafty.audio.play('select');
                    moveTile(game, tiles, {from: selected, to: point}, () => {
                        Crafty.audio.play('action');
                        game.act({from: selected, to: point});
                        if (game.result) {
                            Crafty.scene('gameover', {game, lastMoved: point});
                        } else {
                            Crafty.scene('robotAction', {game, lastMoved: point});
                        }
                    });
                });
                return 'flashing';
            } else {
                if (fromPoint(actions, point)) {
                    entity.bind('MouseUp', function () {
                        Crafty.audio.play('select');
                        Crafty.scene('pickSecondTile', {game, lastMoved, selected: point});
                    });
                } else {
                    entity.bind('MouseUp', function () {
                        Crafty.audio.play('select');
                        Crafty.scene('pickFirstTile', {game, lastMoved});
                    });
                }

                if (_.isEqual(point, selected) || _.isEqual(point, lastMoved)) {
                    return 'emphasized';
                } else {
                    return 'selected';
                }
            }
        });
        renderBars(game);
        backButtonExit();
    });

    Crafty.scene('robotAction', function ({game, lastMoved}) {
        let optimalFn = robot[`${config.difficulty}Mode`];
        let tiles = renderTiles(game, (point) => {
            if (_.isEqual(point, lastMoved)) {
                return 'emphasized';
            } else {
                return 'normal';
            }
        });
        renderBars(game);

        gameStatus("COMPUTER' TURN");

        optimalFn(game, config.searchDepth).then(choice => {
            let lastMoved = choice.action.to;
            moveTile(game, tiles, choice.action, () => {
                Crafty.audio.play('action');
                game.act(choice.action);
                if (game.result) {
                    Crafty.scene('gameover', {game, lastMoved});
                } else {
                    Crafty.scene('pickFirstTile', {game, lastMoved});
                }
            });
        });
    });

    Crafty.scene('gameover', function ({game, lastMoved}) {
        renderBars(game);
        renderTiles(game, (point, entity) => {
            if (_.isEqual(point, lastMoved)) {
                return 'emphasized';
            } else {
                return 'normal';
            }
        });

        if (game.result === config.color) {
            Crafty.audio.play('win');
            gameStatus('YOU WIN');
        } else {
            Crafty.audio.play('lose');
            gameStatus('YOU LOSE');
        }
        gameInfo('TAP TO RESTART');

        Crafty.e('2D, Mouse')
            .attr({x: 0, y: 0, w: 720, h: 1280})
            .bind('MouseUp', function () {
                Crafty.scene('menu');
            });
    });

    Crafty.scene('menu', function () {
        function message (str) {
            displayMessage(str, {y: 900});
        }

        Crafty.e('2D, DOM, Text')
            .attr({x: 0, y: 290, w: config.designedRes[0], h: 60})
            .css('text-align', 'center')
            .textColor('white')
            .text('KONO')
            .textFont({size: '125px', family: 'HankenLight'});

        Crafty.e('2D, DOM, Image, Mouse')
            .attr(layout.playButton)
            .image(img('icon/play.png'))
            .bind('MouseUp', function () {
                Crafty.audio.play('play');
                if (config.color === 'blue') {
                    Crafty.scene('pickFirstTile', {game: kono()});
                } else {
                    Crafty.scene('robotAction', {game: kono()});
                }
            });

        Crafty.e('2D, DOM, Image, Mouse')
            .attr(layout.difficultyButton)
            .image(img(`icon/difficulty/${config.difficulty}.png`))
            .bind('MouseUp', function () {
                shiftDifficulty();
                clearMessages();
                message(`${config.difficulty} difficulty`);
                this.image(img(`icon/difficulty/${config.difficulty}.png`));
                Crafty.audio.play('option');
            });

        Crafty.e('2D, DOM, Image, Mouse')
            .attr(layout.colorButton)
            .image(img(`icon/color/${config.color}.png`))
            .bind('MouseUp', function () {
                shiftColor();
                clearMessages();
                message(`picked ${config.color}`);
                this.image(img(`icon/color/${config.color}.png`));
                Crafty.audio.play('option');
            });

        Crafty.e('2D, DOM, Image, Mouse')
            .attr(layout.soundButton)
            .image(img(`icon/sound/${config.sound}.png`))
            .bind('MouseUp', function () {
                shiftSound();
                clearMessages();
                message(`${config.sound ? 'enable' : 'disable'} sound`);
                this.image(img(`icon/sound/${config.sound}.png`));
                Crafty.audio.toggleMute();
                Crafty.audio.play('option');
            });

        Crafty.e('2D, DOM, Image, Mouse')
            .attr(layout.tutorialButton)
            .image(img(`icon/tutorial.png`))
            .bind('MouseUp', function () {
                clearMessages();
                message('tutorial (unimplemented)');
                Crafty.audio.play('option');
            });

    });

    Crafty.scene('menu');
    window.Crafty = Crafty;
}

module.exports = () => {
    Crafty.load(res, main);
};
