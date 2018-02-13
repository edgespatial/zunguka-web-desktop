
window._ = require('lodash');

window.Popper = require('popper.js/dist/umd/popper');
try {
    window.$ = window.jQuery = require('jquery/dist/jquery.min');

    /* scroll within div like $('#scrollabe_div').scrollTo('#div') */
    window.$.fn.scrollTo = function (elem, speed) { 
        
        try { $(this).animate({ 
                scrollTop: $(this).scrollTop() 
                            - $(this).offset().top 
                            + $(elem).offset().top  
        }, speed == undefined ? 1000 : speed); return this; } catch (e) {}  };

    require('bootstrap');
} catch (e) {}

window.axios = require('axios');
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

