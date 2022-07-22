<template>
  <div class="clients">
    <q-table
      title="Список клиентов"
      :columns="columns"
      :rows="data.clients"
      row-key="clientName"
      no-data-label="Список клиентов пуст"
      :rows-per-page-options="[5, 10, 20, 0]"
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
];

const data = reactive({});

onBeforeMount(() => {
  // TODO: get all clients request
  console.log("Отправлен запрос на список всех клиентов");
  data.clients = [
    {clientName: "Client 1", phoneNumber: "123-456-78", id: 1 },
    {clientName: "Client 2", phoneNumber: "222-444-56", id: 2 },
    {clientName: "Client 3", phoneNumber: "322-444-56", id: 3 },
    {clientName: "Client 4", phoneNumber: "422-444-56", id: 4 },
    {clientName: "Client 5", phoneNumber: "522-444-56", id: 5 },
    {clientName: "Client 6", phoneNumber: "622-444-56", id: 6 },
    {clientName: "Client 7", phoneNumber: "722-444-56", id: 7 },
    {clientName: "Client 8", phoneNumber: "822-444-56", id: 8 },
    {clientName: "Client 9", phoneNumber: "922-444-56", id: 9 },
    {clientName: "Client 10", phoneNumber: "102-444-56", id: 10 },
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
