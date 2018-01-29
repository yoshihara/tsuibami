import $ from "jquery";

export default class UI {
  constructor() {
  }

  // getter & setter
  // TODO: class名じゃなくてdata attributesにしたい
  title(val) {
    if (val) {
      $(".post__title").val(val);
      return undefined;
    } else {
      return $(".post__title").val()
    }
  }

  body(val) {
    if (val) {
      $(".post__body").val(val);
      return undefined;
    } else {
      return $(".post__body").val()
    }
  }

  // toggle
  toggle(target, purpose, value) {
    let targetDom = null
    switch (target) {
      case "save-button":
        targetDom = ".esa__post-button";
        break;
      case "option-link":
        targetDom = ".option__link";
        break;
    }

    switch (purpose){
      case "disabled":
        $(targetDom).prop(purpose, value ? "disabled" : null);
        break;
      case "show":
        if (value) {
          $(targetDom).show();
        } else {
          $(targetDom).hide();
        }
        break;
    }
  }

  // focus
  moveFocus(target, position) {
    let targetClass = "";
    if (target == "body") {
      targetClass = ".post__body";
    }

    $(targetClass).focus();
    if (position) {
      $(targetClass)[0].selectionStart = position;
      $(targetClass)[0].selectionEnd = position;
    }
  }
}
