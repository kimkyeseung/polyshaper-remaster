function deepClone<T>(object: T, finalObj: T): T {
  const newObject = finalObj || {};
  for (let key in object) {
    let prop = object[key];
    if (prop === newObject) {
      continue;
    }
    if (typeof prop === 'object') {
      object[key] = prop.constructor === Array ? deepClone(prop, []) : Object.create(prop);
    } else {
      object[key] = prop;
    }
  }
  return <T>newObject;
}

const utilityHelper = {
  install(vue) {
    vue.prototype.deepClone = deepClone;
  },
};

export default utilityHelper;
