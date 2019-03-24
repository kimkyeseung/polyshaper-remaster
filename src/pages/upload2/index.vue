<template>
  <div id="app">
    <div class="container">
      <!--UPLOAD-->
      <form enctype="multipart/form-data" novalidate v-if="isInitial || isSaving">
        <h1>Upload images</h1>
        <div class="dropbox">
          <input type="file" multiple :name="uploadFieldName" :disabled="isSaving" @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
            accept="image/*" class="input-file">
            <p v-if="isInitial">
              Drag your file(s) here to begin<br> or click to browse
            </p>
            <p v-if="isSaving">
              Uploading {{ fileCount }} files...
            </p>
        </div>
      </form>
      <!--SUCCESS-->
      <div v-if="isSuccess">
        <h2>Uploaded {{ uploadedFiles.length }} file(s) successfully.</h2>
        <p>
          <a href="javascript:void(0)" @click="reset()">Upload again</a>
        </p>
        <ul class="list-unstyled">
          <li v-for="(item, index) in uploadedFiles" :key="index">
            <img :src="item.url" class="img-responsive img-thumbnail" :alt="item.originalName">
          </li>
        </ul>
      </div>
      <!--FAILED-->
      <div v-if="isFailed">
        <h2>Uploaded failed.</h2>
        <p>
          <a href="javascript:void(0)" @click="reset()">Try again</a>
        </p>
        <pre>{{ uploadError }}</pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

@Component
export default class Upload2 extends Vue {
  private uploadedFiles = [];
  private uploadError = null;
  private currentStatus: number | null = null;
  private uploadFieldName = 'photos';

  get isInitial() {
    return this.currentStatus === STATUS_INITIAL;
  }

  get isSaving() {
    return this.currentStatus === STATUS_SAVING;
  }

  get isSuccess() {
    return this.currentStatus === STATUS_SUCCESS;
  }

  get isFailed() {
    return this.currentStatus === STATUS_FAILED;
  }

  reset() {
    this.currentStatus = STATUS_INITIAL;
    this.uploadedFiles = [];
    this.uploadError = null;
  }

  save(formData: FormData) {
    this.currentStatus = STATUS_SAVING;

    this.upload(formData)
      .then(x => {
        this.uploadedFiles = [].concat(x);
        this.currentStatus = STATUS_SUCCESS;
      })
      .catch(err => {
        this.uploadError = err.response;
        this.currentStatus = STATUS_FAILED;
      });
  }

  upload(formData: FormData) {
    const photos = formData.getAll('photos');
    const promises = photos.map((x) => this.getImage(x)
      .then(img => ({
          id: img,
          originalName: x.name,
          fileName: x.name,
          url: img
      })));
    return Promise.all(promises);
  }

  getImage(file: File) {
    return new Promise((resolve, reject) => {
      const fReader: FileReader = new FileReader();
      const img: HTMLImageElement = document.createElement('img');

      fReader.onload = () => {
          img.src = fReader.result;
          resolve(this.getBase64Image(img));
      }

      fReader.readAsDataURL(file);
    });
  }

  getBase64Image(img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dataURL = img.src;
    return dataURL;
  }

  filesChange(fieldName, fileList) {
    const formData: FormData = new FormData();

    if (!fileList.length) return;

    Array
      .from(Array(fileList.length).keys())
      .map(x => {
        formData.append(fieldName, fileList[x], fileList[x].name);
      });

      // save it
    this.save(formData);
  }

  mounted() {
    this.reset();
  }
}

</script>

<style lang="scss">
  .dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
  }
  
  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
  }
  
  .dropbox:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
  }
  
  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }
</style>
