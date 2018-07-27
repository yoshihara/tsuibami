'use strict';

import UI from '../src/js/ui';
jest.unmock('../src/js/ui.js');

import MessageArea from '../src/js/ui/message-area';

import $ from 'jquery';

const originalTitle = 'title';
const originalBody = 'body';
const originalTeamIcon = 'https://example.png/';

// NOTE: ほぼDOM操作してるだけのメソッドはテスト対象から除外している

describe('UI', () => {
  beforeAll(() => {
    $.fn.esarea = jest.fn();
  });

  beforeEach(() => {
    document.body.innerHTML = `<div>
         <span class="team__name">team name</span>
         <img class="team__icon" src="${originalTeamIcon}" />

         <input class="post__title" value="${originalTitle}"/>
         <textarea class="post__body">${originalBody}</textarea>

         <a class="esa__link" href="link_url">previous saved link</a>

         <button class="esa__post-button">Save As WIP</button>

         <a class="option__link" href="option_link_url">open Option</a>
       </div>`;
  });

  describe('constructor', () => {
    let ui;

    beforeAll(() => {
      ui = new UI();
    });

    it('should have messageArea', () => {
      expect(ui.messageArea.constructor).toEqual(MessageArea);
    });

    it('should call esarea()', () => {
      expect(ui.bodyDom.esarea).toBeCalledTimes(1);
    });
  });

  describe('#post', () => {
    it('should update DOMs from Post data', () => {
      const ui = new UI();

      const postObj = { title: 'updated title', body: '- body' };
      ui.post = postObj;

      expect($('.post__title').val()).toEqual(postObj.title);
      expect($('.post__body').val()).toEqual(postObj.body);
    });

    it('should update DOM specified by Post data only', () => {
      const ui = new UI();

      ui.post = { title: 'updated title' };

      expect($('.post__title').val()).toEqual('updated title');
      expect($('.post__body').val()).toEqual(originalBody);

      ui.post = { body: 'updated body' };

      expect($('.post__title').val()).toEqual('updated title');
      expect($('.post__body').val()).toEqual('updated body');
    });
  });

  describe('#team', () => {
    it('should update DOMs from team data', () => {
      const ui = new UI();

      const teamObj = {
        teamName: 'updated teamName',
        teamIcon: 'https://updated.png/',
      };
      ui.team = teamObj;

      expect($('.team__name').text()).toEqual(teamObj.teamName);
      expect($('.team__icon')[0].src).toEqual(teamObj.teamIcon);
    });

    it('should update DOM specified by team data only', () => {
      const ui = new UI();

      ui.team = { teamName: 'updated teamName' };

      expect($('.team__name').text()).toEqual('updated teamName');
      expect($('.team__icon')[0].src).toEqual(originalTeamIcon);

      ui.team = { teamIcon: 'https://updated.png/' };

      expect($('.team__name').text()).toEqual('updated teamName');
      expect($('.team__icon')[0].src).toEqual('https://updated.png/');
    });
  });
});
