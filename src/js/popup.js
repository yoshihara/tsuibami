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

      this.ui.title = this.post.title;
      this.ui.body = this.post.body;
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
        savedPostLink: '',
        postId: '',
      };
      chrome.storage.sync.get(defaultConfig, (config) => {
        if (!config.teamName || !config.token) {
          this.ui.toggleDisplayOptionLink(true);
          this.ui.teamName = 'Configuration failed';

          reject('Please configure options (\\( ˘⊖˘)/)');
        }

        this.esa = new Esa(config);

        this.ui.toggleDisplayOptionLink(false);

        if (config.savedPostLink != '') {
          this.ui.savedPostLink = config.savedPostLink;
        } else {
          // NOTE: 0.2.1以前の後方互換性のための対応
          // TODO: 次々回のリリースで削除する（storageから取得する部分も一緒に削除する）
          this.ui.savedPostLink = `https://${config.teamName}.esa.io/posts/${
            config.postId
          }`;
        }

        this.ui.teamName = config.teamName;
        this.ui.teamIcon = config.teamIcon;

        resolve();
      });
    });
  }

  runSaveProcess() {
    this.ui.toggleDisabledSaveButton(true);
    this.ui.toggleUploadingStatus(true);

    this.searchPost()
      .then(this.savePost.bind(this))
      .then(this.updateStoredPost.bind(this))
      .then(this.syncUIWithPost.bind(this))
      .catch(this.notifyError.bind(this))
      .finally(() => {
        this.ui.toggleUploadingStatus(false);
      });
  }

  searchPost() {
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

  savePost(postId) {
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

  updateStoredPost(response) {
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
    this.ui.title = this.post.title;
    this.ui.body = this.post.body;

    this.ui.savedPostLink = this.post.savedPostLink;

    // TODO: ここから下notifySuccessに移動
    let message;
    // 最初の保存の時だけメッセージを変える
    if (response.revision_number == 1) {
      message = 'created!';
    } else {
      message = 'updated!';
    }
    this.notifySuccess(message);
  }

  syncSaveButtonWithPost() {
    this.ui.toggleDisabledSaveButton(this.post.saved);
  }

  notifySuccess(msg) {
    this.showMessage(msg + ' (\\( ⁰⊖⁰)/)', true);
  }

  notifyError(msg) {
    console.log(msg);
    let message = msg.hasOwnProperty('statusText') ? msg.statusText : msg;
    message = msg.hasOwnProperty('status')
      ? `${message} (${msg.status})`
      : message;
    this.showMessage(message);
  }

  showMessage(message, succeeded) {
    if (succeeded) {
      this.ui.messageArea.showMessageOnSuccess(message);
    } else {
      this.ui.messageArea.showMessageOnFailure(message);
    }
  }
}
