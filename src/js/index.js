import $ from 'jquery';
import _ from 'lodash';
import Promise from 'bluebird';
import '../../lib/jquery.selection';
import '../../lib/jquery.esarea';
import Ui from './ui';
import Post from './post';

let ui = new Ui();
let post = new Post();

const loadPost = function() {
  post.load(function(post) {
    ui.toggleDisabledSaveButton(post.saved);

    ui.title(post.title);
    ui.body(post.body);
    if (ui.title() != '') {
      // Move cursor at previous position
      ui.cursorPosition(post.cursorPosition);
    }
  });
};

const getConfig = function() {
  return new Promise(function(resolve, reject) {
    let defaultConfig = { teamName: '', token: '', teamIcon: '', postId: '' };
    chrome.storage.sync.get(defaultConfig, function(config) {
      if (!config.teamName || !config.token) {
        ui.toggleDisplayOptionLink(true);
        ui.teamName('Configuration failed');

        reject('Please configure options (\\( ˘⊖˘)/)');
      } else {
        ui.toggleDisplayOptionLink(false);

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
      // nameによる検索は部分一致のため、完全一致させるために検索結果から更に絞り込んでいる
      let filterQuery = { name: title };
      if (category.length == 0) {
        filterQuery.category = null;
      } else {
        filterQuery.category = category;
      }
      let hitPost = _.find(response.posts, filterQuery);

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

const updateStoredPost = function(response) {
  let newPostId = response.number;

  post.saved = true;
  post.postId = newPostId;
  if (ui.checkedclear()) {
    post.title = '';
    post.body = '';
    post.cursorPosition = 0;
  } else {
    // 保存したタイトルによっては末尾に "(2)" などの表記がesaによってつけられている可能性があるため、再度表示し直す
    post.title = response.name;
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

  ui.title(post.title);
  ui.body(post.body);

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

  if (title != post.title) {
    post.title = title;
    post.saved = false;
    post.store(function() {}, showErrorMessage);
    ui.toggleDisabledSaveButton(false);
  }
};

const storeBody = function() {
  let body = ui.body();

  if (body != post.body) {
    post.body = body;
    post.saved = false;
    ui.toggleDisabledSaveButton(false);
  }

  let cursorPosition = ui.cursorPosition();
  if (cursorPosition != post.cursorPosition) {
    post.cursorPosition = cursorPosition;
  }
  post.store(function() {}, showErrorMessage);
};

const storeCursorPosition = function() {
  let cursorPosition = ui.cursorPosition();
  if (cursorPosition != post.cursorPosition) {
    post.cursorPosition = cursorPosition;
    post.store(function() {}, showErrorMessage);
  }
};

const showErrorMessage = function() {
  showMessage('Error: ' + chrome.runtime.lastError.message, false);
};

const runSaveProcess = function() {
  ui.toggleDisabledSaveButton(true);
  ui.toggleSavedStatusMessage(true);
  getConfig()
    .then(searchPost)
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
  getConfig().catch(notifyError);

  ui.titleDom.on('keyup', _.debounce(storeTitle, 200));
  ui.bodyDom.on('keyup', _.debounce(storeBody, 200));
  ui.bodyDom.on('mouseup', storeCursorPosition);

  ui.titleDom.on('keydown', runSaveProcessByShortcut);
  ui.bodyDom.on('keydown', runSaveProcessByShortcut);

  ui.bodyDom.esarea();

  ui.postButtonDom.on('click', runSaveProcess);
});
