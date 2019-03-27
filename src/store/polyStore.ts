import {
  VuexModule, Module, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { Vertex, Face } from '@/models/interfaces';

@Module({ dynamic: true, name: 'polyStore', store })
class PolyStore extends VuexModule {
  public vertices: Vertex[] = [];

  public faces: Face[] = [];

  @Mutation
  pushVertex(vertex: Vertex) {
    this.vertices.push(vertex);
  }

  @Mutation
  pushFace(face: Face) {
    this.faces.push(face);
  }

  @Action
  addVertex(vertex: Vertex) {
    this.context.commit('pushVertex', vertex);
  }

  @Action
  addFace(face: Face) {
    this.context.commit('pushFace', face);
  }
}

export default getModule(PolyStore);
