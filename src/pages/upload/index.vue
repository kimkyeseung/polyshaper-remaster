<template>
  <div class="upload">
    <div class="upload__contents">
      <app-title className="upload__title"/>
      <p class="upload__description">
        Polyshaper는 이미지를 Polyart를 제작할 수 있는 웹 어플리케이션입니다.
        이미지의 원하는 부분을 클릭해서 삼각형으로 만들면 
        <br>
        해당 부분의 평균색으로 면이 채워집니다.
      </p>
      <label htmlFor="upload">
        <div
          @drop="handleDrop"
          @dragenter="handleDragEnter"
          @dragover.prevent="() => {}"
          @dragleave="handleDragLeave"
          :class="`upload__drop-zone ${hover ? 'drop-target' : ''}`">
          <v-icon name="upload"></v-icon>
          <h2>Drop the image file here</h2>
          <input type="file" name="upload" id="upload" @change="imageFileValidater"/>
          <p>or Select a image file</p>
        </div>
      </label>
    </div>
    <b-modal ref="storedImageModal" @ok="uploadImageHandler(storedImage)" title="Polyshaper">
      <p>기존에 작업하던 이미지가 남아있습니다.</p>
      <p>이어서 진행하시겠습니까?</p>
      
    </b-modal>
  </div>
</template>


<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import imageStore from '@/store/imageStore';
import { InputFileEvent } from '@/models/interfaces';
import { AppTitle } from '@/components';
import { Modal } from 'bootstrap-vue';

@Component({ components: { AppTitle } })
export default class Upload extends Vue {
  private hover: boolean = false;

  private storedImage: string;

  public $refs!: {
    storedImageModal: Modal;
  }

  get uploadedImage(): string {
    return imageStore.image;
  }

  uploadImageHandler(image?: string): void {
    imageStore.uploadImage(image);
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

  created() {
    document.addEventListener('drop', this.handleDrop.bind(this));
  }

  mounted() {
    const storedData = JSON.parse(localStorage.getItem('poly'));
    if (storedData) {
      const storedImage = storedData.image;
      this.storedImage = storedImage;
      this.$refs.storedImageModal.show();
    }
  }

  beforeDestroy() {
    document.removeEventListener('drop', this.handleDrop);
  }
}
</script>
