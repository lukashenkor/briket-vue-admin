<template>
  <router-view />
</template>

<script>
import axios from "axios";


const accessToken = JSON.parse(localStorage.getItem('access_token'));
axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
import { defineComponent } from 'vue'


export default defineComponent({
  name: 'App'
})
</script>
