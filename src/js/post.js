export default class Post {
  constructor() {
    this.defaultPost = { title: '', body: '', cursorPosition: 0, saved: false };
    this.storedPost = {};
  }

  load(callback) {
    chrome.storage.sync.get(this.defaultPost, (post) => {
      this.storedPost = post;
      callback(post);
    });
  }
}
