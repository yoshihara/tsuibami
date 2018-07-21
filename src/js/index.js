'use strict';

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
  popup.storeBody();
};

const storeCursorPosition = function() {
  popup.storeCursorPosition();
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

document.addEventListener('DOMContentLoaded', function() {
  popup.setPreviousPost();
  (async function() {
    await popup.setPreviousState();
    await popup.setPreviousSavedPostLink();
  })().catch((error) => popup.notifyError(error));

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
