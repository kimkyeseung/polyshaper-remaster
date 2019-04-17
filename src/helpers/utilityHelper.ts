import { ColorData, Face, MousePosition } from '@/models/interfaces';

const utilityHelper = {
  install(vue) {
    vue.prototype.$stringifyColorData = ({ r, g, b }: ColorData): string => `rgb(${r}, ${g}, ${b})`;

    vue.prototype.$checkInsideTriangle = ({ x, y }: MousePosition, face: Face): boolean => {
      const vector = (from, to) => [to[0] - from[0], to[1] - from[1]];
      const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
      const p = [ x, y ];
      const a = [ face.vertices[0].x, face.vertices[0].y ];
      const b = [ face.vertices[1].x, face.vertices[1].y ];
      const c = [ face.vertices[2].x, face.vertices[2].y ];
      const v0 = vector(a, c);
      const v1 = vector(a, b);
      const v2 = vector(a, p);
      const dot00 = dot(v0, v0);
      const dot01 = dot(v0, v1);
      const dot02 = dot(v0, v2);
      const dot11 = dot(v1, v1);
      const dot12 = dot(v1, v2);
      const invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
      const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
      const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
      return u >= 0 && v >= 0 && u + v < 1;
    };
  },
};

export default utilityHelper;
