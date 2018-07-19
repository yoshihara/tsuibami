'use strict';

import $ from 'jquery';
import _ from 'lodash';

import Popup from './popup';

const popup = new Popup();

const storeTitle = function() {
  let title = popup.ui.title;

  if (title != popup.post.title) {
    popup.post.title = title;
    popup.post.saved = false;
    popup.post.store(function() {}, showErrorMessage);
    popup.ui.toggleDisabledSaveButton(false);
  }
};

const storeBody = function() {
  let body = popup.ui.body;

  if (body != popup.post.body) {
    popup.post.body = body;
    popup.post.saved = false;
    popup.ui.toggleDisabledSaveButton(false);
  }

  let cursorPosition = popup.ui.cursorPosition;
  if (cursorPosition != popup.post.cursorPosition) {
    popup.post.cursorPosition = cursorPosition;
  }
  popup.post.store(function() {}, showErrorMessage);
};

const storeCursorPosition = function() {
  let cursorPosition = popup.ui.cursorPosition;
  if (cursorPosition != popup.post.cursorPosition) {
    popup.post.cursorPosition = cursorPosition;
    popup.post.store(function() {}, showErrorMessage);
  }
};

const showErrorMessage = function() {
  let message;
  if (chrome.runtime.lastError === undefined) message = 'unknown error';
  else message = chrome.runtime.lastError.message;

  popup.showMessage('Error: ' + message, false);
};

const saveByShortcut = function(event) {
  // Ctrl+s or Cmd+s
  if ((event.metaKey || event.ctrlKey) && event.keyCode == 83) {
    event.preventDefault();
    popup.save();
  }
};

$(function() {
  popup.setPreviousPost();
  popup
    .setPreviousState()
    .then(popup.setPreviousSavedPostLink.bind(popup))
    .catch(popup.notifyError);

  popup.setHooks('title', {
    keyup: _.debounce(storeTitle, 200),
    keydown: saveByShortcut,
  });

  popup.setHooks('body', {
    keyup: _.debounce(storeBody, 200),
    keydown: saveByShortcut,
    mouseup: storeCursorPosition,
  });

  popup.setHooks('post-button', { click: popup.save.bind(popup) });
});
