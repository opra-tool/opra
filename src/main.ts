import { Chart, registerables } from 'chart.js';
import initWasm from 'wasm-raqi-online-toolbox';
import { InterauralCrossCorrelationGraph } from './components/graphs/InterauralCrossCorrelationGraph';
import { ImpulseResponseGraph } from './components/graphs/ImpulseResponseGraph';
import { ReverberationGraph } from './components/graphs/ReverberationGraph';
import { AudioAnalyzer } from './components/AudioAnalyzer';
import { AudioInfoCard } from './components/AudioInfoCard';
import { BaseCard } from './components/BaseCard';
import { ExecutionTime } from './components/ExecutionTime';
import { FileDrop } from './components/FileDrop';
import { GraphCard } from './components/GraphCard';
import { ParametersCard } from './components/ParametersCard';
import { ProgressIndicator } from './components/ProgressIndicator';
import { C50C80Graph } from './components/graphs/C50C80Graph';
import { StrengthGraph } from './components/graphs/StrengthGraph';

// init web assembly module
// eslint-disable-next-line no-console
initWasm().catch(console.error);

// register web components
declare global {
  interface HTMLElementTagNameMap {
    'audio-analyzer': AudioAnalyzer;
    'audio-info-card': AudioInfoCard;
    'base-card': BaseCard;
    'c50c80-graph': C50C80Graph;
    'execution-time': ExecutionTime;
    'impulse-response-graph': ImpulseResponseGraph;
    'interaural-cross-correlation-graph': InterauralCrossCorrelationGraph;
    'file-drop': FileDrop;
    'graph-card': GraphCard;
    'parameters-card': ParametersCard;
    'progress-indicator': ProgressIndicator;
    'reverberation-graph': ReverberationGraph;
    'strength-graph': StrengthGraph;
  }
}

customElements.define('audio-analyzer', AudioAnalyzer);
customElements.define('audio-info-card', AudioInfoCard);
customElements.define('base-card', BaseCard);
customElements.define('c50c80-graph', C50C80Graph);
customElements.define('execution-time', ExecutionTime);
customElements.define('impulse-response-graph', ImpulseResponseGraph);
customElements.define(
  'interaural-cross-correlation-graph',
  InterauralCrossCorrelationGraph
);
customElements.define('file-drop', FileDrop);
customElements.define('graph-card', GraphCard);
customElements.define('parameters-card', ParametersCard);
customElements.define('progress-indicator', ProgressIndicator);
customElements.define('reverberation-graph', ReverberationGraph);
customElements.define('strength-graph', StrengthGraph);

// prepare chart.js library
// TODO: only register components actually in use to reduce bundle size
Chart.register(...registerables);
