<template>
  <q-card bordered class="my-card bg-white">
    <q-card-section class="bg-grey my-card-section">
      <q-tabs
        v-model="tab"
        narrow-indicator
        dense
        align="justify"
        class="bg-grey text-white fit"
        @update:model-value="(value) => { emits('update:modelValue', value) }"
      >
        <q-tab v-for="item in items" :key="item.name" :name="item.name" :icon="item.icon" :label="item.label">
          <q-badge color="blue-7" text-color="white" floating v-if="item?.data?.length">{{ item?.data?.length }}</q-badge>
        </q-tab>
<!--        <q-tab :ripple="false" name="closed" icon="checklist" label="Выполненные" />-->
      </q-tabs>
    </q-card-section>


    <q-card-section>
      <q-btn
        class="q-my-md"
        label="Добавить"
        color="positive"
        @click="() => emits('addItemClick')"
        v-show="items[tab].addable"
      />
      <q-separator/>
      <div v-for="item in items" :key="item?.name" class="cursor-move" :class="item?.name" v-show="tab && tab === item?.name">
        <ListComponent
          :items="item?.data"
          v-if="item?.data?.length"
          :lines="item.lines"
          :editable="item.editable"
          :deletable="item.deletable"
          @listItemClick="(value) => emits('listItemClick', value)"
          @editItemClick="(value) => emits('editItemClick', value)"
          @deleteItemClick="(value) => emits('deleteItemClick', value)"
        />
      </div>
    </q-card-section>
    <slot></slot>
  </q-card>
</template>

<script setup>
import ListComponent from "components/ListComponent";
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
  },
  items: {
    type: Object,
  }
});

// const tabValue = computed(() => props.tab);

// const props = defineProps(['tab', 'items']);


// const tab = computed(() => props.tab);
// const items = computed(() => props.items);

const emits = defineEmits([
  "listItemClick",
  "update:modelValue",
  "editItemClick",
  "deleteItemClick",
  "addItemClick"
]);

const tab = computed({
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

<!--
[
{name: "new", items: []},
{name: "closed", items: []},
]
-->
