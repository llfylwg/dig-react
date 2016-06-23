import React    from 'react';
import ReactDOM from 'react-dom';
import Glyph        from './Glyph';
import Alert    from './Alert';

import CloseButton from './CloseButton';

const Modal = React.createClass({

  getInitialState() {
    return { error: this.props.error };
  },

  componentDidMount: function() {
    /* globals $ */
    var d = $(ReactDOM.findDOMNode(this));
    d.modal('show');
    d.on ('hidden.bs.modal', () => {
      this.props.handleHideModal && this.props.handleHideModal(...arguments);
      ModalPopup.hide();
    });
  },

  componentWillReceiveProps(nextProps) {
    this.setState( {error: nextProps.error});
  },

  _getButtonText() {
    return ' ' + (this.props.buttonText || 'Submit');
  },

  onSubmit() {
    /* globals $ */
    $('.modal-submit').prop({disabled:true}).removeClass('btn-success');
    $('.modal-submit-text').text(' saving...');
    var possibleThenable = this.props.action();
    if( possibleThenable.then ) {
      possibleThenable.then( () => {
        var text = this._getButtonText();
        $('.modal-submit').prop({disabled:false}).addClass('btn-success');
        $('.modal-submit-text').text(text);
      });
    }
  },

  onAlertClosed() {
    this.setState({error:''});
  },

  render(){
    var title    = this.props.title;
    var subTitle = this.props.subTitle;
    var action   = this.onSubmit;
    var icon     = this.props.icon || 'share';
    var text     = this._getButtonText();
    var close    = ' ' + (this.props.closeText || 'Close');
    var disabled = this.props.submitDisabler && this.props.submitDisabler() || false; 

    return (
      <div className="modal fade">
        <div className="modal-dialog">
          <div className="modal-content">
          <div className="modal-header">
            <CloseButton className="close" data-dismiss="modal" />
            <h4 className="modal-title"><span className="light-color">{subTitle}</span> {title}</h4>
          </div>
          <div className="modal-body">
            {this.state.error && <Alert type="danger" noAutoFade onClose={this.onAlertClosed} text={this.props.error} />}
            {this.props.children}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal">{close}</button>
            {action 
              ? <button disabled={disabled} className="modal-submit btn btn-primary btn-success" onClick={action}><Glyph icon={icon} /><span className="modal-submit-text">{text}</span></button>
              : null
            }
          </div>
          </div>
        </div>
      </div>
    );
  },
});


class ModalPopup extends React.Component {
  constructor() {
    super(...arguments);
    this.handleActionResponse = this.handleActionResponse.bind(this);
  }

  manualClose() {
    /* globals $ */
    var d = $(ReactDOM.findDOMNode(this));
    d.modal('hide'); 
  }

  handleActionResponse(result) {
    if( result.status === 'error') {
      this.setState( { error: result.errmsg || 'fAIL' } );
    } else {
      this.manualClose();
    }
  }
}

ModalPopup.show = function(/*comp,props*/) {
  throw new Error( '"show" was not implemented here - you probably want app/services/Modal');
};

ModalPopup.hide = function(/*comp,props*/) {
  throw new Error( '"hide" was not implemented here - you probably want app/services/Modal');
};

Modal.Popup     = ModalPopup;

module.exports = Modal;

//