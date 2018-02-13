<template>
    <div class="row h-100 w-100 m-0 " >
        <div class="col-1 controls m-0 p-0" >
            <div class="logo w-100 ">
                <img src="img/logo.png" />
            </div>
            <hr style="display: block; border-top: 2px solid #f26c15; width: 60%; margin-top: 20px;" />
            <ul class="mt-4 p-0 text-left">
                <li  @click="toPage('home')" :class="{ active: page == 'home' }">
                    <a href="#"><i class="fa fa-map"></i>Home</a>
                </li>
                <li @click="toPage('buildings')" :class="{ active: page == 'buildings' }">
                    <a href="#" ><i class="fa fa-building"></i>Buildings</a>
                </li>
                <li class="">
                    <a href="#"><i class="fa fa-university"></i>Schools</a>
                </li>
                <li class="">
                    <a href="#"><i class="fa fa-wifi"></i>Wifi Zones</a>
                </li>
                <li class="">
                    <a href="#"><i class="fa fa-th-large"></i>Gates</a>
                </li>
                <li class="">
                    <a href="#"><i class="fa fa-arrow-circle-o-up"></i>Tour</a>
                </li>
            </ul>
        </div>

        <div class="col-3 p-0 m-0 list">
            <input type="text" class="w-100 form-control search" placeholder="Type to filter..."/>
            <div class="items">
                <div v-if="buildings" class="container-fluid">
                    <template v-for="building in buildings">
                        <div @click="locateBuilding(building.id)" class="row p-2 item">
                            <div class="col-12 p-0 m-0"> 
                                <template v-if="building.image">
                                    <img class="img-fluid float-left mr-2 mb-3" :src="building.image">
                                </template>
                                <template v-else>
                                    <img class="img-fluid float-left mr-2 mb-3" src="img/placeholder.png">
                                </template>
                                <p class="d-inline">
                                    {{ building.name }} 
                                    {{ building.abrv ? `(${building.abrv})` : '' }}
                                </p>
                                <!--button @click="locate(building.id)" class="btn btn-primary float-right btn-locate"><i class="fa fa-map-marker"></i></button-->
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="col-11 p-0 m-0 map-container">
            <div class="container-fluid p-0 m-0">
                <div id="search" class="input-group">
                    <input v-model="searchText" list="locations" type="text" placeholder="Type to search..." class="form-control search-input" >
                    <datalist id="locations">
                        <template v-for="item in searchItems">
                            <option :value="item"></option>
                        </template>
                    </datalist>
                    <div class="input-group-append">
                        <button class="btn btn-search" type="button"><i class="fa fa-search"></i></button>
                    </div>
                </div>
                <div class="row w-100 p-0 m-0 position-fixed">
                    <mapbox 
                        :map="map" 
                        :activeMarker="activeMarker"
                        :activeBoundary="activeBoundary"
                        :center="center"
                        :zoom="zoom"
                        :perimeterBoundary="perimeterBoundary"></mapbox>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

const API_VERSION   = 'api/v1';
const API_HOST      = 'http://zunguka-api.herokuapp.com';
const MAP_CONTAINER = 'map';
const MAP_STYLE     = 'mapbox://styles/mapbox/streets-v9';
const ACCESS_TOKEN  = 'pk.eyJ1IjoiZ2l0YXVtb3NlczQiLCJhIjoiY2pjOWdhODg4MG9kYzJ3bzR0eHE0ZXVodyJ9.zU1cfiq9SWoVsTaPdoFnBQ';
const UNCOLLAPSED_CENTER = [37.0195, -1.0902];
const COLLAPSED_CENTER  = [37.0104, -1.0902];
const MAX_SEARCH_RESULTS = 5;
const ONLOAD_ZOOM = 11;
const ONFOCUS_ZOOM = 18;

export default {
    data() {
        return {
            url: `${API_HOST}/${API_VERSION}`,
            schools: {},
            buildings: {},
            mapStyle: MAP_STYLE,
            accessToken: ACCESS_TOKEN,
            mapContainer: MAP_CONTAINER,
            center: COLLAPSED_CENTER,
            onLoadZoom: ONLOAD_ZOOM,
            onFocusZoom: ONFOCUS_ZOOM,
            map: {},
            searchText: '',
            searchItems: {},
            perimeterBoundary: {},
            activeBoundary: {},
            activeMarker: {},
            zoom: 14,
            page: 'home',
        }
    },
    watch: {
        searchText: function () {
            const vm = this;
            if (vm.searchText.trim() == '') 
                vm.searchItems = [];
            else
                vm.buildSearchItems();
        },
    },
    methods: {
        toPage(page) {
            const vm = this;
            if (page == vm.page) 
                return;
            vm.page = page;
            switch (page) {
                case 'home':
                    $('.list').fadeOut('slow', function () {
                        $('.map-container').toggleClass('col-11 col-7');
                        setTimeout(function () {
                            vm.center = COLLAPSED_CENTER;
                        }, 500);
                    });
                    break;
                case 'buildings': 
                    $('.map-container').toggleClass('col-7 col-11');
                    $('.list').fadeIn('slow', function () {
                        //vm.map.resize(); 
                        vm.center = UNCOLLAPSED_CENTER;
                    });
                    break;
                default:
                    break;
            }
        },
        buildSearchItems: _.debounce(function() {
           const vm = this;
           let items = [];
           let search = _.lowerCase(vm.searchText.trim());

           for (let i = 0; i < vm.schools.length; ++i) {
               let school = vm.schools[i];
               if (school && school.name) {
                   let name = _.lowerCase(school.name);
                   if (name.indexOf(search) != -1) {
                       items.push(school.name);
                   }
               }
           }

           for (let i = 0; i < vm.buildings.length; ++i) {
               let building = vm.buildings[i].features;
               if (building && building.name) {
                   let name = _.lowerCase(building.name);
                   if (name.indexOf(search) != -1) {
                       items.push(building.name);
                   }
               }
           }

           vm.searchItems = _.take(items.sort(), MAX_SEARCH_RESULTS);
        }, 500),
        multiPolygonCenter(multiPoly) {
            if (! multiPoly || ! multiPoly.length) 
                return [0, 0];

            const vm = this;
            let lat = 0;
            let lng = 0;
            let latLng = null;
            for (let poly of multiPoly) {
                latLng = vm.polygonCenter(poly); 
                if (! _.isNaN(latLng)) {
                    lat += latLng[0];
                    lng += latLng[1];
                }
            }
            return [lat/multiPoly.length, lng/multiPoly.length];
        },
        polygonCenter(poly) {
            console.log(poly);
            if (! poly || ! poly.length) 
                return NaN;

            let lng = 0; 
            let lat = 0;
            for (let coord of poly) {
                lat += coord[0]; 
                lng += coord[1]; 
            }

            return [lat/poly.length, lng/poly.length];
        },
        locateBuilding(id) {
            const vm = this;
            const building = vm.buildings.find(b => b.id == id);
            if (building) {
                vm.activeBoundary = building.geom;
                vm.activeMarker = building.center;
                vm.center = building.center;
                vm.zoom = vm.onFocusZoom;
            }
        },
    },
    mounted() {
        const vm = this;
        mapboxgl.accessToken = vm.accessToken;
        vm.map = new mapboxgl.Map({
            container: vm.mapContainer,
            style: vm.mapStyle,
            center: vm.center,
            zoom: vm.onLoadZoom,
        });
        axios.get(`${vm.url}/boundary/?format=json`).then((res)=> {
            vm.perimeterBoundary = res.data[0].geom;
        }).catch((err)=> {
            console.log(err);
        });
        axios.get(`${vm.url}/buildings/?format=json`).then((res) => {
            vm.buildings = res.data; 
            for (let i = 0; i < vm.buildings.length; ++i)
                vm.buildings[i].center = vm.multiPolygonCenter(vm.buildings[i].geom.coordinates);
        }).catch((err) => {
            console.log(err);
        });
        axios.get(`${vm.url}/schools/?format=json`).then((res) => {
            vm.schools = res.data; 
        }).catch((err) => {
            console.log(err);
        });
    },
    components: {
        mapbox: require('./Map.vue'),
    }
}
</script>

<style scoped>
    #search {
        position: absolute;
        top: 4%;
        z-index: 2;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    }
    .col-11 #search {
        left: 30%;
        width: 40%;
    }
    .col-7 #search {
        left: 20%;
        width: 60%;
    }
    .search-input {
        font-size: 15px;
        border-radius: 0px;
    }
    .btn-search {
        border-radius: 0px;
        background-color: orange;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    }
    .btn-locate {
        background-color: orange;
        color: black;
        border: 1px solid orange;
        font-size: 18px;
        margin-bottom: 5px;
    }
</style>

