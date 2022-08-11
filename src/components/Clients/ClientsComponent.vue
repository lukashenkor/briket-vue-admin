<template>
  <div class="clients">
    <FetchSpinnerComponent :fetching="fetching"/>
    <q-slide-transition :duration="1000">
      <div v-show="!selectedClient.length" v-if="!fetching">
        <q-table
          title="Список клиентов"
          :columns="columns"
          :rows="rows.clients"
          row-key="label"
          no-data-label="Список клиентов пуст"
          :rows-per-page-options="[10, 20, 0]"
          v-model:selected="selectedClient"
          @row-click="selectClient"
          :selected-rows-label="(_ => selectedRowLabel)"
          :pagination="{sortBy: 'id'}"
        >
          <template v-slot:top-right>
            <q-btn
              label="Добавить"
              color="positive"
              @click="dialog = true"
              v-if="userRoles.includes('corners-create')"
            />
          </template>
        </q-table>
      </div>

    </q-slide-transition>
    <q-slide-transition :duration="800">
      <div class="client-info" v-show="selectedClient.length" v-if="selectedClient.length">
        <ClientInfoComponent v-model="selectedClient[0]" @goBackClick="selectedClient = []" @onClientDelete="onClientDelete"/>
      </div>
    </q-slide-transition>
    <DraggableDialog v-model="dialog" title="Добавление клиента">

    </DraggableDialog>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
import ClientInfoComponent from 'components/Clients/ClientInfoComponent'
import FetchSpinnerComponent from 'components/FetchSpinnerComponent'
import { apiRoutes, requestJson } from "src/api";
import DraggableDialog from "components/DraggableDialog";
import { useUserStore } from "stores/user";


const userStore = useUserStore();
const userRoles = computed(() => userStore.data.roles);
const props = defineProps([ "isRatingPage" ]);
const fetching = ref(false);
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'label', label: 'Имя клиента', field: 'label', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'area', label: 'Area', field: 'area', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'power', label: 'Power', field: 'power', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'number', label: 'Number', field: 'number', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'rating', label: 'Рейтинг', field: 'rating', sortable: true, align: "left", editable: true, readonly: false, },
];

const rows = reactive({});
const dialog = ref(false);

onBeforeMount(async () => {
  fetching.value = true;
  try {
    const response = await requestJson({
      url: apiRoutes.corners
    });
    if (props.isRatingPage) {
      // TODO: Добавить сортировку по рейтингу
      rows.clients = response.data.corners.sort((a, b) => b.number - a.number);
    } else {
      rows.clients = response.data.corners;
    }
  } finally {
    fetching.value = false;
  }
});

const selectedClient = ref([]);

const selectedRowLabel = computed(() => {
  return `Выбран клиент: ${selectedClient.value.length && selectedClient.value[0].label}`;
});

const selectClient = (evt, row, index) => {
  console.log('row', row);
  if (!selectedClient.value || !selectedClient.value.length) {
    selectedClient.value = [ row ];
  }
};

const onClientDelete = id => {
  rows.clients = rows.clients.filter(client => client.id !== id);
  selectedClient.value = [];
}

</script>

<style scoped>

</style>
