/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2016 Canonical Ltd.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License version 3, as published by
the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranties of MERCHANTABILITY,
SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

describe('State', () => {
  it('can be instantiated', () => {
    const state = new window.jujugui.State({
      baseURL: 'http://abc.com:123'
    });
    assert.equal(state instanceof window.jujugui.State, true);
  });

  it('throws if no baseURL is provided', () => {
    assert.throws(function() {
      new window.jujugui.State({});
    });
  });

  describe('steriesList', () => {
    it('defaults to an internal series list if none is provided', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });
      assert.deepEqual(state.seriesList, [
        'bundle', 'precise', 'trusty', 'xenial']);
    });

    it('adds \'bundle\' to the series list', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123',
        seriesList: ['trusty']
      });
      assert.deepEqual(state.seriesList, ['trusty', 'bundle']);
    });

    it('throws if the seriesList value is not an array', () => {
      assert.throws(function() {
        new window.jujugui.State({
          baseURL: 'http://abc.com:123',
          seriesList: 'notanarray'
        });
      });
    });
  });

  describe('State._getCleanPath()', () => {
    it('can clean the url', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });
      assert.equal(
        state._getCleanPath('http://abc.com:123/a/b/c/d/'),
        'a/b/c/d');
      assert.equal(
        state._getCleanPath('http://abc.com:123///a/b/c/d/'),
        'a/b/c/d');
      assert.equal(
        state._getCleanPath('http://abc.com:123/a/b/c/d///'),
        'a/b/c/d');
    });
  });

  describe('State._parseRoot()', () => {
    it('populates the root portion of the state object', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });
      assert.deepEqual(state._parseRoot([], {}), {});
      assert.deepEqual(
        state._parseRoot(['login'], {}),
        {root: 'login'});
    });
  });

  describe('State._parseSearch()', () => {
    it('populates the search portion of the state object', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });
      assert.deepEqual(state._parseSearch([], {}),{});
      assert.deepEqual(
        state._parseSearch(['k8s', 'core'], {}),
        {search: 'k8s/core'});
    });
  });

  describe('State._parseGUI', () => {
    it('populates the gui portion of the state object', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const guiSections = [{
        parts: [],
        state: {},
        error: 'invalid GUI path.'
      }, {
        parts: ['inspector', 'haproxy', 'config'],
        state: { gui: { inspector: 'haproxy/config' } },
        error: null
      }, {
        parts: ['machines'],
        state: { gui: { machines: '' } },
        error: null
      }, {
        parts: ['applications', 'inspector', 'ghost'],
        state: { gui: { applications: '', inspector: 'ghost' } },
        error: null
      }, {
        parts: ['inspector', 'service123', 'relate-to', 'serviceabc'],
        state: { gui: { inspector: 'service123/relate-to/serviceabc' } },
        error: null
      }, {
        parts: [
          'inspector', 'apache2', 'machines', '3', 'lxc-0', 'deploy', 'foo'],
        state: {
          gui: { inspector: 'apache2', machines: '3/lxc-0', deploy: 'foo' }
        },
        error: null
      }];

      guiSections.forEach(section => {
        assert.deepEqual(
          state._parseGUI(section.parts, {}),
          {error: section.error, state: section.state},
          `${section.path} did not properly generate the state object: ` +
          JSON.stringify(section.state));
      });
    });
  });

  describe('State._parseUser()', () => {
    it('populates the user and store portions of the state object', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const userSections = [{
        parts: [],
        state: {},
        error: null,
        outputParts: []
      }, {
        parts: ['u', 'ant'],
        state: { profile: 'ant' },
        error: null,
        outputParts: []
      }, {
        parts: ['u', 'frankban', 'settings'],
        state: { profile: 'frankban/settings' },
        error: null,
        outputParts: []
      }, {
        parts: ['u', 'frankban', 'charms'],
        state: { profile: 'frankban/charms' },
        error: null,
        outputParts: []
      }, {
        parts: ['u', 'frankban', 'issues'],
        state: { profile: 'frankban/issues' },
        error: null,
        outputParts: []
      }, {
        parts: ['u', 'frankban', 'revenue'],
        state: { profile: 'frankban/revenue' },
        error: null,
        outputParts: []
      }, {
        parts: ['u', 'hatch', 'staging', 'haproxy'],
        state: { user: 'hatch/staging' },
        error: null,
        outputParts: ['haproxy']
      }, {
        parts: ['u', 'frankban', 'production', 'ghost', 'xenial'],
        state: { user: 'frankban/production' },
        error: null,
        outputParts: ['ghost', 'xenial']
      }, {
        parts: ['u', 'hatch', 'charms', 'ghost', 'xenial'],
        state: { profile: 'hatch/charms' },
        error: null,
        outputParts: ['ghost', 'xenial']
      }, {
        parts: ['u', 'hatch', 'staging', 'ghost', '42'],
        state: { user: 'hatch/staging' },
        error: null,
        outputParts: ['ghost', '42']
      }, {
        parts: ['u', 'hatch', 'mongodb', 'xenial'],
        state: { store: 'hatch/mongodb/xenial' },
        error: null,
        outputParts: []
      }, {
        parts: ['u', 'hatch', 'mongodb', '47'],
        state: { store: 'hatch/mongodb/47' },
        error: null,
        outputParts: []
      }, {
        parts: ['u', 'frankban', 'django', 'bundle', '0'],
        state: { store: 'frankban/django/bundle/0' },
        error: null,
        outputParts: []
      }, {
      // Multi user delimiter handling.
        parts: ['u', 'hatch', 'staging', 'u', 'frankban', 'django'],
        state: {
          user: 'hatch/staging',
          store: 'frankban/django'
        },
        error: null,
        outputParts: []
      }, {
        parts: [
          'u', 'frankban', 'production', 'u', 'hatch', 'mongodb', 'xenial'],
        state: {
          user: 'frankban/production',
          store: 'hatch/mongodb/xenial'
        },
        error: null,
        outputParts: []
      }, {
        parts: [
          'u', 'hatch', 'staging', 'u', 'hatch', 'django', 'bundle', '0'],
        state: {
          user: 'hatch/staging',
          store: 'hatch/django/bundle/0'
        },
        error: null,
        outputParts: []
      }, {
        parts: [
          'u', 'hatch', 'charms', 'u', 'hatch', 'mongodb', 'xenial'],
        state: {
          profile: 'hatch/charms',
          store: 'hatch/mongodb/xenial'
        },
        error: null,
        outputParts: []
      }];

      userSections.forEach(test => {
        assert.deepEqual(
          state._parseUser(test.parts, {}),
          {state: test.state, parts: test.outputParts, error: test.error},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });
  });

  describe('State.buildState()', () => {
    it('builds the proper state for the reserved urls', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const urls = [{
        path: 'http://abc.com:123/new',
        state: { root: 'new' },
        error: null
      },{
        path: 'http://abc.com:123/store',
        state: { root: 'store' },
        error: null
      },{
        path: 'http://abc.com:123/about',
        state: { root: 'about' },
        error: null
      },{
        path: 'http://abc.com:123/docs',
        state: { root: 'docs' },
        error: null
      },{
        path: 'http://abc.com:123/login',
        state: { root: 'login' },
        error: null
      }];

      urls.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

    it('builds the proper state for the search urls', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const urls = [{
        path: 'http://abc.com:123/q/haproxy',
        state: { search: 'haproxy' },
        error: null
      }, {
        path: 'http://abc.com:123/q/k8s/core',
        state: { search: 'k8s/core' },
        error: null
      }];

      urls.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

    it('builds the proper state for the gui urls', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const urls = [{
        path: 'http://abc.com:123/i/inspector/haproxy/config',
        state: { gui: { inspector: 'haproxy/config' }},
        error: null
      }, {
        path: 'http://abc.com:123/i/machines',
        state: { gui: { machines: '' }},
        error: null
      }, {
        path: 'http://abc.com:123/i/applications/inspector/ghost',
        state: { gui: { applications: '', inspector: 'ghost' }},
        error: null
      }, {
        path:
          'http://abc.com:123/i/inspector/apache2/machines/3/lxc-0/deploy/foo',
        state: {
          gui: { inspector: 'apache2', machines: '3/lxc-0', deploy: 'foo'}
        },
        error: null
      }];

      urls.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

    it('builds proper state for the user urls', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const urls = [{
        path: 'http://abc.com:123/u/ant',
        state: { profile: 'ant' },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/staging',
        state: { user: 'hatch/staging' },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/mongodb/xenial',
        state: { store: 'hatch/mongodb/xenial' },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/mongodb/47',
        state: { store: 'hatch/mongodb/47' },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/django/bundle/0',
        state: { store: 'frankban/django/bundle/0' },
        error: null
      }];

      urls.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

    it('builds proper state for the store urls', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const urls = [{
        path: 'http://abc.com:123/haproxy',
        state: { store: 'haproxy' },
        error: null
      }, {
        path: 'http://abc.com:123/haproxy/xenial',
        state: { store: 'haproxy/xenial' },
        error: null
      }, {
        path: 'http://abc.com:123/haproxy/42',
        state: { store: 'haproxy/42' },
        error: null
      }, {
        path: 'http://abc.com:123/django/bundle/47',
        state: { store: 'django/bundle/47' },
        error: null
      }];

      urls.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

    it('builds proper state for model and store urls', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const urls = [{
        path: 'http://abc.com:123/u/hatch/staging/haproxy',
        state: { user: 'hatch/staging', store: 'haproxy' },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/production/ghost/xenial',
        state: { user: 'frankban/production', store: 'ghost/xenial' },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/staging/ghost/42',
        state: { user: 'hatch/staging', store: 'ghost/42' },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/production/django/bundle/47',
        state: { user: 'frankban/production', store: 'django/bundle/47' },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/staging/u/frankban/django',
        state: { user: 'hatch/staging', store: 'frankban/django' },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/production/u/hatch/mongodb/xenial',
        state: { user: 'frankban/production', store: 'hatch/mongodb/xenial' },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/staging/u/hatch/mongodb/47',
        state: { user: 'hatch/staging', store: 'hatch/mongodb/47' },
        error: null
      }, {
        path:
          'http://abc.com:123/u/frankban/production/u/frankban/django/bundle/0',
        state: {
          user: 'frankban/production', store: 'frankban/django/bundle/0' },
        error: null
      }];

      urls.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

    it('builds proper state for model and gui urls', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const urls = [{
        path: 'http://abc.com:123/u/hatch/staging/i/inspector/haproxy/config',
        state: { user: 'hatch/staging', gui: { inspector: 'haproxy/config' } },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/production/i/machines',
        state: { user: 'frankban/production', gui: { machines: '' } },
        error: null
      }, {
        path:
          'http://abc.com:123/u/hatch/staging/i/applications/inspector/ghost/',
        state: {
          user: 'hatch/staging', gui: {applications: '', inspector: 'ghost' }},
        error: null
      }];

      urls.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

    it('builds proper state for store and gui urls', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const urls = [{
        path: 'http://abc.com:123/haproxy/i/inspector/haproxy/config',
        state: { store: 'haproxy', gui: { inspector: 'haproxy/config' } },
        error: null
      }, {
        path: 'http://abc.com:123/ghost/xenial/i/machines',
        state: { store: 'ghost/xenial', gui: { machines: '' } },
        error: null
      }, {
        path: 'http://abc.com:123/ghost/42/i/applications/inspector/ghost/',
        state: {
          store: 'ghost/42', gui: { applications: '', inspector: 'ghost' } },
        error: null
      }, {
        path: 'http://abc.com:123/django/bundle/47/i/machines',
        state: { store: 'django/bundle/47', gui: { machines: '' } },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/mongodb/xenial/i/applications/inspector/ghost/', // eslint-disable-line max-len
        state: {
          store: 'hatch/mongodb/xenial',
          gui: { applications: '', inspector: 'ghost'} },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/django/bundle/0/i/machines',
        state: { store: 'frankban/django/bundle/0', gui: { machines: '' } },
        error: null
      }];

      urls.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

    it('builds proper state for urls with all sections', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const urls = [{
        path: 'http://abc.com:123/u/hatch/staging/haproxy/i/inspector/haproxy/config', // eslint-disable-line max-len
        state: {
          user: 'hatch/staging',
          store: 'haproxy',
          gui: { inspector: 'haproxy/config' }
        },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/production/ghost/xenial/i/inspector/haproxy/config', // eslint-disable-line max-len
        state: {
          user: 'frankban/production',
          store: 'ghost/xenial',
          gui: { inspector: 'haproxy/config' }
        },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/staging/ghost/42/i/inspector/haproxy/config', // eslint-disable-line max-len
        state: {
          user: 'hatch/staging',
          store: 'ghost/42',
          gui: { inspector: 'haproxy/config' }
        },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/production/django/bundle/47/i/machines', // eslint-disable-line max-len
        state: {
          user: 'frankban/production',
          store: 'django/bundle/47',
          gui: { machines: '' }
        },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/staging/u/frankban/django/i/applications/inspector/ghost/', // eslint-disable-line max-len
        state: {
          user: 'hatch/staging',
          store: 'frankban/django',
          gui: { applications: '', inspector: 'ghost' }
        },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/production/u/hatch/mongodb/xenial/i/machines', // eslint-disable-line max-len
        state: {
          user: 'frankban/production',
          store: 'hatch/mongodb/xenial',
          gui: { machines: '' }
        },
        error: null
      }, {
        path: 'http://abc.com:123/u/hatch/staging/u/hatch/mongodb/47/i/applications/inspector/ghost/', // eslint-disable-line max-len
        state: {
          user: 'hatch/staging',
          store: 'hatch/mongodb/47',
          gui: { applications: '', inspector: 'ghost' }
        },
        error: null
      }, {
        path: 'http://abc.com:123/u/frankban/production/u/frankban/django/bundle/0/i/applications', // eslint-disable-line max-len
        state: {
          user: 'frankban/production',
          store: 'frankban/django/bundle/0',
          gui: { applications: '' }
        },
        error: null
      }];

      urls.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

    it('correctly returns with an error for invalid urls', () => {
      const state = new window.jujugui.State({
        baseURL: 'http://abc.com:123'
      });

      const badURLS = [{
        path: 'http://abc.com:123/u',
        state: {},
        error: 'invalid user path.'
      }, {
        path: 'http://abc.com:123/u/frankban/u',
        state: {
          profile: 'frankban'
        },
        error: 'invalid user store path.'
      }, {
        path: 'http://abc.com:123/u/frankban/u/haproxy',
        state: {
          profile: 'frankban'
        },
        error: 'invalid user store path.'
      }, {
        path: 'http://abc.com:123/u/hatch/staging/u',
        state: {
          user: 'hatch/staging'
        },
        error: 'invalid user store path.'
      }, {
        path: 'http://abc.com:123/u/hatch/staging/u/hatch',
        state: {
          user: 'hatch/staging'
        },
        error: 'invalid user store path.'
      }, {
        path: 'http://abc.com:123/u/hatch/staging/u/hatch/ghost/trusty/42/wat',
        state: {
          user: 'hatch/staging'
        },
        error: 'invalid user store path.'
      }, {
        path: 'http://abc.com:123/u/hatch/staging/hatch/u/wat',
        state: {},
        error: 'invalid user path.'
      }, {
        path:
          'http://abc.com:123/u/frankban/production/u/frankban/i/applications',
        state: {
          gui: {
            applications: ''
          },
          user: 'frankban/production'
        },
        error: 'invalid user store path.'
      }, {
        path: 'http://abc.com:123/about/wat',
        state: {
          root: 'about'
        },
        error: 'invalid root path.'
      }, {
        path: 'http://abc.com:123/no-such/i',
        state: {
          store: 'no-such'
        },
        error: 'invalid GUI path.'
      }, {
        path: 'http://abc.com:123/django/bundle/42/wat',
        state: {},
        error: 'invalid store path.'
      }, {
        path: 'http://abc.com:123/ghost/u/frankban/ghost',
        state: {},
        error: 'invalid user path.'
      }];

      badURLS.forEach(test => {
        assert.deepEqual(
          state.buildState(test.path),
          {error: test.error, state: test.state},
          `${test.path} did not properly generate the state object: ` +
          JSON.stringify(test.state));
      });
    });

  });
});
