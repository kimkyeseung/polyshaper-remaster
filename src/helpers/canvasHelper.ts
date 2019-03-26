import { MousePosition } from '@/models/interfaces';

const canvasHelper = {
  install(vue) {
    vue.prototype.$makeVertex = ({ x, y }: MousePosition, canvas: HTMLCanvasElement) => {
      const context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
      context.beginPath();
      context.arc(x, y, 3, 0, Math.PI * 2);
      context.fillStyle = 'red';
      context.fill();
    };
  },
};

export default canvasHelper;
