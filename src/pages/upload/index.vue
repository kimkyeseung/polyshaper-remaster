<template>
  <div class="upload">
    <div class="upload__contents">
      <app-title />
      <label htmlFor="upload">
        <div
          @drop="handleDrop"
          @dragenter="handleDragEnter"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          :class="`upload__drop-zone ${hover ? 'drop-target' : ''}`"
          >
          <svgicon icon="file-upload-outline" width="60" height="60"></svgicon>
          <h2>Drop the image file here</h2>
          <input type="file" name="upload" id="upload" @change="imageFileValidater"/>
          <p>or Select a image file</p>
        </div>
      </label>
    </div>
  </div>
</template>


<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import ImageStore from '@/store/imageStore';
import { InputFileEvent } from '@/models/interfaces';
import AppTitle from '@/components/app-title/index.vue';

@Component({ components: { AppTitle } })
export default class Upload extends Vue {
  private hover: boolean = false;

  @Watch('uploadedImage')
  onImageUploaded(image: string) {
    const imageAddress = image.split('/').pop();
    this.$router.push(`/poly-edit/${imageAddress}`);
  }

  get uploadedImage() {
    return ImageStore.image;
  }

  uploadImageHandler(image?: string): void {
    ImageStore.uploadImage(image);
  }

  imageFileValidater({ target }: InputFileEvent) {
    const file: File = target.files[0];
    const uploadedImageFile: string = URL.createObjectURL(file);
    const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

    if (fileExtension === 'png' || fileExtension === 'bmp' || fileExtension === 'jpeg' || fileExtension === 'jpg') {
      if (uploadedImageFile && file) {
        const fileSize = file.size;
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
      target: ev.dataTransfer,
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
