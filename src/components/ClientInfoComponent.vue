<template>
  <div class="info-block">
    <div class="info-block__text">
      <q-card bordered class="my-card">
        <q-card-section class="bg-grey text-white my-card-section">
          <div class="text-h6"><h5 class="text-center">Информация о клиенте <span class="text-amber-4">{{ client.clientName }}</span></h5></div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <p v-for="item in clientInfo" :key="item.name"><span>{{ item[0] }}:</span> {{ item[1] }}</p>
        </q-card-section>
      </q-card>
    </div>


    <div class="info-block__tabs">
      <q-card bordered class="my-card bg-white">
        <q-card-section class="bg-grey my-card-section">
          <q-tabs
            v-model="tab"
            narrow-indicator
            dense
            align="justify"
            class="bg-grey text-white fit"
          >
            <q-tab :ripple="false" name="bills" icon="receipt" label="Счета" />
            <q-tab :ripple="false" name="goals" icon="emoji_flags" label="Цели" />
            <q-tab :ripple="false" name="change" icon="dangerous" label="Отхождение" />
          </q-tabs>
        </q-card-section>


        <q-card-section>

        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";


const tab = ref('bills');
const props = defineProps(['client']);
const client = computed(() => props.client);
console.log('client', client.value);
const clientInfo = computed(() => {
  return Object.entries(client.value).filter(([key, value]) => {
    return typeof value === 'string' || typeof value === 'number'
  })
})
console.log('clientInfo', clientInfo);
</script>

<style scoped>
.info-block {
  min-height: 30vh;
  display: flex;
}

.info-block > div {
  padding: 10px 15px;
  min-width: 300px;
}

.info-block__text {
  max-width: 400px;
  font-size: 24px;
}

.info-block__tabs {
  width: 100%;
}
</style>
