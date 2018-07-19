'use strict';

export default class Post {
  constructor() {
    this.storedKeys = [
      'title',
      'body',
      'saved',
      'cursorPosition',
      'savedPostLink',
    ];

    this.storedKeys.forEach((key) => {
      this[key] = null;
    });
  }

  static splitCategory(fullName) {
    if (!this.hasCategory(fullName)) return ['', fullName];
    else {
      let category = /(.+)\/.+/.exec(fullName)[1];
      let title = /.+\/(.+)/.exec(fullName)[1];

      return [category, title];
    }
  }

  static hasCategory(title) {
    return /.+\/.+/.test(title);
  }

  static filterPosts(title, category, response) {
    let filterQuery = { name: title };
    if (category.length == 0) {
      filterQuery.category = null;
    } else {
      filterQuery.category = category;
    }
    return _.find(response.posts, filterQuery);
  }

  static load(callback) {
    let defaultPost = { title: '', body: '', cursorPosition: 0, saved: false };
    chrome.storage.sync.get(defaultPost, (postData) => {
      let post = new this();
      post.update(postData);
      callback(post);
    });
  }

  update(post) {
    this.storedKeys.forEach((key) => {
      if (post.hasOwnProperty(key)) {
        this[key] = post[key];
      }
    });
  }

  store(callback, errCallback) {
    let data = {};
    // Post全部をstorageに入れると余計なものまで保持するため、storedKeysのキーと値の組み合わせだけ抜き出す
    this.storedKeys.forEach((key) => {
      data[key] = this[key];
    });

    chrome.storage.sync.set(data, function() {
      if (chrome.runtime.lastError) {
        errCallback();
      } else {
        callback();
      }
    });
  }
}
