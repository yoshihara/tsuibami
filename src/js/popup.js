'use strict';

import Promise from 'bluebird';
import _ from 'lodash';

import Ui from './ui';
import Post from './post';
import Esa from './esa';

export default class Popup {
  constructor() {
    this.ui = new Ui();
    this.post = new Post();
    this.esa = undefined;
  }

  setPreviousPost() {
    this.ui.focusTitle();

    Post.load((loadedPost) => {
      this.post = loadedPost;
      this.syncSaveButtonWithPost();

      this.ui.post = this.post;
      if (this.post.title != '') {
        // Move cursor at previous position
        this.ui.cursorPosition = this.post.cursorPosition;
      }
    });
  }

  async setPreviousState() {
    let defaultConfig = {
      teamName: '',
      token: '',
      teamIcon: '',
    };
    chrome.storage.sync.get(defaultConfig, (config) => {
      if (!config.teamName || !config.token) {
        this.ui.toggleDisplayOptionLink(true);
        this.ui.team = { teamName: 'Configuration failed' };

        throw Error('Please configure options (\\( ˘⊖˘)/)');
      }

      this.esa = new Esa(config);

      this.ui.toggleDisplayOptionLink(false);
      this.ui.team = config;
    });
  }

  async setPreviousSavedPostLink() {
    let defaultLinkData = {
      savedPostLink: '',
      postId: '',
    };
    chrome.storage.sync.get(defaultLinkData, (data) => {
      if (data.savedPostLink) {
        this.ui.savedPostLink = data.savedPostLink;
      } else {
        // NOTE: 0.2.1以前の後方互換性のための対応
        // TODO: 次々回のリリースで削除する
        // 合わせてこの関数で行っているsavedPostLinkの設定をsetPreviousPost()に統合する（Postの持つデータとしてsavedPostLinkを使う）
        this.ui.savedPostLink = `https://${this.ui.teamName}.esa.io/posts/${
          data.postId
        }`;
      }
    });
  }

  setHooks(targetName, hooks) {
    let targetDom;
    switch (targetName) {
      case 'title':
        targetDom = this.ui.titleDom;
        break;
      case 'body':
        targetDom = this.ui.bodyDom;
        break;
      case 'post-button':
        targetDom = this.ui.postButtonDom;
        break;

      default:
        throw Error(`error: invalid target '${targetName}' is specified`);
    }

    Object.keys(hooks).forEach((key) => {
      let hooksForKey = hooks[key];
      if (_.isArray(hooksForKey)) {
        hooksForKey.forEach((func) => {
          targetDom.on(key, func);
        });
      } else {
        targetDom.on(key, hooksForKey);
      }
    });
  }

  async save() {
    this.ui.toggleDisabledSaveButton(true);
    this.ui.toggleUploadingStatus(true);

    try {
      let postId = await this.searchTargetPostInEsa();
      let response = await this.uploadPost(postId);

      await this.syncPostWithEsaResponse(response);
      this.syncUIWithPost();

      this.notifySuccess(response);
    } catch (error) {
      let message = error.hasOwnProperty('statusText')
        ? error.statusText
        : error;
      message = error.hasOwnProperty('status')
        ? `${message} (${error.status})`
        : message;
      this.showMessage(message);
    } finally {
      this.ui.toggleUploadingStatus(false);
    }
  }

  storeTitle() {
    let title = this.ui.title;

    if (title != this.post.title) {
      this.post.update({ title: title, saved: false });
      this.post.store(function() {}, this.showErrorMessage);
      this.ui.toggleDisabledSaveButton(false);
    }
  }

  focusBody() {
    this.ui.focusBody();
  }

  storeBody() {
    let body = this.ui.body;

    if (body != this.post.body) {
      this.post.update({ body: body, saved: false });
      this.ui.toggleDisabledSaveButton(false);
    }

    let cursorPosition = this.ui.cursorPosition;
    if (cursorPosition != this.post.cursorPosition) {
      this.post.cursorPosition = cursorPosition;
    }
    // TODO: bodyが変更されていたらcursorPositionも変更されているはずなので↑のif文の中に↓を入れる
    this.post.store(function() {}, this.showErrorMessage);
  }

  storeCursorPosition() {
    let cursorPosition = this.ui.cursorPosition;

    if (cursorPosition != this.post.cursorPosition) {
      this.post.cursorPosition = cursorPosition;
      this.post.store(function() {}, this.showErrorMessage);
    }
  }

  // private
  // TODO: privateっぽい名前にする？
  searchTargetPostInEsa() {
    // TODO: jQuery捨てるときにPromiseをreturnしないようにしてresolve/rejectをそれぞれreturn/throwを使って置き換える
    return new Promise((resolve, reject) => {
      let [category, title] = Post.splitCategory(this.ui.title);

      let q = `name:${title}`;
      if (category.length != 0) q = `${q} category:${category}`;

      let filterPostsFunc = (response) => {
        // nameによる検索は部分一致のため、完全一致させるために検索結果から更に絞り込んでいる
        let hitPost = _.find(response.posts, {
          name: title,
          category: category.length ? category : null,
        });

        let postId = hitPost ? hitPost.number : undefined;
        resolve(postId);
      };

      this.esa
        .search(q)
        .then(filterPostsFunc)
        .catch(reject);
    });
  }

  uploadPost(postId) {
    // TODO: jQuery捨てるときにPromiseをreturnしないようにしてresolve/rejectをそれぞれreturn/throwを使って置き換える
    return new Promise((resolve, reject) => {
      let [category, title] = Post.splitCategory(this.ui.title);

      let postData = {
        id: postId,
        name: title,
        category: category,
        body_md: this.ui.body,
        message: 'from tsuibami',
      };

      this.esa
        .save(postData)
        .then(resolve)
        .catch(reject);
    });
  }

  async syncPostWithEsaResponse(response) {
    this.post.saved = true;
    this.post.savedPostLink = response.url;
    if (this.ui.isClearCheckBoxChecked) {
      this.post.update({ title: '', body: '', cursorPosition: '' });
    } else {
      // 保存したタイトルによっては末尾に "(2)" などの表記がesaによってつけられていたり、タイトル無しで保存した場合にカテゴリが変わっている可能性があるため、内容を更新する
      this.post.title = response.full_name;
    }

    this.post.store(
      () => {
        this.syncSaveButtonWithPost();
        return response;
      },
      () => {
        throw Error(response);
      },
    );
  }

  syncUIWithPost() {
    this.ui.post = this.post;
    this.ui.savedPostLink = this.post.savedPostLink;
    if (this.post.title === '') this.ui.focusTitle();
  }

  syncSaveButtonWithPost() {
    this.ui.toggleDisabledSaveButton(this.post.saved);
  }

  notifySuccess(response) {
    // 最初の保存の時だけメッセージを変える
    let message = response.revision_number == 1 ? 'created!' : 'updated!';
    this.showMessage(message + ' (\\( ⁰⊖⁰)/)', true);
  }

  showErrorMessage() {
    let message;
    if (chrome.runtime.lastError === undefined) message = 'unknown error';
    else message = chrome.runtime.lastError.message;

    this.showMessage('Error: ' + message, false);
  }

  showMessage(message, succeeded) {
    if (succeeded) {
      this.ui.messageArea.showMessageOnSuccess(message);
    } else {
      this.ui.messageArea.showMessageOnFailure(message);
    }
  }
}
