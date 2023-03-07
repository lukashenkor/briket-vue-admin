<template>
  <q-table
    :rows="items"
    key="id"
    :columns="goalsColumns"
    v-show="tab === 'goals'"
    no-data-label="Список целей пуст"
    :pagination="{sortBy: 'id', descending: true}"
  >
    <template v-slot:top-left>
      <q-btn
        label="Добавить"
        color="positive"
        size="md"
        @click="createMode = true"
      />
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="id" :props="props">
          {{ props.row.id }}
        </q-td>
        <q-td key="start_at" :props="props">
          {{ props.row.start_at }}
        </q-td>
        <q-td key="end_at" :props="props">
          {{ props.row.end_at }}
        </q-td>
        <q-td key="goal" :props="props">
          {{ props.row.goal }}
        </q-td>
        <q-td key="actions" :props="props" class="table-actions">
          <EditIconComponent @click="showEditDialog(props.row)"/>
          <DeleteIconComponent @click="showDeleteDialog(props.row)"/>
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <DraggableDialog v-model="dialog" min-height="300" :title="dialogTitle" @onHide="onHideDialog(goal)">
    <q-form @submit.prevent="submitHandler" style="width: 80%;">
      <h3 v-if="deleteMode">Удалить цель № {{ goal.id.value }}?</h3>

      <div v-else>
        <DateTimePicker
          v-for="field in Object.values(goal).filter(item => item.isDate)"
          :key="field.attributes.name"
          v-model="field.value"
          v-bind="field.attributes"
          @blur="blurred(goal, field.attributes.name)"
          class="dialog-input"
          :without-time="true"
        />
        <q-input
          v-model="goal.goal.value"
          v-bind="goal.goal.attributes"
          @blur="blurred(goal, goal.goal.attributes.name)"
          class="dialog-input"
          error-message="Поле не может быть пустым"
          :rules="[...Object.values(goal.goal.validators)]"
        />
      </div>

      <div class="dialog-buttons">
        <q-btn
          :label="submitButtonLabel"
          color="positive"
          type="submit"
          :disable="waitingResponse"
        />
        <q-btn
          label="Отмена"
          color="primary"
          v-close-popup
        />
      </div>
    </q-form>
  </DraggableDialog>
</template>

<script setup>
import DraggableDialog from "components/DraggableDialog";
import DateTimePicker from "components/DateTimePicker";
import { computed, ref } from "vue";
import { useObject } from "src/hooks/useObject";
import { useUtilsStore } from "stores/utils";
import { apiRoutes, requestJson } from "src/api";
import { refreshFields, blurred, setFields } from "src/utils/object";
import { required } from "src/utils/validators";
import EditIconComponent from "components/EditIconComponent";
import DeleteIconComponent from "components/DeleteIconComponent";


const props = defineProps([ "tab", "client", "modelValue" ]);

const emits = defineEmits([ "update:modelValue" ]);

const items = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val),
});

const goalsColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'start_at', label: 'Дата начала', field: 'start_at', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'end_at', label: 'Дата окончания', field: 'end_at', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'goal', label: 'Цель', field: 'goal', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'actions', label: 'Действия', field: 'actions', sortable: false, align: "left", editable: false, readonly: true, },
];
const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);

const goal = useObject({
  id: {
    value: '',
    hidden: true,
  },
  start_at: {
    value: '',
    prevValue: '',
    validators: {required},
    blurred: false,
    isDate: true,
    attributes: {
      name: "start_at",
      label: "Начало",
    },
  },
  end_at: {
    value: '',
    prevValue: '',
    validators: {required},
    blurred: false,
    isDate: true,
    attributes: {
      name: "end_at",
      label: "Окончание",
    },
  },
  goal: {
    value: '',
    prevValue: '',
    validators: {required},
    blurred: false,
    attributes: {
      name: "goal",
      label: "Цель",
      type: "number",

    },
  }
});
const createMode = ref(false);
const editMode = ref(false);
const deleteMode = ref(false);
const dialog = computed({
get: () => createMode.value || editMode.value || deleteMode.value,
set: () => {
  createMode.value = false;
  editMode.value = false;
  deleteMode.value = false;
}
});
const dialogTitle = computed(() => {
  let label = '';
  if (createMode.value) label = 'Создание';
  if (editMode.value) label = 'Редактирование';
  if (deleteMode.value) label = 'Удаление';
  return `${label} цели`;
});
const submitButtonLabel = computed(() => {
  let label = '';
  if (createMode.value) label = 'Создать';
  if (editMode.value) label = 'Сохранить';
  if (deleteMode.value) label = 'Удалить';
  return label
});

const submitHandler = evt => {
  editMode.value && editGoal();
  createMode.value && createGoal();
  deleteMode.value && deleteGoal();
};

const createGoal = async () => {
  const body = {};
  for (const object of Object.values(goal)) {
    if (object.hidden) continue
    body[object.attributes.name] = object.value;
  }
  const url = apiRoutes.goals.replace("[id]", props.client.id);
  try {
    const response = await requestJson({
      url,
      body,
      method: "POST",
    });
    if (response.success) {
      items.value = [...items.value, response.data];
    }
  } finally {
    dialog.value = false;
  }
};

const showEditDialog = item => {
  setFields(item, goal);
  editMode.value = true;
};

const editGoal = async () => {
  const url = `${ apiRoutes.goals.replace('[id]', props.client.id) }/${ goal.id.value }`;
  const body = {};
  for (const inner of Object.values(goal)) {
    if (inner.hidden || !inner.edited) continue
    body[inner.attributes.name] = inner.value;
  }
  try {
    const response = await requestJson({
      url,
      body,
      method: "PUT",
    });
    if (response.success) {
      const updatedGoal = items.value.find(item => item.id === goal.id.value);
      for (const [ key, inner ] of Object.entries(goal)) {
        if (inner.hidden || !inner.edited) continue
        updatedGoal[key] = inner.value;
      }
    }
  } finally {
    dialog.value = false;
  }
};

const showDeleteDialog = item => {
  deleteMode.value = true;
  goal.id.value = item.id;
};

const deleteGoal = async () => {
  const url = `${apiRoutes.goals.replace('[id]', props.client.id)}/${goal.id.value}`;
  try {
    const response = await requestJson({
      url,
      method: "DELETE",
    });

    if (response.success) {
      items.value = items.value.filter(item => item.id !== goal.id.value);
    }
  } finally {
    dialog.value = false;
  }
}

const onHideDialog = object => {
  refreshFields(object);
};

</script>
