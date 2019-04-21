import {
  VuexModule, Module, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { Vertex, Face } from '@/models/interfaces';
import CoordinateTable from '@/helpers/coordinateTable';

@Module({ dynamic: true, name: 'polyStore', store })
class PolyStore extends VuexModule {
  public vertices: CoordinateTable = new CoordinateTable();

  public snapVertex: Vertex;

  public faces: Face[] = [];

  public selectedFace: Face = null;

  @Mutation
  pushVertex(vertex: Vertex) {
    this.vertices.set(vertex);
  }

  @Mutation
  pushFace(face: Face) {
    this.faces.push(face);
  }

  @Mutation
  initializeState() {
    this.vertices = new CoordinateTable();
    this.faces = [];
  }

  @Mutation
  updateSelectedFace(face: Face) {
    this.selectedFace = face;
  }

  @Mutation
  removeSelectedFace() {
    this.selectedFace = null;
  }

  @Mutation
  popFace(face: Face) {
    const faceIndex = this.faces.findIndex(faceTarget => {
      return faceTarget === face;
    });
    this.faces.splice(faceIndex, 1);
  }

  @Action
  addVertex(vertex: Vertex) {
    this.context.commit('pushVertex', vertex);
  }

  @Action
  addFace(face: Face) {
    this.context.commit('pushFace', face);
  }

  @Action
  initialize() {
    this.context.commit('initializeState');
  }

  @Action
  selectFace(face: Face) {
    this.context.commit('updateSelectedFace', face);
  }

  @Action
  deselectFace() {
    this.context.commit('removeSelectedFace');
  }

  @Action
  changeFaceColor(color) {
    this.selectedFace.color = color;
    this.context.commit('updateSelectedFace', this.selectedFace);
  }

  @Action
  removeFace(face: Face) {
    this.context.commit('popFace', face);
  }
}

export default getModule(PolyStore);
