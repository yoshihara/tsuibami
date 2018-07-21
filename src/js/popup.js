'use strict';

import Promise from 'bluebird';

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
    Post.load((loadedPost) => {
      this.post = loadedPost;
      this.syncSaveButtonWithPost();

      this.ui.post = this.post;
      if (this.ui.title != '') {
        // Move cursor at previous position
        this.ui.cursorPosition = this.post.cursorPosition;
      }
    });
  }

  setPreviousState() {
    return new Promise((resolve, reject) => {
      let defaultConfig = {
        teamName: '',
        token: '',
        teamIcon: '',
      };
      chrome.storage.sync.get(defaultConfig, (config) => {
        if (!config.teamName || !config.token) {
          this.ui.toggleDisplayOptionLink(true);
          this.ui.team = { teamName: 'Configuration failed' };

          reject('Please configure options (\\( ˘⊖˘)/)');
        }

        this.esa = new Esa(config);

        this.ui.toggleDisplayOptionLink(false);
        this.ui.team = config;

        resolve();
      });
    });
  }

  setPreviousSavedPostLink() {
    return new Promise((resolve, reject) => {
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
        resolve();
      });
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
        console.error(`error: invalid target '${targetName}' is specified`);
        return;
    }

    Object.keys(hooks).forEach((key) => {
      targetDom.on(key, hooks[key]);
    });
  }

  save() {
    this.ui.toggleDisabledSaveButton(true);
    this.ui.toggleUploadingStatus(true);

    (async () => {
      let postId = await this.searchTargetPostInEsa();
      let response = await this.uploadPost(postId);

      await this.syncPostWithEsaResponse(response);
      await this.syncUIWithPost(response);

      await this.notifySuccess(response);
    })()
      .catch((error) => this.notifyError(error))
      .finally(() => {
        this.ui.toggleUploadingStatus(false);
      });
  }

  storeBody() {
    let body = this.ui.body;

    if (body != this.post.body) {
      this.post.body = body;
      this.post.saved = false;
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
    return new Promise((resolve, reject) => {
      let [category, title] = Post.splitCategory(this.ui.title);

      let q = `name:${title}`;
      if (category.length != 0) q = `${q} category:${category}`;

      let filterPostsFunc = (response) => {
        // nameによる検索は部分一致のため、完全一致させるために検索結果から更に絞り込んでいる
        let hitPost = Post.filterPosts(title, category, response);

        let postId = hitPost ? hitPost.number : undefined;
        resolve(postId);
      };

      this.esa.search(q, filterPostsFunc, reject);
    });
  }

  uploadPost(postId) {
    return new Promise((resolve, reject) => {
      let [category, title] = Post.splitCategory(this.ui.title);

      let postData = {
        id: postId,
        name: title,
        category: category,
        body_md: this.ui.body,
        message: 'from tsuibami',
      };

      this.esa.save(postData, resolve, reject);
    });
  }

  syncPostWithEsaResponse(response) {
    this.post.saved = true;
    this.post.savedPostLink = response.url;
    if (this.ui.isClearCheckBoxChecked) {
      this.post.title = '';
      this.post.body = '';
      this.post.cursorPosition = 0;
    } else {
      // 保存したタイトルによっては末尾に "(2)" などの表記がesaによってつけられていたり、タイトル無しで保存した場合にカテゴリが変わっている可能性があるため、内容を更新する
      this.post.title = response.full_name;
    }

    return new Promise((resolve, reject) => {
      this.post.store(
        () => {
          this.syncSaveButtonWithPost();
          resolve(response);
        },
        () => {
          reject(response);
        },
      );
    });
  }

  syncUIWithPost(response) {
    return new Promise((resolve, _reject) => {
      this.ui.post = this.post;

      this.ui.savedPostLink = this.post.savedPostLink;
      resolve(response);
    });
  }

  syncSaveButtonWithPost() {
    this.ui.toggleDisabledSaveButton(this.post.saved);
  }

  notifySuccess(response) {
    // 最初の保存の時だけメッセージを変える
    let message = response.revision_number == 1 ? 'created!' : 'updated!';
    this.showMessage(message + ' (\\( ⁰⊖⁰)/)', true);
  }

  notifyError(msg) {
    console.log(msg);
    let message = msg.hasOwnProperty('statusText') ? msg.statusText : msg;
    message = msg.hasOwnProperty('status')
      ? `${message} (${msg.status})`
      : message;
    this.showMessage(message);
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
