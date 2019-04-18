import { Vertex, Face, MousePosition } from '@/models/interfaces';
import UiStore from '@/store/uiStore';

interface Keys {
  xKey: number;
  yKey: number;
}

interface VerticesTable {
  [K: number]: Vertex[];
}

interface Dictionary<T> {
  [K: number]: VerticesTable;
}

function distinguisher({ x, y }: Vertex): Keys {
  return {
    xKey: ~~(x / 100),
    yKey: ~~(y / 100),
  };
}

export default class CoordinateTable {
  verticesTable: Dictionary<Dictionary<VerticesTable>>;

  constructor() {
    this.verticesTable = {};
  }

  static size: number = 0;

  get({ x, y }: MousePosition): Vertex {
    const { xKey, yKey }: Keys = distinguisher({ x, y } as Vertex);
    let target;
    if (this.verticesTable[xKey] && this.verticesTable[xKey][yKey]) {
      this.verticesTable[xKey][yKey].forEach((vertex: Vertex) => {
        if (x === vertex.x && y === vertex.y) {
          target = vertex;
        }
      });
    }
    return target;
  }

  set(vertex: Vertex) {
    CoordinateTable.size++;
    const { xKey, yKey }: Keys = distinguisher(vertex);
    this.verticesTable[xKey] = this.verticesTable[xKey] || {};
    this.verticesTable[xKey][yKey] = this.verticesTable[xKey][yKey] || [];
    this.verticesTable[xKey][yKey].push(vertex);
  }

  getSize(): number {
    return CoordinateTable.size;
  }

  getSnapPoint({ x, y }): Vertex {
    const { xKey, yKey }: Keys = distinguisher({ x, y } as Vertex);
    let target;
    const snap = UiStore.vertexSnapGap;
    if (this.verticesTable[xKey] && this.verticesTable[xKey][yKey]) {
      this.verticesTable[xKey][yKey].forEach((vertex: Vertex) => {
        if ((Math.abs(vertex.x - x) < snap) && (Math.abs(vertex.y - y) < snap)) {
          target = vertex;
        }
      });
    }
    return target;
  }
}
