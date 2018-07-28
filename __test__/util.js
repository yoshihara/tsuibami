'use strict';

export default class Util {
  static merge(defaultObj, obj) {
    const copiedDefaultObj = Object.assign({}, defaultObj);
    return Object.assign(copiedDefaultObj, obj);
  }
}
