'use strict';

import _ from 'lodash';

import Popup from './popup';

const popup = new Popup();

const storeTitle = function() {
  popup.storeTitle();
};

const storeBody = function() {
  popup.storeBody();
};

const storeCursorPosition = function() {
  popup.storeCursorPosition();
};

const saveByShortcut = function(event) {
  // Ctrl+s or Cmd+s
  if ((event.metaKey || event.ctrlKey) && event.keyCode == 83) {
    event.preventDefault();
    popup.save();
  }
};

const focusBody = function(event) {
  // Enter
  if (event.keyCode == 13) {
    event.preventDefault();
    popup.focusBody();
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
    keydown: [saveByShortcut, focusBody],
  });

  popup.setHooks('body', {
    keyup: _.debounce(storeBody, 200),
    keydown: saveByShortcut,
    mouseup: storeCursorPosition,
  });

  popup.setHooks('post-button', { click: popup.save.bind(popup) });
});
