
/* Android releated event */
const Crafty = require('craftyjs');

Crafty.c('MobileBackButton', {
    init () {
        this._handler = () => this.trigger('BackButton');
        document.addEventListener('backbutton', this._handler, false);
    },
    events: {
        Remove () {
            document.removeEventListener('backbutton', this._handler, false);
        }
    }
});
