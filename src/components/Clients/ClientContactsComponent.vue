<template>
  <div class="contacts" v-if="contacts && contacts.length">
    <div
      class="contacts-item"
      v-for="(contact, idx) in contacts"
      :key="contact"
    >
      <span class="contacts-item__label">Контакт №{{ idx + 1 }}</span>
      <div class="contacts-item__body">
        <q-input
          v-model="contacts[idx]['name']"
          label="Имя"
          type="text"
          :rules="[required]"
          error-message="Некорректное значение"
          outlined
          autofocus
        />
        <q-input
          v-model="contacts[idx]['phone']"
          label="Телефон"
          type="text"
          mask="+7-(###)-###-##-##"
          fill-mask
          unmasked-value
          :rules="[required]"
          error-message="Некорректное значение"
          outlined
        />
        <q-input
          v-model="contacts[idx]['position']"
          label="Должность"
          type="text"
          :rules="[required]"
          error-message="Некорректное значение"
          outlined
        />
        <DeleteIconComponent @click="deleteContact(idx)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { required } from "src/utils/validators";
import DeleteIconComponent from "components/DeleteIconComponent";


const props = defineProps(['modelValue']);
const emits = defineEmits([ "update:modelValue" ]);

const contacts = computed({
  get:() => props.modelValue,
  set: (val) => emits("update:modelValue", val),
});

const deleteContact = idx => {
  contacts.value.splice(idx, 1);
}
</script>

<style scoped>
.contacts-item {
  margin: 15px 2px 5px;
}

.contacts-item__body {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}

.contacts-item__label {
  font-size: 12px;
  color: #565656;
  margin-left: 3px;
}
</style>
