
/*jshint browser: true */
const Crafty = require('craftyjs');
const _ = require('lodash');


function int (val) {
    return ~~Number(val);
}

function findScalingRatio (windowRes, designedRes) {
    let horizScale = windowRes[0] / designedRes[0];
    let vertiScale = windowRes[1] / designedRes[1];

    let scaledWidth = designedRes[0] * vertiScale;
    let scaledHeight = designedRes[1] * horizScale;

    if (scaledWidth <= windowRes[0]) {
        return vertiScale;
    } else if (scaledHeight <= windowRes[1]) {
        return horizScale;
    } else {
        assert(false);
    }
}

function scaleWithDesignedRes (designedRes, windowResized=false) {
    let windowRes = [window.innerWidth, window.innerHeight];
    let ratio = findScalingRatio(windowRes, designedRes);
    if (windowResized) {
        Crafty.viewport.width = designedRes[0] * ratio;
        Crafty.viewport.height = designedRes[1] * ratio;
        Crafty.viewport.reload();
    }
    Crafty.viewport.scale(ratio);
}

exports.scaling = function (designedRes) {
    window.addEventListener('resize', () => {
        scaleWithDesignedRes(designedRes, true);
    });
    Crafty.bind('SceneChange', () => {
        scaleWithDesignedRes(designedRes);
    });
    Crafty.canvasLayer.init();
    scaleWithDesignedRes(designedRes, true);
    _.defer(() => Crafty.trigger('InvalidateViewport'));
};
