import {
  Chart,
  LineController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Legend,
  Tooltip,
} from 'chart.js';
import initWasm from 'wasm-raqi-online-toolbox';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// shoelace components
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/divider/divider.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';

// register web components
import './components/AirValuesDialog';
import './components/AudioAnalyzer';
import './components/AudioInfoCard';
import './components/BaseCard';
import './components/ExecutionTime';
import './components/FileDrop';
import './components/GraphCard';
import './components/graphs/C50C80Graph';
import './components/graphs/IACCGraph';
import './components/graphs/ImpulseResponseGraph';
import './components/graphs/LineGraph';
import './components/graphs/ReverberationGraph';
import './components/graphs/StrengthGraph';
import './components/ParametersCard';
import './components/ParametersTable';
import './components/ProgressIndicator';
import './components/StrengthsCard';

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
  Legend,
  Tooltip
);
Chart.defaults.font.size = 15;
