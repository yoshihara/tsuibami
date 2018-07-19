'use strict';

import $ from 'jquery';
import MessageArea from './ui/message-area.js';

export default class UI {
  constructor() {
    this.messageArea = new MessageArea();
  }

  set post(postObj) {
    this.title = postObj.title;
    this.body = postObj.body;
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

  get body() {
    return $('.post__body').val();
  }

  set body(val) {
    $('.post__body').val(val);
  }

  set teamName(val) {
    $('.team__name').text(val);
  }

  set teamIcon(val) {
    $('.team__icon')[0].src = val;
  }

  set savedPostLink(val) {
    $('.esa__link').attr('href', val);
  }

  get cursorPosition() {
    return $('.post__body')[0].selectionStart;
  }

  set cursorPosition(val) {
    let target = $('.post__body');

    target.focus();
    target[0].selectionStart = val;
    target[0].selectionEnd = val;
  }

  get isClearCheckBoxChecked() {
    return $('.esa__post_with-clear').prop('checked');
  }

  // toggle
  toggleUploadingStatus(val) {
    let message = val ? 'Saving...' : 'Save as WIP';
    $('.esa__post-button').text(message);
  }

  toggleDisabledSaveButton(val) {
    $('.esa__post-button').prop('disabled', val ? 'disabled' : null);
  }

  toggleDisplayOptionLink(val) {
    let target = $('.option__link');

    val ? target.show() : target.hide();
  }
}
