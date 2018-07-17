export default class Post {
  constructor() {
    this.defaultPost = { title: '', body: '', cursorPosition: 0, saved: false };
    this.storedKeys = ['title', 'body', 'saved', 'cursorPosition', 'postId'];

    this.title = null;
    this.body = null;
    this.saved = true;
    this.cursorPosition = null;
    this.postId = null;
  }

  load(callback) {
    chrome.storage.sync.get(this.defaultPost, (post) => {
      this.update(post);
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

  store(callback) {
    let data = {};
    // Post全部をstorageに入れると余計なものまで保持するため、storedKeysのキーと値の組み合わせだけ抜き出す
    this.storedKeys.forEach((key) => {
      data[key] = this[key];
    });

    chrome.storage.sync.set(data, function() {
      if (chrome.runtime.lastError) {
        callback();
      }
    });
  }
}
