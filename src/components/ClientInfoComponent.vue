<template>
  <div class="info-block">
    <h4>Информация о клиенте {{ client.clientName }}</h4>
    <hr>
    <div class="info-block__text">
      <p><span>Номер телефона:</span> {{ client.phoneNumber }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";


const props = defineProps(['client']);
const client = computed(() => props.client);
</script>

<style scoped>
.info-block {
  min-height: 30vh;
  border: 1px solid #000000;
  border-radius: 4px;
  width: 45%;
}

.info-block > h4 {
  text-align: center;
}

.info-block__text {
  font-size: 24px;
  padding: 10px 15px;
}
</style>
