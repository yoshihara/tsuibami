import $ from "jquery";

export default class UI {
  constructor() {
  }

  // getter & setter
  // TODO: class名じゃなくてdata attributesにしたい
  title(val) {
    if (val == null) {
      return $(".post__title").val();
    } else {
      $(".post__title").val(val);
      return undefined;
    }
  }

  body(val) {
    if (val == null) {
      return $(".post__body").val();
    } else {
      $(".post__body").val(val);
      return undefined;
    }
  }

  teamName(val) {
    if (val == null) {
      return $(".team__name").text();
    } else {
      $(".team__name").text(val);
      return undefined;
    }
  }

  savedPostLink(val) {
    if (val == null) {
      return $(".esa__link").attr("href");
    } else {
      $(".esa__link").attr("href", val);
      return undefined;
    }
  }

  checkedclear(val) {
    if (val == null) {
      return $(".esa__post_with-clear").prop("checked");
    } else {
      $(".esa__post_with-clear").prop("checked", val);
      return undefined;
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
