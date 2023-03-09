<template>
  <ClientsComponent :is-rating-page="false" :corner_id="route?.params?.corner_id"/>
</template>

<script setup>
import ClientsComponent from "components/Clients/ClientsComponent";
import { useRoute } from 'vue-router';


const route = useRoute();
console.log('route.params', route.params);


</script>
