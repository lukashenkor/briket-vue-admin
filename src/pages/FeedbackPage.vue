<template>
  <FetchSpinnerComponent :fetching="fetching" />
  <div class="feedback-container">
    <CardTabsComponent
      v-if="!fetching"
      :items="items"
      v-model="tab"
      @listItemClick="listItemClick"
      :parent-name="'feedback'"
    />
  </div>

  <DraggableDialog
    v-model="dialog"
    :title="selectedItem?.value?.title"
    @onHide="onHideDialog"
    minWidth="800"
  >
    <q-spinner-dots
      size="50"
      color="primary"
      v-if="waitingResponse"
    />
    <div
      class="feedback-corner-info"
      v-if="!waitingResponse"
    >
      <h6>Информация об авторе обращения</h6>
      <q-markup-table separator="cell">
        <thead>
          <tr>
            <th>Corner_id</th>
            <th>User_id</th>
            <th>Login</th>
            <th>Наименование</th>
            <th>Number</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ selectedFeedbackClient.corner_id }}</td>
            <td>{{ selectedFeedbackClient.user_id }}</td>
            <td>{{ selectedFeedbackClient.login }}</td>
            <td>{{ selectedFeedbackClient.label }}</td>
            <td>{{ selectedFeedbackClient.number }}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
    <div class="feedback-corner-info">
      <h6>Текст обращения:</h6>
      <p class="paragraph-text">{{ selectedItem.value.text }}</p>
    </div>
    <q-input
      type="textarea"
      v-model="selectedItem.value.answer"
      filled
      label="Ответ"
      no-error-icon
      class="full-width"
      hide-hint
      hide-bottom-space
      :disable="selectedItem.value.status === 1"
    />
    <div
      class="dialog-buttons"
      :style="{ justifyContent: dialogButtonsStyle }"
    >
      <q-btn
        label="Отправить"
        color="positive"
        @click="sendAnswer"
        :disable="!selectedItem.value.answer?.length || waitingResponse"
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
import { useUtilsStore } from "stores/utils";

const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);
const fetching = ref(true);
const dialog = ref(false);
const tab = ref("new");

const feedbacks = reactive({});
const items = reactive({
  "new": {
    label: 'Без ответа',
    name: 'new',
    lines: 2,
    icon: "format_list_bulleted",
    data: [],
  },
  "closed": {
    label: 'Выполненные',
    name: 'closed',
    lines: 2,
    icon: "checklist",
    data: [],
  }
});

onMounted(async () => {
  try {
    const response = await requestJson({ url: apiRoutes.feedback });

    if (response.success) {
      response.data.forEach(item => {
        if (item.status === 0) {
          item.date = item.created_at;
          items.new.data.push(item);
        } else {
          item.date = item.updated_at;
          items.closed.data.push(item);
        }
      });
    } else {
      console.error('request failed. Error: ', response.error);
    }

  } finally {
    fetching.value = false;
  }
});

const selectedFeedbackClient = ref({});
const selectedItem = reactive({});
const listItemClick = async (item) => {
  utilsStore.updateWaitingResponse(true);
  selectedItem.value = item;
  dialog.value = true;
  try {
    const feedbackClient = await requestJson({
      url: `${apiRoutes.corners}/${item.corner_id}`
    });

    if (feedbackClient.success) {
      selectedFeedbackClient.value = feedbackClient.data;
    }
  } finally {
    utilsStore.updateWaitingResponse(false);
  }
};

const onHideDialog = () => {
  selectedItem.value = {};
};

const sendAnswer = async () => {
  const body = {
    status: 1,
    answer: selectedItem.value.answer
  };

  try {
    const response = await requestJson({
      url: `${apiRoutes.feedback}/${selectedItem.value.id}`,
      method: "PUT",
      body
    });

    if (response.success) {
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

.feedback-corner-info {
  text-align: center;
  margin-bottom: 20px;
}

.feedback-corner-info>p {
  margin: 0;
}
</style>
