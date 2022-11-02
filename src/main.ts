import {
  Chart,
  LineController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
} from 'chart.js';
import initWasm from 'wasm-raqi-online-toolbox';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// register web components
import './components/graphs/IACCGraph';
import './components/graphs/ImpulseResponseGraph';
import './components/graphs/ReverberationGraph';
import './components/AudioAnalyzer';
import './components/AudioInfoCard';
import './components/BaseCard';
import './components/ExecutionTime';
import './components/FileDrop';
import './components/GraphCard';
import './components/ParametersCard';
import './components/ProgressIndicator';
import './components/graphs/C50C80Graph';
import './components/graphs/StrengthGraph';

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
  PointElement
);
Chart.defaults.font.size = 15;
