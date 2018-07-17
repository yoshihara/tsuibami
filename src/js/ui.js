import $ from 'jquery';
import MessageArea from './ui/message-area.js';

export default class UI {
  constructor() {
    this.messageArea = new MessageArea();
  }

  // getter & setter
  // TODO: class名じゃなくてdata attributesにしたい
  title(val) {
    if (val == null) {
      return $('.post__title').val();
    } else {
      $('.post__title').val(val);
      return undefined;
    }
  }

  body(val) {
    if (val == null) {
      return $('.post__body').val();
    } else {
      $('.post__body').val(val);
      return undefined;
    }
  }

  teamName(val) {
    if (val == null) {
      return $('.team__name').text();
    } else {
      $('.team__name').text(val);
      return undefined;
    }
  }

  teamIcon(val) {
    if (val == null) {
      return $('.team__icon')[0].src;
    } else {
      $('.team__icon')[0].src = val;
      return undefined;
    }
  }

  savedPostLink(val) {
    if (val == null) {
      return $('.esa__link').attr('href');
    } else {
      $('.esa__link').attr('href', val);
      return undefined;
    }
  }

  savedStatus(val) {
    $('.esa__post-button').text(val);
    return undefined;
  }

  cursorPosition(val) {
    if (val == null) {
      return $('.post__body')[0].selectionStart;
    } else {
      let targetClass = '.post__body';

      $(targetClass).focus();
      $(targetClass)[0].selectionStart = val;
      $(targetClass)[0].selectionEnd = val;

      return undefined;
    }
  }

  // check
  checkedclear(val) {
    if (val == null) {
      return $('.esa__post_with-clear').prop('checked');
    } else {
      $('.esa__post_with-clear').prop('checked', val);
      return undefined;
    }
  }

  // toggle
  // TODO: targetごとに分割してクラス化し、必要なpurposeだけにする
  toggle(target, purpose, value) {
    let targetDom = null;
    switch (target) {
      case 'save-button':
        targetDom = '.esa__post-button';
        break;
      case 'option-link':
        targetDom = '.option__link';
        break;
    }

    switch (purpose) {
      case 'disabled': // save-button用
        $(targetDom).prop(purpose, value ? 'disabled' : null);
        break;
      case 'show': // option-link用
        if (value) {
          $(targetDom).show();
        } else {
          $(targetDom).hide();
        }
        break;
    }
  }
}
