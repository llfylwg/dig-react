import Properties from './properties';


/*
  The default onPropertyChange assumes:

    refresh(queryParams)*
    get queryParams()
    refreshModel(queryParams)

    * will throw if not found

*/
const QueryFilters = target => class extends Properties(target) {

  get nativeProperties() {
    return this.queryParams;
  }

  get queryParams() {
    return {};
  }

  refreshModel(queryParams) {
    return this.refresh(queryParams);
  }

  refresh() { throw new Error('derived class of QueryFilters expected to implement "refresh(queryParams)" '); }

  onPropertyChange(filter) {
    if( this._ignoreFilterEvent ) {
      return;
    }
    
    const qp = this.queryParams;
    const { name } = filter;
    
    const currentNativeValue = (qp[name] || '').toString();
    const proposedNativeValue = filter.serialize(currentNativeValue);

    if( currentNativeValue !== proposedNativeValue ) {

      qp[name] = proposedNativeValue;
      
      if( filter.requiresFullRefresh ) {
        this.refreshModel(qp);
      } else {
        this.refresh(qp);
      }
      
    }
  }

  paramsDirty() {
    return Array.from(this._properties.values()).find( f => f.isDirty ) !== undefined;
  }

  applyDefaults() {
    const qp = this.queryParams;
    this._ignoreFilterEvent = true;
    for( const filter of this._properties.values() ) {
      filter.isDirty && filter.reset();
      qp[filter.name] = filter.serialize(qp[filter.name]);
    }
    this._ignoreFilterEvent = false;
    return this.refreshModel(qp);
  }

  setPropertyValue( PropertyClass, val ) {
    this._ignoreFilterEvent = true;
    this.getProperty(PropertyClass).value = val;
    this._ignoreFilterEvent = false;
  }
};

module.exports = QueryFilters;
