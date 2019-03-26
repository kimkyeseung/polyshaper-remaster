<template>
  <div class="poly-edit">
    <display/>
    <controller/>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ImageStore from '@/store/imageStore';
import { Display, Controller } from '@/container';

@Component({ components: { Display, Controller } })
export default class PolyEdit extends Vue {
}

</script>
