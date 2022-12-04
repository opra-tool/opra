import { ChartDataset } from 'chart.js';
import { css, html, LitElement, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UNIT_HERTZ } from '../../units';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './line-graph';

type Dataset = {
  color: string;
  values: number[];
};

type Param = {
  key: string;
  name: string;
  label: string;
  datasets: Dataset[];
};

// see https://www.chartjs.org/docs/latest/charts/line.html#line-styling
const LINE_STYLES = [
  [], // line
  [6, 4], // dashed
  [2], // dotted
];

@customElement('octave-bands-graph')
export class OctaveBandsGraph extends LitElement {
  @property({ type: Array })
  params: Param[] = [];

  @property({ type: String })
  yAxisLabel: string = '';

  @state()
  private activeParams: string[] = [];

  protected firstUpdated() {
    this.activeParams = this.params.map(param => param.key);
  }

  protected render() {
    const datasets: ChartDataset<'line', number[]>[] = [];

    this.params.forEach((param, paramIndex) => {
      if (this.activeParams.includes(param.key)) {
        param.datasets.forEach(dataset => {
          datasets.push({
            label: param.label,
            data: dataset.values,
            borderColor: dataset.color,
            borderDash: LINE_STYLES[paramIndex],
          });
        });
      }
    });

    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets,
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: this.yAxisLabel,
            },
          },
          x: {
            title: {
              display: true,
              text: `Frequency [${UNIT_HERTZ}]`,
            },
          },
        },
      },
    };

    const legendItems = this.params.map(
      (param, index) => html`
        <div class="legend-item">
          <sl-checkbox
            ?checked=${this.activeParams.includes(param.key)}
            value=${param.label}
            @sl-change=${() => this.onToggleLabelItem(param.key)}
          >
            <span class="legend-item-label">
              <span>${param.label}</span>
              <svg class="legend-item-dash" viewBox="0 0 30 4">
                <line
                  x1="0"
                  y1="2"
                  x2="30"
                  y2="2"
                  stroke="currentColor"
                  stroke-width="4"
                  stroke-dasharray="${LINE_STYLES[index].join(' ')}"
                />
              </svg>
            </span>
          </sl-checkbox>
        </div>
      `
    );

    return html`
      <div class="legend">${legendItems}</div>
      <line-graph .config=${config}></line-graph>
    `;
  }

  private onToggleLabelItem(key: string) {
    if (this.activeParams.includes(key)) {
      this.activeParams = this.activeParams.filter(i => i !== key);
    } else {
      this.activeParams = [...this.activeParams, key];
    }
  }

  static styles = css`
    .legend {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-block-end: 1rem;
    }

    .legend-item {
      border: 1px solid var(--sl-color-neutral-500);
      background-color: var(--sl-color-neutral-200);
      border-radius: 0.5rem;
    }

    .legend-item-label {
      display: inline-flex;
      gap: 0.5rem;
      align-items: center;
    }

    .legend-item-dash {
      width: auto;
      height: 4px;
      color: var(--sl-color-neutral-1000);
    }

    sl-checkbox::part(base) {
      padding: 0.5rem;
    }
  `;
}
