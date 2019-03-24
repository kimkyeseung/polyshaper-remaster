import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators';
import store from '@/store';

@Module({dynamic: true, name:'imageStore', store})
class ImageStore extends VuexModule {
  private image: ImageData | string | null = null;

  @Mutation updateImage(image: ImageData | string): void {
    this.image = image;
  }

  @Mutation deleteImage(): void {
    this.image = null;
  }

  @Action
  uploadImage(image?: ImageData | string): void {
    if (image) {
      this.context.commit('updateImage', image);
    } else {
      this.context.commit('deleteImage');
    }
  }
}

export default getModule(ImageStore);
