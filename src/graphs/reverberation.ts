import { GRAPH_COLOR_RED, GRAPH_COLOR_BLUE } from './colors';
import { GraphCard } from '../components/GraphCard';
import { getFrequencyLabels } from './common';

export function createReverberationGraph(
  edt: Float64Array,
  reverbTime: Float64Array
): GraphCard {
  const card = document.createElement('graph-card');
  card.title = 'Reverberation';
  card.labels = getFrequencyLabels();
  card.datasets = [
    {
      label: 'Energy Decay Curve',
      data: edt,
      fill: false,
      borderColor: GRAPH_COLOR_RED,
    },
    {
      // TODO: is this T30? 30 is passed into the method when calculations are made
      label: 'Reverb Time (T20)',
      data: reverbTime,
      fill: false,
      borderColor: GRAPH_COLOR_BLUE,
    },
  ];

  return card;
}
