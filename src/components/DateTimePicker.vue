<template>
  <div class="q-pa-none">
    <q-input :disable="waitingResponse" dense v-model="value" :label="label" :rules="[val => !!val || 'Введите дату и время']" :name="name">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            ref="qDateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="value"
              first-day-of-week="1"
              :mask="withoutTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'"
              @update:model-value="() => $refs.qDateProxy.hide()"
              @input="$emit('input', $event.target.value)"
              :locale="qDateLocale"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Закрыть" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:append v-if="!withoutTime">
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy
            ref="qTimeProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-time
              v-model="value"
              mask="YYYY-MM-DD HH:mm:ss"
              format24h
              @update:model-value="() => $refs.qTimeProxy.hide()"
              @input="$emit('input', $event.target.value)"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUtilsStore } from "stores/utils";


const props = defineProps([ "modelValue", "label", "withoutTime", "name" ]);
const emits = defineEmits([ "update:modelValue" ]);
const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emits("update:modelValue", newValue);
  }
});
</script>

<style scoped>

</style>
