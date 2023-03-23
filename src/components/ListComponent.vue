<template>
  <q-list>
    <div
      v-for="(item, index) in items"
      :key="item.id"
      @click="listItemClickHandler(item)"
      class="list-item__wrapper"
      :class="parentName !== 'feedback' && dayjs(item.expire_at)?.isBefore(dayjs(), 'date') ? 'list-item__old' : parentName"
    >

      <q-item>
        <q-item-section style="padding-left: 20px;">
          <q-item-label>{{ item.title }}</q-item-label>
          <q-item-label
            v-show="Object.keys(item).includes('answer') && item?.corner_id"
            class="feedback-corner-id"
            @click.stop.exact="cornerIdClickHandler(item.corner_id)"
          >corner_id: {{ item.corner_id }}
          </q-item-label>
          <q-item-label
            @click="textClick(item)"
            caption
            :lines="item?.expanded ? 0 : lines"
            :class="item?.expanded ? '' : 'list-item-text'"
          >{{ item.text }}</q-item-label>
        </q-item-section>

        <q-item-section
          side
          top
        >
          <q-item-label
            caption
            v-if="item.date || item.publish_at"
            class="date-caption"
          >Дата публикации: {{ dayjs(item.date || item.publish_at).format(dateDisplayFormat) }}</q-item-label>
          <q-item-label
            caption
            v-if="item.expire_at"
            class="date-caption"
          >Дата окончания: {{ dayjs(item.expire_at).format(dateDisplayFormat) }}</q-item-label>
          <q-item-label
            caption
            v-if="item.priority"
            style="color: #374bc9"
          >Приоритет:{{ item.priority }}</q-item-label>
        </q-item-section>
      </q-item>
      <div class="list-item__bottom">
        <div class="list-item__actions">
          <EditIconComponent
            v-if="editable"
            @click.stop="editItemClick(item)"
          />
          <DeleteIconComponent
            v-if="deletable"
            @click.stop="deleteItemClick(item)"
          />
        </div>
        <q-separator
          vertical
          spaced
        />

        <q-img
          :img-style="{maxHeight: '200px'}"
          :style="{maxHeight: '200px', maxWidth: '300px'}"
          v-if="item?.img?.hasOwnProperty('url')"
          class="q-ml-xl cursor-pointer"
          :src="item.img.url"
          @click="imgClickHandler(item.img)"
          loading="lazy"
          fit="contain"
        >
          <template v-slot:error>
            <img
              src="/icons/no-image.png"
              alt="No image"
            />
          </template>
        </q-img>

        <div
          class="list-item__files flex column"
          v-if="item.files?.length"
        >
          <q-chip
            v-for="file in item.files"
            :key="file.name"
            square
            icon="description"
            clickable
            @click.stop="fileClickHandler(file)"
          >
            {{ file.name }}
          </q-chip>
        </div>
      </div>

      <q-separator
        spaced
        v-if="index !== items.length - 1"
      />

      <slot></slot>
    </div>
  </q-list>
</template>

<script setup>
import * as dayjs from "dayjs";
import EditIconComponent from "components/EditIconComponent";
import DeleteIconComponent from "components/DeleteIconComponent";
import { newTabImage } from "src/utils/file";
import { useRouter } from 'vue-router';


defineProps({
  items: {
    type: Array
  },
  lines: {
    type: [Number, String],
    default: 0,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  deletable: {
    type: Boolean,
    default: false,
  },
  dateDisplayFormat: {
    type: String,
    default: "YYYY-MM-DD HH:mm:ss"
  },
  parentName: {
    type: String,
    default: "",
  }
});


const emits = defineEmits(['listItemClick', 'editItemClick', 'deleteItemClick']);
const router = useRouter();
const listItemClickHandler = item => {
  emits('listItemClick', item);
};

const editItemClick = item => {
  emits('editItemClick', item);
};

const deleteItemClick = item => {
  emits('deleteItemClick', item);
};

const imgClickHandler = item => {
  newTabImage(item);
};

const fileClickHandler = file => {
  window.open(file.url, "_blank");
};

const cornerIdClickHandler = (corner_id) => {
  router.push({
    name: 'Clients',
    params: {
      corner_id
    }
  });
}

const textClick = (item) => {
  item.expanded = true
}

</script>

<style scoped>
.list-item__actions {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-item__actions * {
  transition: all 0.2s;
  cursor: pointer;
}

.list-item__actions>*:hover {
  transform: scale(1.3);
}

.list-item__bottom {
  display: flex;
}

.list-item__wrapper {
  position: relative;
  cursor: default;
}

.list-item__old {
  opacity: .3;
}

.list-item__date-old {
  color: #f59b9b;
}

.q-img__container {
  cursor: default !important;
}

.date-caption {
  font-weight: 500;
  font-size: 0.85rem;
}

.feedback-corner-id {
  width: 100px;
  color: #027bc7;
  cursor: pointer;
  transition: all .2s;
}

.feedback-corner-id:hover {
  color: #4cb0f5;
  transform: scale(1.1);
}

.list-item-text {
  cursor: pointer;
  transition: .2 all;
  color: rgba(0, 0, 0, 0.54)
}

.list-item-text:hover {
  color: rgba(0, 0, 0, 0.8)
}
</style>
