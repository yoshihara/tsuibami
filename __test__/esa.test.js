'use strict';

import Esa from '../src/js/esa';
jest.unmock('../src/js/esa.js');

import Promise from 'promise';
import $ from 'jquery';

describe('Esa', () => {
  let config = { teamName: 'test', token: 'token' };

  describe('#search', () => {
    beforeAll(() => {
      $.ajax = jest.fn(() => {
        return new Promise(() => {});
      });
    });

    it('should request Esa search API by ajax', async () => {
      const esa = new Esa(config);

      let q = 'search query';

      esa.search(q, () => {}, () => {});
      expect($.ajax).toBeCalledWith({
        data: {
          access_token: config.token,
          q: q,
        },
        type: 'GET',
        url: `https://api.esa.io/v1/teams/${config.teamName}/posts`,
      });
    });

    describe('when ajax succeeded', () => {
      beforeAll(() => {
        $.ajax = jest.fn(() => {
          return new Promise((resolve, _) => {
            resolve({
              posts: [{ number: 123, name: 'name', body_md: '- body' }],
            });
          });
        });
      });

      it('should call callback for success', async () => {
        const esa = new Esa(config);

        let callback = jest.fn((data) => {
          expect(data.posts).toEqual([
            { number: 123, name: 'name', body_md: '- body' },
          ]);
        });

        await esa.search('search query', callback, () => {});
      });
    });

    describe('when ajax failed', () => {
      beforeAll(() => {
        $.ajax = jest.fn(() => {
          return new Promise((_, reject) => {
            reject({
              posts: [{ number: 123, name: 'name', body_md: '- body' }],
            });
          });
        });
      });

      it('should call callback for error', async () => {
        const esa = new Esa(config);

        let errCallback = jest.fn((data) => {
          expect(data.posts).toEqual([
            { number: 123, name: 'name', body_md: '- body' },
          ]);
        });

        await esa.search('search query', () => {}, errCallback);
      });
    });
  });

  describe('#save', () => {
    beforeAll(() => {
      $.ajax = jest.fn(() => {
        return new Promise(() => {});
      });
    });

    describe('when post has no id', () => {
      it('should POST request Esa post API by ajax', async () => {
        const esa = new Esa(config);

        let post = { name: 'name', body_md: '- body' };

        esa.save(post, () => {}, () => {});
        expect($.ajax).toBeCalledWith({
          data: {
            access_token: config.token,
            post: post,
          },
          type: 'POST',
          url: `https://api.esa.io/v1/teams/${config.teamName}/posts`,
        });
      });
    });

    describe('when post has id', () => {
      it('should PATCH request Esa post API by ajax', async () => {
        const esa = new Esa(config);

        let post = { id: 123, name: 'name', body_md: '- body' };

        esa.save(post, () => {}, () => {});
        expect($.ajax).toBeCalledWith({
          data: {
            access_token: config.token,
            post: post,
          },
          type: 'PATCH',
          url: `https://api.esa.io/v1/teams/${config.teamName}/posts/${
            post.id
          }`,
        });
      });
    });

    describe('callbacks', () => {
      let post = { name: 'name', body_md: '- body' };

      describe('when ajax succeeded', () => {
        beforeAll(() => {
          $.ajax = jest.fn(() => {
            return new Promise((resolve, _) => {
              resolve({
                posts: [{ number: 123, name: 'name', body_md: '- body' }],
              });
            });
          });
        });

        it('should call callback for success', async () => {
          const esa = new Esa(config);

          let callback = jest.fn((data) => {
            expect(data.posts).toEqual([
              { number: 123, name: 'name', body_md: '- body' },
            ]);
          });

          await esa.save(post, callback, () => {});
        });
      });

      describe('when ajax failed', () => {
        beforeAll(() => {
          $.ajax = jest.fn(() => {
            return new Promise((_, reject) => {
              reject({
                posts: [{ number: 123, name: 'name', body_md: '- body' }],
              });
            });
          });
        });

        it('should call callback for error', async () => {
          const esa = new Esa(config);

          let errCallback = jest.fn((data) => {
            expect(data.posts).toEqual([
              { number: 123, name: 'name', body_md: '- body' },
            ]);
          });

          await esa.save(post, () => {}, errCallback);
        });
      });
    });
  });
});
