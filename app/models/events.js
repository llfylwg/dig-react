
var Events = {
  ERROR:              'error',
  ERROR_IN_JSON:      'json_error',
  
  LOADING:            'loading',

  PRE_NAVIGATE:       'pre_navigate',
  NAVIGATE_TO:        'navigate_to',
  NAVIGATE_TO_THIS:   'navigate_to_this',
  
  NOW_PLAYING:        'now_playing',
  CONTROLS:           'controls',
  POSITION:           'position',
  PLAYLIST:           'playlist',
  FINISH:             'finish',
  PLAY:               'play',
  STOP:               'stop',
  
  MODEL_UPDATED:      'model_updated',

  PROPERTY_CHANGED:   'property_changed',
  
  DOWNLOAD:           'download',

  APP_ALERT:          'app_alert',
  USER_LOGIN:         'user_login',
  REQUEST_MODAL:      'request_modal',
  FEED_SEEN:          'feedseen',
  FOLLOW_CHANGED:     'follow_changed'
};

module.exports = Events;
