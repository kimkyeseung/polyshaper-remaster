import {
  VuexModule, Module, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import store from '@/store';

@Module({ dynamic: true, name: 'imageStore', store })
class ImageStore extends VuexModule {
  public image: string | null = null;

  @Mutation
  updateImage(image: string) {
    this.image = image;
  }

  @Mutation
  saveImageToStorage(imageUrl: string) {
    const imageData = { image: imageUrl };
    localStorage.setItem('poly', JSON.stringify(imageData));
  }

  @Mutation
  loadImageFromStorage() {
    const storedData = JSON.parse(localStorage.getItem('poly'));
    const storedImage = storedData.image;
    this.image = storedImage;
  }

  @Mutation
  deleteImage() {
    this.image = null;
  }

  @Action
  uploadImage(image?: string) {
    image
      ? this.context.commit('updateImage', image)
      : this.context.commit('deleteImage');
  }

  @Action
  uploadImageToStorage(imageUrl: string) {
    this.context.commit('saveImageToStorage', imageUrl);
  }

  @Action
  getImageFromStorage() {
    this.context.commit('loadImageFromStorage');
  }
}

export default getModule(ImageStore);
