<template>
  <div class="upload">
    <app-title />
    <div
      @drop="handleDrop"
      @dragenter="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave">
      <h2>Drop the image file here</h2>
      <input type="file" name="upload" id="upload" @change="imageFileValidater"/>
      <label htmlFor="upload">or Select a image file</label>
    </div>
  </div>
</template>


<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ImageStore from '@/store/imageStoreModule';
import AppTitle from '@/components/app-title/index.vue';

@Component({ components: { AppTitle }})
export default class Upload extends Vue {
  private hover: boolean = false;

  uploadImageHandler(image?: string): void {
    ImageStore.uploadImage(image);
  }

  imageFileValidater(ev) {
    const file = ev.target.files[0];
    console.log(file);
    let uploadedImageFile: string = URL.createObjectURL(file);
    let fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

    if (fileExtension === "png" || fileExtension === "bmp" || fileExtension === "jpeg" || fileExtension === "jpg") {
      if (uploadedImageFile && file) {
        let fileSize = file.size;
        if (fileSize > 10485760) {
          alert('10MB 이상의 이미지는 업로드 불가합니다.');
          this.uploadImageHandler();
        }
      }
      this.uploadImageHandler(uploadedImageFile);
    } else {
      alert('jpg, png 파일만 업로드 할 수 있습니다.');
      this.uploadImageHandler();
    }
  }

  handleDrop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    const uploadObj = {
      target: ev.dataTransfer
    };
    this.hover = false;
    this.imageFileValidater(uploadObj);
  }

  handleDragEnter(ev: MouseEvent) {
    ev.preventDefault();
    this.hover = true;
  }

  handleDragLeave(ev: MouseEvent) {
    this.hover = false;
  }

  handleDragOver() {

  }

  created() {
    document.addEventListener('drop', this.handleDrop.bind(this));
  }

  beforeDestroy() {
    document.removeEventListener('drop', this.handleDrop);
  }
}
</script>
