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

class Inspector extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.generateState(this.props);
  }

  /**
    Callback for when the header back is clicked.

    @method _backCallback
  */
  _backCallback() {
    this.props.appState.changeState(this.state.activeChild.backState);
  }

  /**
    Generates the state for the inspector based on the app state.

    @method generateState
    @param {Object} nextProps The props which were sent to the component.
    @return {Object} A generated state object which can be passed to setState.
  */
  generateState(nextProps) {
    const service = nextProps.service;
    const serviceId = service.get('id');
    const appState = this.props.appState;
    const changeState = appState.changeState.bind(appState);
    const state = {
      activeComponent: appState.current.gui.inspector.activeComponent
    };
    const stateHistory = appState.history;
    const prevState = stateHistory[stateHistory.length-2];
    const previousInspector = prevState.gui && prevState.gui.inspector;
    switch (state.activeComponent) {
      case undefined:
        const backState = {};
        // Handle navigating back from the service details to a previous
        // service's relations.
        if (previousInspector &&
            previousInspector.id !== serviceId &&
            previousInspector.activeComponent === 'relations') {
          backState.gui = {
            inspector: {
              id: previousInspector.id,
              activeComponent: previousInspector.activeComponent}};
        } else {
          backState.gui = {inspector: null};
        }
        state.activeChild = {
          title: service.get('name'),
          icon: service.get('icon'),
          component: <juju.components.ServiceOverview
            acl={this.props.acl}
            addNotification={this.props.addNotification}
            changeState={changeState}
            charm={this.props.charm}
            clearState={this.props.clearState}
            destroyService={this.props.destroyService}
            displayPlans={this.props.displayPlans}
            getUnitStatusCounts={this.props.getUnitStatusCounts}
            modelUUID={this.props.modelUUID}
            service={service}
            serviceRelations={this.props.serviceRelations}
            showActivePlan={this.props.showActivePlan}
            showPlans={this.props.showPlans} />,
          backState: backState
        };
        break;
      case 'units':
        var unitStatus = appState.current.gui.inspector.units;
        // A unit status of 'true' is provided when there is no status, but
        // we don't want to pass that on as the status value.
        unitStatus = unitStatus === true ? null : unitStatus;
        var units = service.get('units').filterByStatus(unitStatus);
        state.activeChild = {
          title: 'Units',
          icon: service.get('icon'),
          count: units.length,
          headerType: unitStatus,
          component:
            <juju.components.UnitList
              acl={this.props.acl}
              service={service}
              unitStatus={unitStatus}
              units={units}
              envResolved={this.props.envResolved}
              destroyUnits={this.props.destroyUnits}
              changeState={changeState} />,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: undefined
              }}}};
        break;
      case 'unit':
        var unitId = appState.current.gui.inspector.unit;
        var unit = service.get('units').getById(
          serviceId + '/' + unitId);
        var unitStatus = null;
        var previousComponent;
        var id;
        if (previousInspector && previousInspector.units) {
          var units = previousInspector.units;
          previousComponent = previousInspector.activeComponent;
          // A unit status of 'true' is provided when there is no status, but
          // we don't want to pass that on as the status value.
          unitStatus = units === true ? null : units;
          id = previousInspector.id;
        } else {
          id = serviceId;
        }
        // If the unit doesn't exist then show the list of units.
        if (!unit) {
          changeState({
            gui: {
              inspector: {
                id: id,
                activeComponent: 'units',
                unit: null,
                unitStatus: unitStatus}}});
          return {};
        }
        state.activeChild = {
          title: unit.displayName,
          icon: service.get('icon'),
          headerType: unit.agent_state || 'uncommitted',
          component:
            <juju.components.UnitDetails
              acl={this.props.acl}
              destroyUnits={this.props.destroyUnits}
              service={service}
              changeState={changeState}
              unitStatus={unitStatus}
              previousComponent={previousComponent}
              unit={unit} />,
          backState: {
            gui: {
              inspector: {
                id: id,
                activeComponent: previousComponent || 'units',
                unit: null,
                unitStatus: unitStatus}}}};
        break;
      case 'scale':
        state.activeChild = {
          title: 'Scale',
          icon: service.get('icon'),
          component:
            <juju.components.ScaleService
              acl={this.props.acl}
              addGhostAndEcsUnits={this.props.addGhostAndEcsUnits}
              changeState={changeState}
              createMachinesPlaceUnits={this.props.createMachinesPlaceUnits}
              providerType={this.props.providerType}
              serviceId={serviceId}
            />,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: 'units'}}}};
        break;
      case 'config':
        state.activeChild = {
          title: 'Configure',
          icon: service.get('icon'),
          component:
            <juju.components.Configuration
              acl={this.props.acl}
              service={service}
              charm={nextProps.charm}
              changeState={changeState}
              getYAMLConfig={this.props.getYAMLConfig}
              updateServiceUnitsDisplayname=
                {this.props.updateServiceUnitsDisplayname}
              getServiceByName={this.props.getServiceByName}
              addNotification={this.props.addNotification}
              linkify={this.props.linkify}
              unplaceServiceUnits={this.props.unplaceServiceUnits}
              serviceRelations={this.props.serviceRelations}
              setConfig={nextProps.setConfig} />,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: undefined}}}};
        break;
      case 'expose':
        state.activeChild = {
          title: 'Expose',
          icon: service.get('icon'),
          component:
            <juju.components.InspectorExpose
              acl={this.props.acl}
              changeState={changeState}
              exposeService={this.props.exposeService}
              unexposeService={this.props.unexposeService}
              addNotification={this.props.addNotification}
              service={service}
              units={service.get('units')} />,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: undefined}}}};
        break;
      case 'relations':
        state.activeChild = {
          title: 'Relations',
          icon: service.get('icon'),
          component:
            <juju.components.InspectorRelations
              acl={this.props.acl}
              service={service}
              destroyRelations={this.props.destroyRelations}
              serviceRelations={this.props.serviceRelations}
              changeState={changeState} />,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: undefined}}}};
        break;
      case 'relation':
        var relationIndex = nextProps.appState.current.gui.inspector.relation;
        var relation = this.props.serviceRelations[relationIndex];
        var serviceName = relation.far.serviceName;
        var relationName = relation.far.name;
        state.activeChild = {
          title: (serviceName + ':' + relationName),
          icon: service.get('icon'),
          component:
            <juju.components.InspectorRelationDetails
              relation={relation} />,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: 'relations'}}}};
        break;
      case 'relate-to':
        const spouse = nextProps.appState.current.gui.inspector['relate-to'];
        if (typeof serviceId === 'string' && typeof spouse === 'string') {
          state.activeChild = {
            title: this.props.getServiceById(spouse).get('name'),
            icon: service.get('icon'),
            component:
              <juju.components.InspectorRelateToEndpoint
                backState={{
                  gui: {
                    inspector: {
                      id: serviceId,
                      activeComponent: 'relations'}}}}
                createRelation={this.props.createRelation}
                endpoints={this.props.getAvailableEndpoints(
                  service, this.props.getServiceById(spouse))}
                changeState={changeState} />,
            backState: {
              gui: {
                inspector: {
                  id: serviceId,
                  activeComponent: 'relate-to'}}}};
          break;
        }
        state.activeChild = {
          title: 'Relate to',
          icon: service.get('icon'),
          component:
            <juju.components.InspectorRelateTo
              changeState={changeState}
              application={service}
              relatableApplications={this.props.relatableApplications}/>,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: 'relations'
              }
            }
          }
        };
        break;
      case 'change-version':
        state.activeChild = {
          title: 'Change version',
          icon: service.get('icon'),
          component:
            <juju.components.InspectorChangeVersion
              acl={this.props.acl}
              changeState={changeState}
              addNotification={this.props.addNotification}
              charmId={service.get('charm')}
              service={service}
              addCharm={this.props.addCharm}
              setCharm={this.props.setCharm}
              getCharm={this.props.getCharm}
              getAvailableVersions={this.props.getAvailableVersions} />,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: undefined}}}};
        break;
      case 'resources':
        state.activeChild = {
          title: 'Resources',
          icon: service.get('icon'),
          component:
            <juju.components.InspectorResourcesList
              acl={this.props.acl}
              resources={this.props.charm.get('resources')} />,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: undefined}}}};
        break;
      case 'plan':
        state.activeChild = {
          title: 'Plan',
          icon: service.get('icon'),
          component:
            <juju.components.InspectorPlan
              acl={this.props.acl}
              currentPlan={this.props.service.get('activePlan')} />,
          backState: {
            gui: {
              inspector: {
                id: serviceId,
                activeComponent: undefined}}}};
        break;
    }
    return state;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.generateState(nextProps));
  }

  render() {
    return (
      <div className="inspector-view">
        <juju.components.InspectorHeader
          backCallback={this._backCallback.bind(this)}
          activeComponent={this.state.activeComponent}
          type={this.state.activeChild.headerType}
          title={this.state.activeChild.title}
          icon={this.state.activeChild.icon} />
        <div className="inspector-content">
          {this.state.activeChild.component}
        </div>
      </div>
    );
  }
};

Inspector.propTypes = {
  acl: PropTypes.object.isRequired,
  addCharm: PropTypes.func.isRequired,
  addGhostAndEcsUnits: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired,
  appState: PropTypes.object.isRequired,
  charm: PropTypes.object.isRequired,
  clearState: PropTypes.func.isRequired,
  createMachinesPlaceUnits: PropTypes.func.isRequired,
  createRelation: PropTypes.func.isRequired,
  destroyRelations: PropTypes.func.isRequired,
  destroyService: PropTypes.func.isRequired,
  destroyUnits: PropTypes.func.isRequired,
  displayPlans: PropTypes.bool.isRequired,
  envResolved: PropTypes.func.isRequired,
  exposeService: PropTypes.func.isRequired,
  getAvailableEndpoints: PropTypes.func.isRequired,
  getAvailableVersions: PropTypes.func.isRequired,
  getCharm: PropTypes.func.isRequired,
  getServiceById: PropTypes.func.isRequired,
  getServiceByName: PropTypes.func.isRequired,
  getUnitStatusCounts: PropTypes.func.isRequired,
  getYAMLConfig: PropTypes.func.isRequired,
  linkify: PropTypes.func.isRequired,
  modelUUID: PropTypes.string.isRequired,
  providerType: PropTypes.string,
  relatableApplications: PropTypes.array.isRequired,
  service: PropTypes.object.isRequired,
  serviceRelations: PropTypes.array.isRequired,
  setCharm: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  showActivePlan: PropTypes.func.isRequired,
  showPlans: PropTypes.bool.isRequired,
  unexposeService: PropTypes.func.isRequired,
  unplaceServiceUnits: PropTypes.func.isRequired,
  updateServiceUnitsDisplayname: PropTypes.func.isRequired
};

YUI.add('inspector-component', function() {
  juju.components.Inspector = Inspector;
}, '0.1.0', {
  requires: [
    'inspector-change-version',
    'inspector-expose',
    'inspector-header',
    'inspector-config',
    'inspector-plan',
    'inspector-relate-to',
    'inspector-relate-to-endpoint',
    'inspector-relations',
    'inspector-relation-details',
    'inspector-resources-list',
    'scale-service',
    'service-overview',
    'unit-details',
    'unit-list'
  ]
});
