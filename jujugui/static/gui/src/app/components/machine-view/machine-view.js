/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2015 Canonical Ltd.

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

YUI.add('machine-view', function() {

  juju.components.MachineView = React.createClass({
    propTypes: {
      environmentName: React.PropTypes.string.isRequired,
      machines: React.PropTypes.object.isRequired,
      services: React.PropTypes.object.isRequired,
      units: React.PropTypes.object.isRequired
    },

    /**
      Get the initial state.

      @method getInitialState
      @returns {String} The intial state.
    */
    getInitialState: function() {
      return {selectedMachine: null};
    },

    /**
      Display a list of unplaced units or onboarding.

      @method _generateUnplacedUnits
      @returns {Object} A unit list or onboarding.
    */
    _generateUnplacedUnits: function() {
      var units = this.props.units.filterByMachine();
      if (units.length === 0) {
        var icon;
        var content;
        if (this.props.services.size() === 0) {
          icon = 'add_16';
          content = 'Add services to get started';
        } else {
          icon = 'task-done_16';
          content = 'You have placed all of your units';
        }
        return (
          <div className="machine-view__column-onboarding">
            <juju.components.SvgIcon name={icon}
              size="16" />
            {content}
          </div>);
      }
      var components = [];
      units.forEach((unit) => {
        var service = this.props.services.getById(unit.service);
        components.push(
          <juju.components.MachineViewUnplacedUnit
            key={unit.id}
            icon={service.get('icon') || ''}
            unit={unit} />);
      });
      return (
        <div>
          <div className="machine-view__auto-place">
            <button onClick={this.props.autoPlaceUnits}>
              Auto place
            </button>
            or manually place
          </div>
          <ul className="machine-view__list">
            {components}
          </ul>
        </div>);
    },

    /**
      Handle selecting a machine.

      @method selectMachine
      @param {String} id The machine id to select.
    */
    selectMachine: function(id) {
      this.setState({selectedMachine: id});
    },

    /**
      Display a list of machines or onboarding.

      @method _generateMachines
      @returns {Object} A list of machines or onboarding.
    */
    _generateMachines: function() {
      var machines = this.props.machines.filterByParent();
      var onboarding;
      if (machines.length === 0) {
        return (
          <div className="machine-view__column-onboarding">
            Use machine view to:
            <ul>
              <li>Create machines</li>
              <li>Create containers</li>
              <li>Customise placement</li>
              <li>Scale up your environment</li>
              <li>Manually place new units</li>
              <li>Collocate services</li>
            </ul>
            <span className="link" role="button" tabIndex="0">
              Add machine
            </span>
          </div>);
      } else if (machines.length === 1) {
        onboarding = (
          <div className="machine-view__column-onboarding">
            Drag and drop unplaced units onto your machines and containers to
            customise your deployment.
          </div>);
      }
      var components = [];
      machines.forEach((machine) => {
        components.push(
          <juju.components.MachineViewMachine
            key={machine.id}
            machine={machine}
            selected={this.state.selectedMachine === machine.id}
            selectMachine={this.selectMachine.bind(this, machine.id)}
            services={this.props.services}
            type="machine"
            units={this.props.units} />);
      });
      return (
        <div>
          {onboarding}
          <ul className="machine-view__list">
            {components}
          </ul>
        </div>);
    },

    /**
      Generate the title for the machine column header.

      @method _generateMachinesTitle
      @returns {String} the machine header title.
    */
    _generateMachinesTitle: function() {
      var machines = this.props.machines.filterByParent();
      return `${this.props.environmentName} (${machines.length})`;
    },

    /**
      Generate the title for the container column header.

      @method _generateContainersTitle
      @returns {String} the container header title.
    */
    _generateContainersTitle: function() {
      return '0 containers, 0 units';
    },

    render: function() {
      return (
        <div className="machine-view">
          <div className="machine-view__content">
            <div className="machine-view__column">
              <juju.components.MachineViewHeader
                title="New units" />
              <div className="machine-view__column-content">
                {this._generateUnplacedUnits()}
              </div>
            </div>
            <div className="machine-view__column machine-view__column--overlap">
              <juju.components.MachineViewHeader
                title={this._generateMachinesTitle()} />
              <div className="machine-view__column-content">
                {this._generateMachines()}
              </div>
            </div>
            <div className="machine-view__column">
              <juju.components.MachineViewHeader
                title={this._generateContainersTitle()} />
            </div>
          </div>
        </div>
      );
    }
  });
}, '0.1.0', {
  requires: [
    'machine-view-header',
    'machine-view-machine',
    'machine-view-unplaced-unit',
    'svg-icon'
  ]
});