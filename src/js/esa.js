'use strict';

import $ from 'jquery';

export default class Esa {
  constructor(config) {
    this.teamName = config.teamName;
    this.token = config.token;
    this.endpoint = `https://api.esa.io/v1/teams/${config.teamName}`;
  }

  search(q) {
    return $.ajax({
      type: 'GET',
      url: `${this.endpoint}/posts`,
      data: {
        q: q,
        access_token: this.token,
      },
    });
  }

  save(post, callback, errCallback) {
    let type;
    let url = `${this.endpoint}/posts`;
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
