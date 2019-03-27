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
      vertices.forEach(vertex => {
        context.beginPath();
        context.moveTo(vertex.x, vertex.y);
        vertex.next.forEach(next => {
          context.lineTo(next.x, next.y);
        });
        context.closePath();
        context.fillStyle = color;
        context.fill();
      });
    };


    vue.blinkVertex = ({ x, y }: MousePosition, canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
    };

    vue.clearCanvas = (canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  },
};

export default canvasHelper;
