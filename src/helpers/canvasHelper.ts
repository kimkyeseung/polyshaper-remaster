import { MousePosition, Face } from '@/models/interfaces';

const canvasHelper = {
  install(vue) {
    vue.prototype.$makeVertexOnCanvas = ({ x, y }: MousePosition, canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
      context.beginPath();
      context.arc(x, y, 3, 0, Math.PI * 2);
      context.fillStyle = 'red';
      context.fill();
      vue.blinkVertex({ x, y }, canvas);
    };

    vue.prototype.$makeFaceOnCanvas = ({ color, vertices }: Face, canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
      vertices.forEach((vertex) => {
        context.beginPath();
        context.moveTo(vertex.x, vertex.y);
        vertex.next.forEach((next) => {
          context.lineTo(next.x, next.y);
        });
        context.closePath();
        context.fillStyle = color;
        context.fill();
      });
    };

    vue.prototype.$clearCanvas = (canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    vue.prototype.$getColorAverage = ({ vertices }: Face, canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
      let [{x: x1, y: y1}, {x: x2, y: y2}, {x: x3, y: y3}] = vertices;
      console.log(x1, y1, x2, y2, x3, y3);

      let biggestX = Math.max(x1, x2, x3);
      let biggestY = Math.max(y1, y2, y3);
      let smallestX = Math.min(x1, x2, x3);
      let smallestY = Math.min(y1, y2, y3);

    };

    vue.blinkVertex = ({ x, y }: MousePosition, canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
    };
  },
};

export default canvasHelper;
