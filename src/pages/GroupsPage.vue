<template>
  <FetchSpinnerComponent :fetching="fetching"/>
  <div class="groups" v-if="!fetching">
    <q-table
      :columns="columns"
      :rows="rows"
      row-key="id"
      no-data-label="Список групп пуст"
      :rows-per-page-options="[10, 20, 0]"
      v-if="!fetching"
    >
      <template v-slot:top-right>
        <q-btn
          label="Добавить"
          color="positive"
          size="md"
          @click="showCreateDialog"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>

          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>

          <q-td key="actions" :props="props" class="table-actions">
            <q-icon name="edit" color="warning" size="sm" @click="showEditDialog(props.row)" />
            <q-icon name="delete" color="negative" size="sm" @click="showDeleteDialog(props.row)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <DraggableDialog v-model="createGroupDialog" title="Добавление группы" @onHide="onHideDialog(createGroup)" >
      <q-input
        v-for="field in createGroup"
        :key="field.attributes.name"
        v-model="field.value"
        v-bind="field.attributes"
        class="dialog-input"
        @blur="blurred(createGroup, field.attributes.name)"
        :error="!field.valid && field.blurred"
        :error-message="field.errors.required ? 'Поле не может быть пустым' : ''"
      />
      <div class="dialog-buttons">
        <q-btn
          label="Добавить"
          color="positive"
          @click="confirmCreate"
          :disable="waitingResponse"
        />
        <q-btn
          label="Отмена"
          color="primary"
          v-close-popup
        />
      </div>
    </DraggableDialog>

    <DraggableDialog v-model="editGroupDialog" title="Редактирование группы" @onHide="onHideDialog(selectedGroup)">
      <q-input
        v-model="selectedGroup.name.value"
        v-bind="selectedGroup.name.attributes"
        class="dialog-input"
        @blur="blurred(createGroup, selectedGroup.name.attributes.name)"
        :error="!selectedGroup.name.valid && selectedGroup.name.blurred"
        :error-message="selectedGroup.name.errors.required ? 'Поле не может быть пустым' : ''"
      />
      <q-select
        v-model="selectedGroup.roles.value"
        v-bind="selectedGroup.roles.attributes"
        class="dialog-input"
        :options="roles.data"
        @filter="lazyLoadRoles"
      >
        <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
          <q-item v-bind="itemProps">
            <q-item-section>
              <q-item-label > {{ opt.label }} </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle :model-value="selected" @update:model-value="toggleOption(opt)" />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <div class="dialog-buttons">
        <q-btn
          label="Сохранить"
          color="positive"
          @click="confirmEdit"
          :disable="waitingResponse"
        />
        <q-btn
          label="Отмена"
          color="primary"
          v-close-popup
        />
      </div>
    </DraggableDialog>

    <DraggableDialog v-model="deleteGroupDialog" title="Удаление группы" @onHide="onHideDialog(selectedGroup)">
      <div class="dialog-buttons">
        <q-btn
          label="Удалить"
          color="positive"
          @click="confirmDelete"
          :disable="waitingResponse"
        />
        <q-btn
          label="Отмена"
          color="primary"
          v-close-popup
        />
      </div>
    </DraggableDialog>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
import { apiRoutes, requestJson } from "src/api";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import DraggableDialog from "components/DraggableDialog";
import { useObject } from "src/hooks/useObject";


const fetching = ref(false);
const waitingResponse = ref(false);
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: false, readonly: true, },
  { name: 'name', label: 'Название группы', field: 'name', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'actions', label: 'Действия', field: 'actions', sortable: true, align: "left", editable: false, readonly: true, },

];
const rows = ref([]);
const roles = {};
onBeforeMount( async () => {
  fetching.value = true;
  Promise.all([
    requestJson({url: apiRoutes.groups}),
    requestJson({url: apiRoutes.roles}),
  ])
    .then(([groupsResponse, rolesResponse]) => {
      console.log('fetched');
      if (groupsResponse.success) {
        rows.value = groupsResponse.data;
      }
      if (rolesResponse.success) {
        roles.data = rolesResponse.data.reduce((acc, item) => {
          return [...acc, {label: item.name, value: item.id}];
        }, []);
        console.log('roles formed');
      }
      fetching.value = false;
    });
});

const required = val => !!val;
const createGroup = useObject({
  name: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    attributes: {
      name: "name",
      label: "Название группы",
      type: "text",
    },
  }
});

const selectedGroup = useObject({
  id: {
    value: '',
    prevValue: '',
  },
  name: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    attributes: {
      name: "name",
      label: "Название группы",
      type: "text",
    },
  },
  roles: {
    value: [],
    prevValue: [],
    attributes: {
      name: "roles",
      label: "Роли",
      multiple: true,
      "stack-label": false,
      "hide-selected": true,
      "use-chips": true,
    },
  },
});

const deleteGroupDialog = ref(false);
const editGroupDialog = ref(false);
const createGroupDialog = ref(false);

const showCreateDialog = () => {
  createGroupDialog.value = true;
};

const confirmCreate = async () => {
  const body = {};
  Object.entries(createGroup).forEach(entry => {
    const [key, innerObject] = entry;
    body[key] = innerObject.value;
  });
  try {
    waitingResponse.value = true;
    const response = await requestJson({
      url: apiRoutes.groups,
      method: "POST",
      body,
    });
    if (response.success) {
      // TODO: при получении ответа с id новой группы, добавлять его в общий список
    }
    console.log('response', response);
  } finally {
    waitingResponse.value = false;
    createGroupDialog.value = false;
  }
};

const showEditDialog = (row) => {
  setGroupFields(row, selectedGroup);
  editGroupDialog.value = true;
};

const confirmEdit = () => {
  // TODO: Отправлять запрос на изменение с массивом ролей
  console.log('ConfirmEdit function');
}

const showDeleteDialog = (row) => {
  deleteGroupDialog.value = true;
};

const confirmDelete = () => {

};

const lazyLoadRoles = async (val, update, abort) => {
  if (selectedGroup.roles.value !== null && selectedGroup.roles.value.length) {
    // already loaded
    update()
    return
  }
  const response = await requestJson({
    url: apiRoutes.adminRoles,
    params: {
      group: selectedGroup.id.value,
    }
  });
  if (response.success) {
    selectedGroup.roles.value = response.data.reduce((acc, item) => {
      const role = roles?.data?.find(i => i.value === item.role)
      return [ ...acc, role ];
    }, []);
  }
  update()
}

const setGroupFields = (row, object) => {
  Object.entries(row).forEach(entry => {
    const [ key, value ] = entry;
    if (object.hasOwnProperty(key)) {
      object[key].value = value;
      object[key].prevValue = value;
      object[key].blurred = false;
    }
  });
};

const refreshGroupObject = (object) => {
  Object.keys(object).forEach(key => {
    object[key].value = '';
    object[key].prevValue = '';
    object[key].blurred = false;
    object[key].valid = true;
  })
};

const onHideDialog = (object) => {
  refreshGroupObject(object);
};

const blurred = (object, field) => {
  object[field].blurred = true;
};
</script>

<style scoped>

</style>
