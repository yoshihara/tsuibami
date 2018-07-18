import $ from 'jquery';
import MessageArea from './ui/message-area.js';

export default class UI {
  constructor() {
    this.messageArea = new MessageArea();
  }

  // TODO: class名じゃなくてdata attributesにしたい
  get titleDom() {
    return $('.post__title');
  }

  get bodyDom() {
    return $('.post__body');
  }

  get postButtonDom() {
    return $('.esa__post-button');
  }

  // getter & setter
  get title() {
    return $('.post__title').val();
  }

  set title(val) {
    $('.post__title').val(val);
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
