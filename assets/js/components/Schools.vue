<template>
<div class="col-3 p-0 m-0 list schools">
    <input v-model="filterText" type="text" class="w-100 form-control search" placeholder="Type to filter..."/>
    <div class="items">
        <div v-if="schools" class="container-fluid">
            <template v-for="school in filteredSchools">
                <div @click="locate(school.id)" class="row p-2 item" :class="{ active: school.id === activeSchoolID }">
                    <div class="col-12 p-0 m-0"> 
                        <template v-if="school.image">
                            <img class="img-fluid float-left mr-2 mb-1" :src="school.image">
                        </template>
                        <template v-else>
                            <img class="img-fluid float-left mr-2 mb-1" src="img/placeholder.png">
                        </template>
                        <p class="d-inline">
                            {{ school.name }} 
                            {{ school.abrv ? `(${school.abrv})` : '' }}
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
    props: ['schools', 'activeSchoolID'],
    data() {
        return {
            filterText: '',
            filteredSchools: {},
        }
    },
    watch: {
        filterText: function () {
            this.filter();
        },
        schools: function() {
            const vm = this;
            vm.filteredSchools = vm.schools;
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
                vm.filteredSchools = vm.schools;
                return;
            }

            vm.filteredSchools = vm.schools.filter(s => {
                return  _.lowerCase(s.name).indexOf(searchText) !== -1;
            });
        }
    },
}
</script>
