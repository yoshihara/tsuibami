export default class Post {
  constructor() {
    this.defaultPost = { title: '', body: '', cursorPosition: 0, saved: false };
    // TOOD: storedPostはあとで名前を変えたい
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
    ['title', 'body', 'saved', 'cursorPosition', 'postId'].forEach((key) => {
      if (post.hasOwnProperty(key)) {
        this[key] = post[key];
      }
    });
  }
}
