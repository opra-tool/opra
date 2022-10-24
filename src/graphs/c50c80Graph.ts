/* eslint-disable import/extensions */
import { GraphCard } from '../components/GraphCard';
import { getFrequencyLabels } from './common';

export function createC50C80Graph(
  c50: Float64Array,
  c80: Float64Array
): GraphCard {
  const card = document.createElement('graph-card');
  card.title = 'C50 / C80';
  card.labels = getFrequencyLabels();
  card.datasets = [
    {
      label: 'C50',
      data: c50,
      fill: false,
      borderColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'C80',
      data: c80,
      fill: false,
      borderColor: 'rgba(153, 102, 255, 0.5)',
    },
  ];

  return card;
}
