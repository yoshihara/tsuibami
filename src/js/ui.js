import $ from 'jquery';
import MessageArea from './ui/message-area.js';

export default class UI {
  constructor() {
    this.messageArea = new MessageArea();
  }

  // TODO: class名じゃなくてdata attributesにしたい
  titleDom() {
    return $('.post__title');
  }

  // getter & setter
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
  toggleSavedStatusMessage(val) {
    let message = val ? 'Saving...' : 'Save as WIP';
    $('.esa__post-button').text(message);
    return undefined;
  }

  toggleDisabledSaveButton(value) {
    $('.esa__post-button').prop('disabled', value ? 'disabled' : null);
  }

  toggleDisplayOptionLink(value) {
    let targetDom = '.option__link';

    value ? $(targetDom).show() : $(targetDom).hide();
  }
}
