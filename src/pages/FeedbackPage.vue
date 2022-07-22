<template>
  <q-card bordered class="my-card bg-white">
    <q-card-section class="bg-grey my-card-section">
      <q-tabs
        v-model="tab"
        narrow-indicator
        dense
        align="justify"
        class="bg-grey text-white fit"
      >
        <q-tab :ripple="false" name="open" icon="format_list_bulleted" label="Новые">
          <q-badge color="blue-7" text-color="white" floating>{{ openedFeedbacksCount }}</q-badge>
        </q-tab>
        <q-tab :ripple="false" name="closed" icon="checklist" label="Выполненные" />
      </q-tabs>
    </q-card-section>


    <q-card-section v-if="tab">
      <div class="new" v-show="tab === 'open'">
        <ListComponent :items="openedFeedbacks" v-if="openedFeedbacks.length" @sendAnswer="changeStatus"/>
        <h3 v-else>Список новых пуст</h3>
      </div>
      <div class="completed" v-show="tab === 'closed'">
        <ListComponent :items="closedFeedbacks" v-if="closedFeedbacks.length"/>
        <h3 v-else>Список выполненных пуст</h3>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import ListComponent from "src/components/ListComponent";


const tab = ref('');

const feedbacks = reactive({});

onMounted(() => {
  Promise.all([
    new Promise(resolve => setTimeout(() => resolve(12), 200)),
    new Promise(resolve => setTimeout(() => resolve(2), 100)),
  ]).then(([countResponse, feedbacksResponse]) => {

    // console.log('countResponse', countResponse);
    // console.log('feedbacksResponse', feedbacksResponse);
    feedbacks.count = {
      closed: 0,
      open: 12,
    };
    feedbacks.data = [
      {
        date: "2022-07-03T18:07:15",
        id: 3,
        status: 0,
        text: "Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал ",
        title: "Заголовок",
      },
      {
        "date": "2020-11-05T14:31:33",
        "id": 2,
        "status": 0,
        "text": "Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал Очень длинный текст обращения который я явно не придумал ",
        "title": "Заголовок"
      },
      {
        "date": "2020-10-16T16:33:43",
        "id": 1,
        "status": 0,
        "text": "ТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТТЕСТ",
        "title": "Тест"
      }
    ];
  });
});

const changeStatus = (item) => {
  const find = openedFeedbacks.value.find(feedback => feedback.id === item.value.id);
  find.status = 1;
}

const openedFeedbacks = computed(() => {
  return feedbacks?.data?.filter(item => item?.status === 0);
});

const closedFeedbacks = computed(() => {
  return feedbacks?.data?.filter(item => item.status === 1);
});

const openedFeedbacksCount = computed(() => {
  return openedFeedbacks?.value?.length > 10 ? "10+" : openedFeedbacks?.value?.length.toString();
})

// console.log(result1);
</script>

<style scoped>

</style>
