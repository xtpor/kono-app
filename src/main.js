
/*jshint browser: true */
const assert = require('assert');
const Crafty = require('craftyjs');
const _ = require('lodash');
const viewport = require('./viewport');
const layout = require('./layout');


const config = {
    designedRes: [720, 1280],
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

module.exports = () => {
    Crafty.init(window.innerWidth, window.innerHeight, 'stage');
    Crafty.background('black');

    viewport.scaling(config.designedRes);

    Crafty.e('2D, Canvas, RotatingGradient, Persist')
        .attr({x: 0, y: 0, w: config.designedRes[0], h: config.designedRes[1]});


    Crafty.scene('game', function () {
        _.times(4, i => {
            _.times(4, j => {
                if (j < 3) {
                    Crafty.e('2D, DOM, Image')
                        .attr(layout.tile(i, j))
                        .image('assets/images/tile/empty.png');
                } else {
                    Crafty.e('2D, DOM, Image')
                        .attr(layout.tile(i, j))
                        .image('assets/images/tile/empty.png');
                }
            });
        });

        _.times(3, i => {
            _.times(4, j => {
                Crafty.e('2D, DOM, Image')
                    .attr(layout.horiz(i, j))
                    .image('assets/images/horizontal/empty-empty.png');
            });
        });

        _.times(4, i => {
            _.times(3, j => {
                Crafty.e('2D, DOM, Image')
                    .attr(layout.verti(i, j))
                    .image('assets/images/vertical/empty-empty.png');
            });
        });
    });

    Crafty.scene('menu', function () {
        function message (str) {
            const duration = 1500;
            Crafty.e('2D, DOM, Text, Tween, Delay')
                .attr({x: 0, y: 900, w: 720, h: 60})
                .css('text-align', 'center')
                .textColor('white')
                .text(str)
                .textFont({size: '50px', family: 'HankenLight'})
                .tween({alpha: 0.0}, duration, "easeOutQuad")
                .delay(function () {
                    this.destroy();
                }, duration);
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
                Crafty.scene('game');
            });

        Crafty.e('2D, DOM, Image, Mouse')
            .attr(layout.difficultyButton)
            .image(img(`icon/difficulty/${config.difficulty}.png`))
            .bind('MouseUp', function () {
                shiftDifficulty();
                message(`${config.difficulty} difficulty`);
                this.image(img(`icon/difficulty/${config.difficulty}.png`));
            });

        Crafty.e('2D, DOM, Image, Mouse')
            .attr(layout.colorButton)
            .image(img(`icon/color/${config.color}.png`))
            .bind('MouseUp', function () {
                shiftColor();
                message(`picked ${config.color}`);
                this.image(img(`icon/color/${config.color}.png`));
            });

        Crafty.e('2D, DOM, Image, Mouse')
            .attr(layout.soundButton)
            .image(img(`icon/sound/${config.sound}.png`))
            .bind('MouseUp', function () {
                shiftSound();
                message(`${config.sound ? 'enable' : 'disable'} sound`);
                this.image(img(`icon/sound/${config.sound}.png`));
            });

        Crafty.e('2D, DOM, Image, Mouse')
            .attr(layout.tutorialButton)
            .image(img(`icon/tutorial.png`))
            .bind('MouseUp', function () {
                message('tutorial (unimplemented)');
            });

    });

    Crafty.scene('menu');
    window.Crafty = Crafty;

};
