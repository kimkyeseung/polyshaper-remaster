<template>
  <div class="upload">
    <h1>upload</h1>
    <div
      @drop="handleDrop"
      @dragenter="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave">
      <h2>Drop the image file here</h2>
      <input type="file" name="upload" id="upload" onChange={this.imageFileValidater}/>
      <label htmlFor="upload" className="">or Select a image file</label>
    </div>
  </div>
</template>


<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import imageStore from '@/store/imageStore';

@Component
export default class Upload extends Vue {
  private active: boolean = false;

  private target: boolean = false;

  private hover: boolean = false;

  uploadImageHandler(image?: string): void {
    imageStore.uploadImage(image);
  }

  imageFileValidater(ev: any) {
    let uploadedImageFile = URL.createObjectURL(ev.target.files[0]);
    let fileExtension = ev.target.files[0].name.substring(ev.target.files[0].name.lastIndexOf('.') + 1).toLowerCase();

    if (fileExtension === "png" || fileExtension === "bmp" || fileExtension === "jpeg" || fileExtension === "jpg") {
      if (uploadedImageFile && ev.target.files[0]) {
        let fileSize = ev.target.files[0].size;
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

  dropTarget(): void {
    if (!this.active) {
      this.target = true;
    }
  }

  dropLeave(ev: MouseEvent) {
    if(ev.screenX === 0 && ev.screenY === 0) {
      this.target = false;
    }
  }

  handleDrop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    const uploadObj = {
      target: ev.dataTransfer
    };
    this.target = false;
    this.hover = false;    
    this.imageFileValidater(uploadObj);
  }

  handleDragEnter(ev: MouseEvent) {
    ev.preventDefault();
    if (!this.active) {
      this.hover = true;
    }
  }

  handleDragLeave(ev: MouseEvent) {
    this.hover = false;
  }

  created() {
    document.addEventListener('dragover', this.dropTarget.bind(this));
    document.addEventListener('dragleave', this.dropLeave.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
  }

  beforeDestroy() {
    document.removeEventListener('dragover', this.dropTarget);
    document.removeEventListener('dragleave', this.dropLeave);
    document.removeEventListener('drop', this.handleDrop);
  }
}
</script>
