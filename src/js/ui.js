import $ from "jquery";

export default class UI {
  constructor() {
  }

  // getter & setter
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
  saveButtonDisabled(disabled) {
    $(".esa__post-button").prop("disabled", disabled ? "disabled" : null);
  }

  // misc
  focusBodyfirst() {
    $(".post__body").attr("tabindex", "1"); // Focus body textarea
  }
}
