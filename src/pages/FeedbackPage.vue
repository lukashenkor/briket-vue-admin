<template>
  <FetchSpinnerComponent :fetching="fetching"/>
  <CardTabsComponent v-if="!fetching" :items="items" v-model="tab" @listItemClick="listItemClick" />

  <DraggableDialog v-model="dialog" :title="selectedItem?.value?.title" @onHide="onHideDialog">
    <h6>{{ selectedItem.value.title }}</h6>
    <p class="paragraph-text">{{ selectedItem.value.text }}</p>
    <q-input
      type="textarea"
      v-model="selectedItem.value.answerText"
      filled
      label="Ответ"
      class="fit"
      no-error-icon
      hide-hint
      hide-bottom-space
      :disable="selectedItem.value.status === 1"
    />
    <div class="dialog-buttons" :style="{justifyContent: dialogButtonsStyle}">
      <q-btn
        label="Отправить"
        color="positive"
        @click="sendAnswer"
        :disable="!selectedItem.value.answerText?.length || waitingResponse"
        v-if="selectedItem.value.status === 0"
      />
      <q-btn
        :label="selectedItem?.value?.status === 0 ? 'Отмена' : 'Закрыть'"
        color="primary"
        v-close-popup
      />
    </div>
  </DraggableDialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import DraggableDialog from "components/DraggableDialog";
import CardTabsComponent from "components/CardTabsComponent";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import { apiRoutes, requestJson } from "src/api";
import { notifySuccess } from "src/utils/notification";
import { useUtilsStore } from "stores/utils";


const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);
const fetching = ref(true);
const dialog = ref(false);
const tab = ref("new");

const feedbacks = reactive({});
const items = reactive({
  "new": {
    label: 'Новые',
    name: 'new',
    lines: 1,
    icon: "format_list_bulleted",
  },
  "closed": {
    label: 'Выполненные',
    name: 'closed',
    lines: 1,
    icon: "checklist",
  }
});

const openedFeedbacks = computed(() => {
  return feedbacks?.data?.filter(item => item?.status === 0);
});

const closedFeedbacks = computed(() => {
  return feedbacks?.data?.filter(item => item.status === 1);
});

onMounted( async () => {
  try {
    const response = await requestJson({ url: apiRoutes.feedback });

    if (response.success) {
      feedbacks.data = response.data;

      items.new.data = openedFeedbacks;
      items.closed.data = closedFeedbacks;
    } else {
      console.error('request failed. Error: ', response.error);
    }

  } finally {
    fetching.value = false;
  }
});

const selectedItem = reactive({});
const listItemClick = (item) => {
  selectedItem.value = item;
  dialog.value = true;
};

const onHideDialog = () => {
  selectedItem.value = {};
};

const sendAnswer = async () => {
  try {
    const response = await requestJson({
      url: `${apiRoutes.feedback}/${selectedItem.value.id}`,
      method: "PUT",
      body: {
        status: 1,
      }
    });
    console.log('response', response);

    if (response.success) {
      notifySuccess("Редактирование успешно");
      selectedItem.value.status = 1;
    }
  } finally {
    dialog.value = false;
  }
};

const dialogButtonsStyle = computed(() => selectedItem?.value.status === 0
  ? "spaceBetween"
  : "center");
</script>

<style scoped>
.paragraph-text {
  max-width: 100%;
  overflow-wrap: break-word;
}
</style>
