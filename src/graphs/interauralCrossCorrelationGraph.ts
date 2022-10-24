/* eslint-disable import/extensions */
import { GraphCard } from '../components/GraphCard';
import { GRAPH_COLOR_BLUE, GRAPH_COLOR_RED } from './colors';
import { getFrequencyLabels } from './common';

export function createInterauralCrossCorrelationGraph(
  iacc: Float64Array,
  eiacc: Float64Array
): GraphCard {
  const card = document.createElement('graph-card');
  card.title = 'Interaural Cross Correlation';
  card.labels = getFrequencyLabels();
  card.datasets = [
    {
      label: 'Interaural Cross Correlation',
      data: iacc,
      fill: false,
      borderColor: GRAPH_COLOR_BLUE,
    },
    {
      label: 'Early Interaural Cross Correlation',
      data: eiacc,
      fill: false,
      borderColor: GRAPH_COLOR_RED,
    },
  ];

  return card;
}
