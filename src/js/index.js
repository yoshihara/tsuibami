import $ from 'jquery';
import _ from 'lodash';
import Promise from 'bluebird';
import '../../lib/jquery.selection';
import '../../lib/jquery.esarea';
import Ui from './ui';

let ui = new Ui();
window.ui = ui; // for debug

// TODO できればグローバルで定義しないほうがよさそう
let storedPost = { title: '', body: '', cursorPosition: 0, saved: false };

const loadPost = function() {
  let defaultPost = { title: '', body: '', cursorPosition: 0, saved: false };
  chrome.storage.sync.get(defaultPost, function(post) {
    storedPost = post;

    // TODO: この辺の処理を ui.loadPost() にまとめたい
    ui.toggle('save-button', 'disabled', post.saved);

    ui.title(post.title);
    ui.body(post.body);
    if (ui.title() != '') {
      // Move cursor at previous position
      ui.moveFocus('body', post.cursorPosition);
    }
  });
};

const getConfig = function() {
  return new Promise(function(resolve, reject) {
    let defaultConfig = { teamName: '', token: '', teamIcon: '', postId: '' };
    chrome.storage.sync.get(defaultConfig, function(config) {
      if (!config.teamName || !config.token) {
        ui.toggle('option-link', 'show', true);
        ui.teamName('Configuration failed');

        reject('Please configure options (\\( ˘⊖˘)/)');
      } else {
        ui.toggle('option-link', 'show', false);

        if (config.postId != '') {
          let link = `https://${config.teamName}.esa.io/posts/${config.postId}`;
          ui.savedPostLink(link);
        }

        ui.teamName(config.teamName);
        ui.teamIcon(config.teamIcon);

        resolve(config);
      }
    });
  });
};

const searchPost = function(config) {
  return new Promise(function(resolve, reject) {
    let title = ui.title();
    let category = '';

    if (hasCategory(title)) {
      category = /(.+)\/.+/.exec(title)[1];
      title = /.+\/(.+)/.exec(title)[1];
    }

    let q = `name:${title}`;
    if (category.length != 0) {
      q = `${q} category:${category}`;
    }

    $.ajax({
      type: 'GET',
      url: `https://api.esa.io/v1/teams/${config.teamName}/posts`,
      data: {
        q: q,
        access_token: config.token,
      },
    }).then(function(response) {
      let hitPost;
      // カテゴリ無しだけを検索する方法がわからなかったので別途絞込している
      if (category.length == 0) {
        hitPost = _.find(response.posts, { name: title, category: null });
      } else {
        // 1つしかない想定
        hitPost = response.posts[0];
      }

      // 記事があった場合は更新するためIDを保存する
      if (hitPost) {
        config.postId = hitPost.number;
      } else {
        config.postId = undefined;
      }
      chrome.storage.sync.set(config, function() {
        resolve(config);
      });
    }, reject);
  });
};

const savePost = function(config) {
  return new Promise(function(resolve, reject) {
    let type;
    let url = `https://api.esa.io/v1/teams/${config.teamName}/posts`;
    let title = ui.title();
    let body = ui.body();

    let post = {
      name: title,
      category: '',
      body_md: body,
      message: 'from tsuibami',
    };

    if (hasCategory(title)) {
      post['category'] = /(.+)\/.+/.exec(title)[1];
      post['name'] = /.+\/(.+)/.exec(title)[1];
    }

    let postId = config.postId;
    if (postId) {
      type = 'PATCH';
      url = url + '/' + postId;
    } else {
      type = 'POST';
    }

    $.ajax({
      type: type,
      url: url,
      data: {
        post: post,
        access_token: config.token,
      },
    }).then(resolve, reject);
  });
};

const storePostAsSaved = function(response) {
  return new Promise(function(resolve, reject) {
    let newPostId = response.number;
    chrome.storage.sync.set({ saved: true, postId: newPostId }, function() {
      storedPost.saved = true;
      resolve(response);
    });
  });
};

const updatePostTitleDisplay = function(response) {
  // 保存したタイトルによっては末尾に "(2)" などの表記がesaによってつけられている可能性があるため、再度表示し直す
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.set({ title: response.name }, function() {
      resolve(response);
    });
  });
};

const clearPost = function(response) {
  if (!ui.checkedclear()) {
    return new Promise(function(resolve, reject) {
      resolve(response);
    });
  }
  return new Promise(function(resolve, reject) {
    storedPost = { title: '', body: '', cursorPosition: 0, saved: true };
    chrome.storage.sync.set(storedPost, function() {
      if (chrome.runtime.lastError) {
        reject(response);
      } else {
        resolve(response);
      }
    });
  });
};

const updateUI = function(response) {
  ui.toggle('save-button', 'disabled', true);

  if (!ui.checkedclear()) {
    ui.title(response.full_name);
    ui.moveFocus('body');
  } else {
    ui.title('');
    ui.body('');
  }

  ui.savedPostLink(response.url);

  let message;
  // 最初の保存の時だけメッセージを変える
  if (response.revision_number == 1) {
    message = 'created!';
  } else {
    message = 'updated!';
  }
  notifySuccess(message);
};

const hasCategory = function(title) {
  return /.+\/.+/.test(title);
};

const notifySuccess = function(msg) {
  showMessage(msg + ' (\\( ⁰⊖⁰)/)', true);
};

const notifyError = function(msg) {
  console.log(msg);
  showMessage(msg);
};

const showMessage = function(message, succeeded) {
  if (succeeded) {
    ui.messageArea.showMessageOnSuccess(message);
  } else {
    ui.messageArea.showMessageOnFailure(message);
  }
};

const storeTitle = function() {
  let title = ui.title();

  if (title != storedPost.title) {
    storedPost.title = title;
    storedPost.saved = false;
    store({ title: title, saved: false });
    ui.toggle('save-button', 'disabled', false);
  }
};

const storeBody = function() {
  let body = ui.body();

  if (body != storedPost.body) {
    storedPost.body = body;
    storedPost.saved = false;
    ui.toggle('save-button', 'disabled', false);
  }

  let cursorPosition = $('.post__body')[0].selectionStart;
  if (cursorPosition != storedPost.cursorPosition) {
    storedPost.cursorPosition = cursorPosition;
  }
  store(storedPost);
};

const storeCursorPosition = function() {
  let cursorPosition = $('.post__body')[0].selectionStart;
  if (cursorPosition != storedPost.cursorPosition) {
    store({ cursorPosition: cursorPosition });
  }
};

const store = function(data) {
  chrome.storage.sync.set(data, function() {
    if (chrome.runtime.lastError) {
      showMessage('Error: ' + chrome.runtime.lastError.message, false);
    }
  });
};

const showSavedStatus = function(saving) {
  $('.esa__post-button').text(saving ? 'Saving...' : 'Save as WIP');
};

const runSaveProcess = function() {
  ui.toggle('save-button', 'disabled', true);
  showSavedStatus(true);
  getConfig()
    .then(searchPost)
    .then(savePost)
    .then(storePostAsSaved)
    .then(updatePostTitleDisplay)
    .then(clearPost)
    .then(updateUI)
    .catch(notifyError)
    .finally(function() {
      showSavedStatus(false);
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
  getConfig().catch(notifyError);

  $('.post__title').on('keyup', _.debounce(storeTitle, 200));
  $('.post__body').on('keyup', _.debounce(storeBody, 200));
  $('.post__body').on('mouseup', storeCursorPosition);

  $('.post__title').on('keydown', runSaveProcessByShortcut);
  $('.post__body').on('keydown', runSaveProcessByShortcut);

  $('.post__body').esarea();

  $('.esa__post-button').on('click', runSaveProcess);
});
