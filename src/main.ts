import {
  Chart,
  LineController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import initWasm from 'wasm-raqi-online-toolbox';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// shoelace components
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';

// register web components
import './components/audio-analyzer';
import './components/base-card';
import './components/file-drop';
import './components/file-dropdown';
import './components/file-list';
import './components/graphs/c50c80-graph';
import './components/graphs/iacc-graph';
import './components/graphs/impulse-response-graph';
import './components/graphs/line-graph';
import './components/graphs/octave-bands-graph';
import './components/graphs/reverb-graph';
import './components/graphs/strengths-graph';
import './components/p0-dialog';
import './components/p0-notice';
import './components/p0-setting';
import './components/parameters-card';
import './components/parameters-table';
import './components/progress-indicator';
import './components/strengths-card';

// init web assembly module
// eslint-disable-next-line no-console
initWasm().catch(console.error);

setBasePath('/shoelace');

// prepare chart.js library
Chart.register(
  LineController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip
);
Chart.defaults.font.size = 15;
