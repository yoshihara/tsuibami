'use strict';

// TODO: Add specs for prototype methods to upload post to esa

import Popup from '../src/js/popup';
jest.unmock('../src/js/popup.js');

import UI from '../src/js/ui';
import Post from '../src/js/post';
import Esa from '../src/js/esa';

import Util from './util';
jest.unmock('./util.js');

let popup;

describe('Popup', () => {
  beforeEach(() => {
    UI.mockClear();
    Post.mockClear();
    Esa.mockClear();
  });

  describe('constructor', () => {
    it('should be set each object except Esa', () => {
      new Popup();

      expect(UI).toHaveBeenCalledTimes(1);
      expect(Post).toHaveBeenCalledTimes(1);
      expect(Esa).not.toHaveBeenCalled();
    });
  });

  describe('#setPreviousPost', () => {
    beforeEach(() => {
      popup = new Popup();
      popup.syncSaveButtonWithPost = jest.fn();
    });

    it('should load post and set post & UI', () => {
      const post = { title: 'title', body: 'body', cursorPosition: 2 };

      Post.load = jest.fn((callback) => {
        callback(post);
      });
      const mockUIObject = UI.mock.instances[0];

      popup.setPreviousPost();

      expect(popup.syncSaveButtonWithPost).toHaveBeenCalledTimes(1);
      expect(mockUIObject.focusTitle).toHaveBeenCalledTimes(1);
      expect(Post.load).toHaveBeenCalledTimes(1);

      expect(popup.post.title).toEqual(post.title);
      expect(popup.ui.post).toEqual(post); // UIはmockされているのでpostがそのまま設定されている
      expect(popup.ui.cursorPosition).toEqual(post.cursorPosition);
    });

    it('should not set cursor potision when title is blank', () => {
      const post = { title: '', body: 'body', cursorPosition: 2 };

      Post.load = jest.fn((callback) => {
        callback(post);
      });
      popup.setPreviousPost();
      expect(popup.ui.cursorPosition).toBeUndefined();
    });
  });

  describe('#setPreviousState', () => {
    beforeEach(() => {
      popup = new Popup();
      popup.ui.toggleDisplayOptionLink = jest.fn();
    });

    describe('when config is valid', () => {
      it('should configure Esa & team info in UI', async () => {
        const config = {
          teamName: 'team name',
          token: 'token',
          teamIcon: 'icon_url',
        };
        chrome.storage.sync.get = jest.fn((defaultConfig, callback) => {
          callback(Util.merge(defaultConfig, config));
        });

        await popup.setPreviousState();

        expect(Esa).toHaveBeenCalledTimes(1);
        expect(popup.ui.toggleDisplayOptionLink).toHaveBeenCalledWith(false);
        expect(popup.ui.team).toEqual(config);
      });
    });

    describe('when config is invalid', () => {
      it('should show option link & message', async () => {
        const config = { teamName: '', token: '', teamIcon: 'icon_url' };
        chrome.storage.sync.get = jest.fn((defaultConfig, callback) => {
          callback(Util.merge(defaultConfig, config));
        });

        expect(popup.setPreviousState()).rejects.toThrow();

        expect(popup.ui.toggleDisplayOptionLink).toHaveBeenCalledWith(true);
        expect(Esa).not.toHaveBeenCalled();
        expect(popup.ui.team.teamName).not.toBeUndefined();
      });
    });
  });

  describe('#setPreviousSavedPostLink', () => {
    const savedPostLink = 'https://saved_post_link.esa.io/posts/11111111';

    beforeEach(() => {
      popup = new Popup();
      chrome.storage.sync.get = jest.fn((defaultLinkData, callback) => {
        const linkData = { savedPostLink: savedPostLink };
        callback(Util.merge(defaultLinkData, linkData));
      });
    });

    it('should set savedPostLink loaded chrome storage', async () => {
      await popup.setPreviousSavedPostLink();

      expect(popup.ui.savedPostLink).toEqual(savedPostLink);
    });
  });

  describe('#setHook', () => {
    beforeEach(() => {
      popup = new Popup();
      popup.ui = {
        titleDom: { on: jest.fn() },
        bodyDom: { on: jest.fn() },
        postButtonDom: { on: jest.fn() },
      };
    });

    it('should set hook to specified target', () => {
      const hook = function() {};
      popup.setHooks('title', { keyup: hook });
      expect(popup.ui.titleDom.on).toHaveBeenCalledWith('keyup', hook);

      popup.setHooks('body', { keydown: hook });
      expect(popup.ui.bodyDom.on).toHaveBeenCalledWith('keydown', hook);

      popup.setHooks('post-button', { mouseup: hook });
      expect(popup.ui.postButtonDom.on).toHaveBeenCalledWith('mouseup', hook);
    });

    it('should throw error for invalid target', () => {
      const hook = function() {};

      expect(() => {
        popup.setHooks('hoge', { keyup: hook });
      }).toThrow();
    });

    it('should allow to set multiple hooks', () => {
      const hook1 = function() {};
      const hook2 = function() {};

      popup.setHooks('title', { keyup: [hook1, hook2] });

      expect(popup.ui.titleDom.on).toHaveBeenCalledWith('keyup', hook1);
      expect(popup.ui.titleDom.on).toHaveBeenCalledWith('keyup', hook2);
    });
  });

  describe('#save', () => {
    const postId = 123;

    beforeEach(() => {
      popup = new Popup();

      popup.searchTargetPostInEsa = jest.fn(() => {
        return postId;
      });
      popup.uploadPost = jest.fn((_) => {
        return {
          posts: [
            {
              number: postId,
              name: 'title',
              body_md: '- body',
            },
          ],
        };
      });
      popup.syncPostWithEsaResponse = jest.fn((response) => {
        popup.post.title = response.posts[0].name;
        popup.post.body = response.posts[0].body_md;
      });

      popup.syncUIWithPost = jest.fn(() => {
        popup.ui.title = popup.post.title;
        popup.ui.body = popup.post.body;
      });

      popup.notifySuccess = jest.fn();
    });

    it('should update post to esa & update UI correctly', async () => {
      await popup.save();

      expect(popup.searchTargetPostInEsa).toHaveBeenCalledTimes(1);
      expect(popup.uploadPost).toHaveBeenCalledWith(postId);

      const mockUIObject = UI.mock.instances[0];

      expect(mockUIObject.toggleDisabledSaveButton).toHaveBeenCalledWith(true);
      expect(mockUIObject.toggleUploadingStatus).toHaveBeenCalledWith(true);
      expect(mockUIObject.toggleUploadingStatus).toHaveBeenCalledWith(false);

      expect(popup.syncPostWithEsaResponse).toHaveBeenCalled();
      expect(popup.ui.title).toEqual('title');
      expect(popup.ui.body).toEqual('- body');
    });
  });
});
