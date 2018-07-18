'use strict';

import $ from 'jquery';

export default class Esa {
  constructor(config) {
    this.teamName = config.teamName;
    this.token = config.token;
  }

  search(q, callback, errCallback) {
    $.ajax({
      type: 'GET',
      url: `https://api.esa.io/v1/teams/${this.teamName}/posts`,
      data: {
        q: q,
        access_token: this.token,
      },
    }).then(callback, errCallback);
  }
}
