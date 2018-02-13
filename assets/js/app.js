require('./bootstrap');
window.Vue = require('vue');
window.mapboxgl = require('mapbox-gl');

Vue.component('app', require('./components/App.vue'));
const vueApp = new Vue({
    el: '#app',
});

