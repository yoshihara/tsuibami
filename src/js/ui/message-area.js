'use strict';

import $ from 'jquery';

export default class MessageArea {
  constructor() {}

  showMessageOnSuccess(message) {
    $('.message').show();
    $('.message__body').text(message);
    $('.message__body').removeClass(
      'message__body-color-success',
      'message__body-color-failure',
    );

    $('.message__body').addClass('message__body-color-success');
    setTimeout(function() {
      $('.message').fadeOut('normal', function() {
        $('.message__body').text('');
      });
    }, 2000);
  }

  showMessageOnFailure(message) {
    $('.message').show();
    $('.message__body').text(message);
    $('.message__body').removeClass(
      'message__body-color-success',
      'message__body-color-failure',
    );

    $('.message__body').addClass('message__body-color-failure');
  }
}
