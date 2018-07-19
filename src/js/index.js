'use strict';

import $ from 'jquery';
import _ from 'lodash';
import Promise from 'bluebird';
import '../../lib/jquery.selection';
import '../../lib/jquery.esarea';
import Ui from './ui';
import Post from './post';
import Esa from './esa';

let ui = new Ui();
let post = new Post();
let esa;

const loadPost = function() {
  Post.load(function(loadedPost) {
    post = loadedPost;
    ui.toggleDisabledSaveButton(post.saved);

    ui.title = post.title;
    ui.body = post.body;
    if (ui.title != '') {
      // Move cursor at previous position
      ui.cursorPosition = post.cursorPosition;
    }
  });
};

const setPreviousState = function() {
  return new Promise(function(resolve, reject) {
    let defaultConfig = {
      teamName: '',
      token: '',
      teamIcon: '',
      savedPostLink: '',
      postId: '',
    };
    chrome.storage.sync.get(defaultConfig, function(config) {
      if (!config.teamName || !config.token) {
        ui.toggleDisplayOptionLink(true);
        ui.teamName = 'Configuration failed';

        reject('Please configure options (\\( ˘⊖˘)/)');
      } else {
        esa = new Esa(config);

        ui.toggleDisplayOptionLink(false);

        if (config.savedPostLink != '') {
          ui.savedPostLink = config.savedPostLink;
        } else {
          // NOTE: 0.2.1以前の後方互換性のための対応
          // TODO: 次々回のリリースで削除する（storageから取得する部分も一緒に削除する）
          ui.savedPostLink = `https://${config.teamName}.esa.io/posts/${
            config.postId
          }`;
        }

        ui.teamName = config.teamName;
        ui.teamIcon = config.teamIcon;

        resolve();
      }
    });
  });
};

const searchPost = function() {
  return new Promise(function(resolve, reject) {
    let [category, title] = Post.splitCategory(ui.title);

    let q = `name:${title}`;
    if (category.length != 0) q = `${q} category:${category}`;

    let filterPostsFunc = function(response) {
      // nameによる検索は部分一致のため、完全一致させるために検索結果から更に絞り込んでいる
      let hitPost = Post.filterPosts(title, category, response);

      let postId = hitPost ? hitPost.number : undefined;
      resolve(postId);
    };

    esa.search(q, filterPostsFunc, reject);
  });
};

const savePost = function(postId) {
  return new Promise(function(resolve, reject) {
    let [category, title] = Post.splitCategory(ui.title);

    let postData = {
      id: postId,
      name: title,
      category: category,
      body_md: ui.body,
      message: 'from tsuibami',
    };

    esa.save(postData, resolve, reject);
  });
};

const updateStoredPost = function(response) {
  post.saved = true;
  post.savedPostLink = response.url;
  if (ui.isClearCheckBoxChecked) {
    post.title = '';
    post.body = '';
    post.cursorPosition = 0;
  } else {
    // 保存したタイトルによっては末尾に "(2)" などの表記がesaによってつけられていたり、タイトル無しで保存した場合にカテゴリが変わっている可能性があるため、内容を更新する
    post.title = response.full_name;
  }

  return new Promise(function(resolve, reject) {
    post.store(
      () => {
        resolve(response);
      },
      () => {
        reject(response);
      },
    );
  });
};

const updateUI = function(response) {
  ui.toggleDisabledSaveButton(true);

  ui.title = post.title;
  ui.body = post.body;

  ui.savedPostLink = post.savedPostLink;

  let message;
  // 最初の保存の時だけメッセージを変える
  if (response.revision_number == 1) {
    message = 'created!';
  } else {
    message = 'updated!';
  }
  notifySuccess(message);
};

const notifySuccess = function(msg) {
  showMessage(msg + ' (\\( ⁰⊖⁰)/)', true);
};

const notifyError = function(msg) {
  console.log(msg);
  let message = msg.hasOwnProperty('statusText') ? msg.statusText : msg;
  message = msg.hasOwnProperty('status')
    ? `${message} (${msg.status})`
    : message;
  showMessage(message);
};

const showMessage = function(message, succeeded) {
  if (succeeded) {
    ui.messageArea.showMessageOnSuccess(message);
  } else {
    ui.messageArea.showMessageOnFailure(message);
  }
};

const storeTitle = function() {
  let title = ui.title;

  if (title != post.title) {
    post.title = title;
    post.saved = false;
    post.store(function() {}, showErrorMessage);
    ui.toggleDisabledSaveButton(false);
  }
};

const storeBody = function() {
  let body = ui.body;

  if (body != post.body) {
    post.body = body;
    post.saved = false;
    ui.toggleDisabledSaveButton(false);
  }

  let cursorPosition = ui.cursorPosition;
  if (cursorPosition != post.cursorPosition) {
    post.cursorPosition = cursorPosition;
  }
  post.store(function() {}, showErrorMessage);
};

const storeCursorPosition = function() {
  let cursorPosition = ui.cursorPosition;
  if (cursorPosition != post.cursorPosition) {
    post.cursorPosition = cursorPosition;
    post.store(function() {}, showErrorMessage);
  }
};

const showErrorMessage = function() {
  let message;
  if (chrome.runtime.lastError === undefined) message = 'unknown error';
  else message = chrome.runtime.lastError.message;

  showMessage('Error: ' + message, false);
};

const runSaveProcess = function() {
  ui.toggleDisabledSaveButton(true);
  ui.toggleSavedStatusMessage(true);
  searchPost()
    .then(savePost)
    .then(updateStoredPost)
    .then(updateUI)
    .catch(notifyError)
    .finally(function() {
      ui.toggleSavedStatusMessage(false);
    });
};

const runSaveProcessByShortcut = function(event) {
  // Ctrl+s or Cmd+s
  if ((event.metaKey || event.ctrlKey) && event.keyCode == 83) {
    event.preventDefault();
    runSaveProcess();
  }
};

$(function() {
  loadPost();
  setPreviousState().catch(notifyError);

  ui.titleDom.on('keyup', _.debounce(storeTitle, 200));
  ui.bodyDom.on('keyup', _.debounce(storeBody, 200));
  ui.bodyDom.on('mouseup', storeCursorPosition);

  ui.titleDom.on('keydown', runSaveProcessByShortcut);
  ui.bodyDom.on('keydown', runSaveProcessByShortcut);

  ui.bodyDom.esarea();

  ui.postButtonDom.on('click', runSaveProcess);
});
