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
import { AppLogic } from '../app-logic';
import { JSONFileExporter } from '../exporter';
import { AppUI } from './app-ui';

// shoelace components
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
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
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

// application web components
import './components/base-card';
import './components/help-card';
import './binaural-note-card';
import './convolving/convolver-card';
import './discard-all-dialog';
import './components/error-details';
import './environment-dialog';
import './environment-notice';
import './components/file-drop';
import './file-dropdown';
import './file-list';
import './file-list-entry-options';
import './impulse-response-graph';
import './components/math-formula';
import './components/line-graph';
import './components/octave-bands-graph';
import './language-select';
import './parameters-card';
import './components/progress-indicator';
import './raqi-card';
import './components/reference-paper';

setBasePath('/shoelace');

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

export function initUi(mainComponent: HTMLElement) {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('cannot find root element');
  }

  rootElement.appendChild(mainComponent);
}
