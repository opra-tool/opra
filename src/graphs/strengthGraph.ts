import { GraphCard } from '../components/GraphCard';
import {
  GRAPH_COLOR_BLUE,
  GRAPH_COLOR_RED,
  GRAPH_COLOR_YELLOW,
} from './colors';
import { getFrequencyLabels } from './common';

export function createStrengthGraph(
  strength: Float64Array,
  earlyStrength: Float64Array,
  lateStrength: Float64Array
): GraphCard {
  const card = document.createElement('graph-card');
  card.title = 'Strength';
  card.labels = getFrequencyLabels();
  card.datasets = [
    {
      label: 'Strength',
      data: strength,
      fill: false,
      borderColor: GRAPH_COLOR_BLUE,
    },
    {
      label: 'Early Strength',
      data: earlyStrength,
      fill: false,
      borderColor: GRAPH_COLOR_RED,
    },
    {
      label: 'Late Strength',
      data: lateStrength,
      fill: false,
      borderColor: GRAPH_COLOR_YELLOW,
    },
  ];

  return card;
}
