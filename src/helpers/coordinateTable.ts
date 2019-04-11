import { Vertex, Face, MousePosition } from '@/models/interfaces';

interface Keys {
  xKey: number;
  yKey: number;
}

function distinguisher({ x, y }: Vertex): Keys {
  return {
    xKey: ~~(x / 100),
    yKey: ~~(y / 100),
  };
}

export class CoordinateTable {
  verticesTable: Vertex[][][];

  constructor() {
    this.verticesTable = [];
  }

  static size: number = 0;

  get({ x, y }: MousePosition): Vertex {
    const { xKey, yKey }: Keys = distinguisher({ x, y } as Vertex);
    let target;
    this.verticesTable[xKey][yKey].forEach((vertex: Vertex) => {
      if (x === vertex.x && y === vertex.y) {
        target = vertex;
      }
    });
    return target;
  }

  set(vertex: Vertex) {
    CoordinateTable.size++;
    const { xKey, yKey }: Keys = distinguisher(vertex);
    this.verticesTable[xKey] = this.verticesTable[xKey] || [];
    this.verticesTable[xKey][yKey] = this.verticesTable[xKey][yKey] || [];
    this.verticesTable[xKey][yKey].push(vertex);
  }

  getSize(): number {
    return CoordinateTable.size;
  }
}

export default new CoordinateTable();
