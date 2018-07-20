'use strict';

import $ from 'jquery';

export default class MessageArea {
  constructor() {}

  init() {
    $('.message').show();
    $('.message__body').removeClass(
      'message__body-color-success',
      'message__body-color-failure',
    );
  }

  showMessageOnSuccess(message) {
    this.init();
    $('.message__body').text(message);

    $('.message__body').addClass('message__body-color-success');
    setTimeout(function() {
      $('.message').fadeOut('normal', function() {
        $('.message__body').text('');
      });
    }, 2000);
  }

  showMessageOnFailure(message) {
    this.init();
    $('.message__body').text(message);

    $('.message__body').addClass('message__body-color-failure');
  }
}
