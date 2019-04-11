import {
  VuexModule, Module, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { Vertex, Face } from '@/models/interfaces';
import verticesTable, { CoordinateTable } from '@/helpers/coordinateTable';

@Module({ dynamic: true, name: 'polyStore', store })
class PolyStore extends VuexModule {
  public vertices: CoordinateTable = verticesTable;

  public faces: Face[] = [];

  @Mutation
  pushVertex(vertex: Vertex) {
    this.vertices.set(vertex);
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
