import React            from 'react';
import qc               from '../../models/query-configs';
import Samples          from '../../stores/samples';

import { mergeParams }    from '../../unicorns';

import {  StemsList,
          Paging,
          ZIPContentViewer,
          PageHeader }       from '../../components';

import { QueryParamTracker } from '../../mixins';

var SearchHead = React.createClass({

  mixins: [ QueryParamTracker ],

  stateFromParams: function(queryParams) {
    return { searchTerm: queryParams.searchp };
  },

  render: function() {
    return (<PageHeader icon="search" subTitle="Search" title={this.state.searchTerm}/>);
  }

});


function stemsSearch(props) {

  var store = props.store;

  return (
    <div>
      <SearchHead store={store} />
      <div className="container-fluid">
        <div className="stems-browser">
          <div className="row">
            <div className="col-md-6 stems-listing-widget col-md-offset-3">
              <Paging store={store} disableBumping />
              <StemsList store={store} />   
            </div>
            <div className="col-md-2">
              <ZIPContentViewer store={store} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );      
}

stemsSearch.title = 'Samples Browser - Search';

stemsSearch.path = '/search';

stemsSearch.store = function(params,queryParams) {
  var qparams = mergeParams( {}, qc.samples, queryParams );
  return Samples.storeFromQuery( qparams, qc.samples );
};

module.exports = stemsSearch;
