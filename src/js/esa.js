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

  save(post, callback, errCallback) {
    let type;
    let url = `https://api.esa.io/v1/teams/${this.teamName}/posts`;
    if (post.id) {
      type = 'PATCH';
      url = url + '/' + post.id;
    } else {
      type = 'POST';
    }

    $.ajax({
      type: type,
      url: url,
      data: {
        post: post,
        access_token: this.token,
      },
    }).then(callback, errCallback);
  }
}
