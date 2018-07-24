'use strict';

import Post from '../src/js/post';
jest.unmock('../src/js/post.js');

const post = new Post();

describe('Post', () => {
  describe('constructor', () => {
    it('should have null values for some keys', () => {
      expect(post.title).toBeNull();
      expect(post.body).toBeNull();
      expect(post.saved).toBeNull();
      expect(post.cursorPosition).toBeNull();
      expect(post.savedPostLink).toBeNull();
    });
  });

  describe('#update', () => {
    beforeAll(() => {
      post.title = 'title';
      post.body = '- body';
      post.saved = false;
      post.cursorPosition = 1;
      post.savedPostLink = 'URL';
    });

    it('should update specified values only', () => {
      let postData = { title: 'updated', body: '- body\n- fuga', saved: true };
      post.update(postData);

      expect(post.title).toEqual('updated');
      expect(post.body).toEqual('- body\n- fuga');
      expect(post.saved).toEqual(true);
      expect(post.cursorPosition).toEqual(1); // unchanged
      expect(post.savedPostLink).toEqual('URL'); // unchanged
    });
  });

  describe('#store', () => {
    beforeAll(() => {
      let postData = { title: 'updated', body: '- body\n- fuga', saved: true };
      post.update(postData);
    });

    it('should try to set post to chrome storage', async () => {
      chrome.storage.sync.set = jest.fn((data, callback) => {
        callback();
      });

      let storedData = {
        title: 'updated',
        body: '- body\n- fuga',
        saved: true,
        cursorPosition: 1,
        savedPostLink: 'URL',
      };

      await post.store(() => {}, () => {});
      expect(chrome.storage.sync.set).toBeCalled();

      expect(chrome.storage.sync.set.mock.calls[0][0]).toEqual(storedData);
      expect(typeof chrome.storage.sync.set.mock.calls[0][1]).toEqual(
        'function', // callback
      );
    });

    describe('when set() succeeded', () => {
      beforeAll(() => {
        chrome.storage.sync.set = jest.fn((data, callback) => {
          callback();
        });
      });

      it('should call callback', async () => {
        let callback = jest.fn();
        await post.store(callback, () => {});

        expect(callback).toBeCalled();
      });
    });

    describe('when set() failed', () => {
      beforeAll(() => {
        chrome.storage.sync.set = jest.fn((data, callback) => {
          chrome.runtime.lastError = new Error('error');
          callback();
        });
      });

      it('should call errCallback', async () => {
        let errCallback = jest.fn();
        await post.store(() => {}, errCallback);

        expect(errCallback).toBeCalled();
      });
    });
  });
});
