<template>
    <div class="col-3 p-0 m-0 list buildings">
        <input v-model="filterText" type="text" class="w-100 form-control search" placeholder="Type to filter..."/>
        <div class="items">
            <div v-if="buildings" class="container-fluid">
                <template v-for="building in filteredBuildings">
                    <div @click="locate(building.id)" class="row p-2 item" :class="{ active: building.id === activeBuildingID }">
                        <div class="col-12 p-0 m-0"> 
                            <template v-if="building.image">
                                <img class="img-fluid float-left mr-2 mb-1" :src="building.image">
                            </template>
                            <template v-else>
                                <img class="img-fluid float-left mr-2 mb-1" src="img/placeholder.png">
                            </template>
                            <p class="d-inline">
                                {{ building.name }} 
                                {{ building.abrv ? `(${building.abrv})` : '' }}
                            </p>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['buildings', 'activeBuildingID'],
    data() {
        return {
            filterText: '',
            filteredBuildings: {},
        }
    },
    watch: {
        filterText: function () {
            this.filter();
        },
        buildings: function() {
            const vm = this;
            vm.filteredBuildings = vm.buildings;
            vm.filter(); 
        },
    },
    methods: {
        locate(id) {
            this.$emit('locate', id);
        },
        filter() {
            const vm = this;
            let searchText = _.lowerCase(vm.filterText.trim());
            
            if (searchText === '') {
                vm.filteredBuildings = vm.buildings;
                return;
            }

            vm.filteredBuildings = vm.buildings.filter(b => {
                return  _.lowerCase(b.name).indexOf(searchText) !== -1;
            });
        }
    },
}
</script>
