/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2012-2013 Canonical Ltd.

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


YUI.add('juju-view-networklist', function(Y) {

  var NetworkListView = Y.Base.create('networkListView', Y.View, [], {

    events: {
      '.add-network': { click: 'addNetwork' },
      '.network': { click: 'fadeServices' }
    },

    /**
      Renders the network list viewport.

      @method render
    */
    render: function(node) {
      var container = this.get('container');
      container.append(Y.juju.views.Templates['network-list']());
      node.append(container);
    },

    /**
      Add a network.

      @method addNetwork
    */
    addNetwork: function(evt) {
      this.get('db').networks.create({
        'name': 'foo',
        'cidr': '192.168.0.128/25',
        'networkId': '985hq3784d834dh78q3qo84dnq'
      });
      this.get('db').networks.each(function(net) {
        console.log(net.getAttrs());
      });
    },

    /**
      Fade the services that aren't in the network
      that has been clicked

      @method fadeServices
    */
    fadeServices: function(evt) {
      var networkid = evt.currentTarget.get('networkId');
      Y.fire('fadeNotNetworks', {
        networks: [networkid]
      });
    }

  }, {
    ATTRS: {
      /**
        The Juju environment backend.

        @attribute env
        @type {Object}
      */
      env: {},
      /**
        The Juju database.

        @attribute db
        @type {Object}
      */
      db: {}
    }
  });

  Y.namespace('juju.views').NetworkListView = NetworkListView;

});
