<template>
  <div class="clients">
    <q-table
      title="Список клиентов"
      :columns="columns"
      :rows="data.clients"
      row-key="clientName"
      no-data-label="Список клиентов пуст"
      :rows-per-page-options="[10, 20, 0]"
      selection="single"
      v-model:selected="selectedClient"
      @row-click="selectClient"
      :selected-rows-label="(_ => selectedRowLabel)"
      />
    <div class="client-info" v-if="selectedClient.length">
      <ClientInfoComponent :client="selectedClient[0]"/>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
import ClientInfoComponent from 'components/ClientInfoComponent'


const columns = [
  { name: 'clientName', label: 'Имя клиента', field: 'clientName', sortable: true, align: "center", editable: true, readonly: false, },
  { name: 'phoneNumber', label: 'Номер телефона', field: 'phoneNumber', sortable: true, align: "center", readonly: false, },
  // { name: 'actions', label: 'Actions', field: 'actions', align: "center", readonly: true, },
];

const data = reactive({});

onBeforeMount(() => {
  // TODO: get all clients request
  console.log("Отправлен запрос на список всех клиентов");
  data.clients = [
    {clientName: "Roman 1", phoneNumber: "123-456-78", id: 1 },
    {clientName: "Roman 2", phoneNumber: "222-444-56", id: 2 },
  ];
});

const selectedClient = ref([{clientName: "Roman 1", phoneNumber: "123-456-78", id: 1 }]);

const selectedRowLabel = computed(() => {
  return `Выбран клиент: ${selectedClient.value.length && selectedClient.value[0].clientName}`;
});

const selectClient = (evt, row, index) => {
  if (selectedClient.value.length && row.clientName === selectedClient.value[0].clientName) {
    selectedClient.value = [];
  } else {
    selectedClient.value = [row];
  }
};

</script>

<style scoped>
.client-info {
  margin: 50px 40px;
}
</style>
