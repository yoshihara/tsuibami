'use strict';

import Esa from '../src/js/esa';
jest.unmock('../src/js/esa.js');

import Promise from 'promise';
import $ from 'jquery';

describe('Esa', () => {
  const config = { teamName: 'test', token: 'token' };

  describe('#search', () => {
    beforeAll(() => {
      $.ajax = jest.fn(() => {
        return new Promise(() => {});
      });
    });

    it('should request Esa search API by ajax', () => {
      const esa = new Esa(config);
      const q = 'search query';

      esa
        .search(q)
        .then(() => {})
        .catch(() => {});

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

      it('should call callback for success', () => {
        const esa = new Esa(config);

        const callback = (data) => {
          expect(data.posts).toEqual([
            { number: 123, name: 'name', body_md: '- body' },
          ]);
        };

        return esa
          .search('search query')
          .then(callback)
          .catch((_) => {
            throw Error('Unexpected callback was called');
          });
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

      it('should call callback for error', () => {
        const esa = new Esa(config);

        const errCallback = (data) => {
          expect(data.posts).toEqual([
            { number: 123, name: 'name', body_md: '- body' },
          ]);
        };

        return esa
          .search('search query')
          .then((_) => {
            throw Error('Unexpected callback was called');
          })
          .catch(errCallback);
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
      it('should POST request Esa post API by ajax', () => {
        const esa = new Esa(config);

        const post = { name: 'name', body_md: '- body' };

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
      it('should PATCH request Esa post API by ajax', () => {
        const esa = new Esa(config);

        const post = { id: 123, name: 'name', body_md: '- body' };

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
      const post = { name: 'name', body_md: '- body' };

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

        it('should call callback for success', () => {
          const esa = new Esa(config);

          const callback = (data) => {
            expect(data.posts).toEqual([
              { number: 123, name: 'name', body_md: '- body' },
            ]);
          };

          return esa
            .save(post)
            .then(callback)
            .catch(() => {
              throw Error('Unexpected callback was called');
            });
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

        it('should call callback for error', () => {
          const esa = new Esa(config);

          const errCallback = (data) => {
            expect(data.posts).toEqual([
              { number: 123, name: 'name', body_md: '- body' },
            ]);
          };

          return esa
            .save(post)
            .then(() => {
              throw Error('Unexpected callback was called');
            })
            .catch(errCallback);
        });
      });
    });
  });
});
