import { GRAPH_COLOR_BLUE } from './colors';
import { GraphCard } from '../components/GraphCard';

export function createSquaredImpulseResponseGraph(
  audio: Float64Array,
  fs: number,
  resolution: number,
  maximumX: number
): GraphCard {
  const labels = [];
  const yValues = new Float64Array(Math.floor(audio.length / resolution));

  for (let i = 0; i < audio.length; i += resolution) {
    const x = (i + 1) / fs;

    if (x > maximumX) {
      break;
    }

    labels.push(x.toFixed(2).toString());
    yValues[Math.floor(i / resolution)] = Math.abs(audio[i]);
  }

  const card = document.createElement('graph-card');
  card.title = 'Squared Impulse Response';
  card.labels = labels;
  card.datasets = [
    {
      label: 'Squared IR',
      data: yValues,
      fill: false,
      borderColor: GRAPH_COLOR_BLUE,
      borderWidth: 1,
    },
  ];

  return card;
}
