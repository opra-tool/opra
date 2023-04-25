import {
  Chart,
  LineController,
  BarController,
  PointElement,
  BarElement,
  LineElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Tooltip,
} from 'chart.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// shoelace components
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/divider/divider.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';

// register web components
import './components/audio-analyzer';
import './components/base-app';
import './components/cards/base-card';
import './components/cards/titled-card';
import './components/cards/help-card';
import './components/binaural-note-card';
import './convolving/convolver-card';
import './components/discard-all-dialog';
import './components/error-details';
import './components/environment-dialog';
import './components/file-drop';
import './components/file-dropdown';
import './components/file-list';
import './components/file-list-entry-options';
import './components/c50c80-graph/c50c80-graph';
import './components/c50c80-graph/c50c80-graph-help';
import './components/graphs/early-lateral-fraction-graph';
import './components/iacc-graph/iacc-graph';
import './components/iacc-graph/iacc-graph-help';
import './components/impulse-response-graph';
import './components/graphs/lateral-sound-level-graph';
import './components/graphs/line-graph';
import './components/graphs/octave-bands-graph';
import './components/reverb-graph/reverb-graph';
import './components/reverb-graph/reverb-graph-help';
import './components/graphs/strengths-graph';
import './localization/language-select';
import './components/environment-notice';
import './components/parameters-card';
import './components/parameters-table';
import './components/progress-indicator';

setBasePath('/shoelace');

// prepare chart.js library
Chart.register(
  BarElement,
  LineController,
  BarController,
  LineElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  PointElement,
  Tooltip
);
Chart.defaults.font.size = 15;
