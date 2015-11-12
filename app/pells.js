import router from './services/router';
import env    from './services/env';
import routes from './routes/pells';
import App    from './app';
import qc     from './models/query-configs';

import {
          PellQueryOptions,
          PellsHeader,
          DigFooter
        } from './components';

import AudioPlayerService from './services/audio-player';

AudioPlayerService.wantWavImg = true;

env.Header          = PellsHeader;
env.Footer          = DigFooter;
env.AppQueryOptions = PellQueryOptions;

qc.default = qc.pells;

var rewriteRules = [
  { regex: /^\/files\/([^\/]+)\/([^\/]+)/, now: '/pells?ids=$2&artist=$1' },
];
router.addRoutes( routes, rewriteRules );

module.exports = App;