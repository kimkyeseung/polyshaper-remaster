import { ColorData } from '@/models/interfaces';

function deepClone(obj) {
  if (obj === null || typeof (obj) !== 'object') return obj;

  const copy = obj.constructor();

  for (const attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = deepClone(obj[attr]);
    }
  }

  return copy;
}

const utilityHelper = {
  install(vue) {
    vue.prototype.$deepClone = deepClone;

    vue.prototype.$stringifyColorData = ({ r, g, b }: ColorData): string => `rgb(${r}, ${g}, ${b})`;
  },
};

export default utilityHelper;
