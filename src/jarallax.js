import domReady from 'lite-ready';
import { window, jQuery } from 'global';

import jarallax from './jarallax.esm';

// no conflict
const oldPlugin = window.jarallax;
window.jarallax = jarallax;
window.jarallax.noConflict = function() {
    window.jarallax = oldPlugin;
    return this;
};

// jQuery support
if ( 'undefined' !== typeof jQuery ) {
    const jQueryPlugin = function( ...args ) {
        Array.prototype.unshift.call( args, this );
        const res = jarallax.apply( window, args );
        return 'object' !== typeof res ? res : this;
    };
    jQueryPlugin.constructor = jarallax.constructor;

    // no conflict
    const oldJqPlugin = jQuery.fn.jarallax;
    jQuery.fn.jarallax = jQueryPlugin;
    jQuery.fn.jarallax.noConflict = function() {
        jQuery.fn.jarallax = oldJqPlugin;
        return this;
    };
}

// data-jarallax initialization
domReady( () => {
    jarallax( document.querySelectorAll( '[data-jarallax]' ) );
} );
