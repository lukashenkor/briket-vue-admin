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
        <q-tab v-for="item in Object.values(items).filter(i => !i.role || userRoles.includes(i.role))" :key="item.name" :name="item.name" :icon="item.icon" :label="item.label">
          <q-badge color="blue-7" text-color="white" floating v-if="item?.count || item?.data?.length">{{ item?.count || item?.data?.length }}</q-badge>
        </q-tab>
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
          :date-display-format="item?.dateDisplayFormat"
          :parentName="parentName"
        />
      </div>
      <div v-intersection="onIntersection" />
      <FetchSpinnerComponent :fetching="fetching"/>
    </q-card-section>
    <slot></slot>
  </q-card>
</template>

<script setup>
import ListComponent from "components/ListComponent";
import { computed } from "vue";
import { useUserStore } from "stores/user";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";

const props = defineProps({
  modelValue: {
    type: String,
  },
  items: {
    type: Object,
  },
  fetching: {
    type: Boolean,
    default: false,
  },
  parentName: {
    type: String,
    default: "",
  }
});




// const tabValue = computed(() => props.tab);

// const props = defineProps(['tab', 'items']);


// const tab = computed(() => props.tab);
// const items = computed(() => props.items);

const userStore = useUserStore();
const userRoles = computed(() => userStore.data.roles);

const emits = defineEmits([
  "listItemClick",
  "update:modelValue",
  "editItemClick",
  "deleteItemClick",
  "addItemClick",
  "intersection"
]);

const onIntersection = {
  handler(entry) {
    emits('intersection', entry);
  },
  cfg: {
    threshold: 0,
  }
}

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
