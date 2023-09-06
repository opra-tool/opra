import { localized, msg } from '@lit/localize';
import { Chart } from 'chart.js';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { largestTriangleThreeBuckets } from '../math/decimation';

const LOWER_LIMIT = 1e-10;

@localized()
@customElement('impulse-response-graph')
export class ImpulseResponseGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: {
    fileColor: string;
    irSamples: Float32Array;
    sampleRate: number;
  }[] = [];

  @query('#canvas')
  private canvas!: HTMLCanvasElement;

  private chart: Chart | null = null;

  private chartDataHasChanged = false;

  private decimatedIRs: {
    fileColor: string;
    irSamples: Float32Array;
    decimatedPoints: { x: number; y: number }[];
  }[] = [];

  firstUpdated() {
    const ctx = this.canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('canvas 2D context required for drawing graph');
    }

    // This setTimeout() call is an ugly hack to circumvent a possible bug
    // in Firefox. If the chart is created synchronously an NS_ERROR_FAILURE
    // error is thrown. It seems the error is related to font rendering /
    // sizing of elements.
    setTimeout(() => {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          datasets: [],
        },
        options: {
          scales: {
            y: {
              max: 1,
              min: LOWER_LIMIT,
              title: {
                display: true,
                text: 'dBFs',
              },
              type: 'logarithmic',
              ticks: {
                callback: val => {
                  if (
                    typeof val === 'number' &&
                    val.toExponential().startsWith('1e')
                  ) {
                    return 10 * Math.log10(val);
                  }

                  return null;
                },
              },
            },
            x: {
              beginAtZero: true,
              type: 'linear',
              title: {
                display: true,
                text: msg('Time [s]'),
              },
            },
          },
          animation: false,
          plugins: {
            tooltip: {
              enabled: false,
            },
          },
        },
      });
      this.updateAllChanged();
      this.updateChart();
    }, 0);
  }

  protected willUpdate(changedProperties: PropertyValueMap<this>): void {
    if (!changedProperties.has('impulseResponses')) {
      return;
    }

    if (!this.chart) {
      return;
    }

    this.updateAllChanged();
  }

  protected updated(): void {
    if (this.chartDataHasChanged) {
      this.updateChart();
    }
  }

  protected render() {
    return html`
      <base-card .cardTitle=${msg('Impulse Response')}>
        <div>
          <canvas id="canvas" width="400" height="100"></canvas>
        </div>
      </base-card>
    `;
  }

  private updateChart() {
    if (!this.chart) {
      throw new Error('expected graph to be defined');
    }

    this.chart.data.datasets = this.decimatedIRs.map(
      ({ fileColor, decimatedPoints }) => ({
        data: decimatedPoints,
        fill: false,
        backgroundColor: fileColor,
        barThickness: 'flex',
      })
    );
    this.chart.update();
    this.chartDataHasChanged = false;
  }

  private updateAllChanged() {
    const newList = this.impulseResponses.map(
      ({ fileColor, irSamples, sampleRate }) => ({
        ...this.updateDecimatedIRSamples(irSamples, sampleRate),
        fileColor,
        irSamples,
      })
    );

    this.chartDataHasChanged =
      this.decimatedIRs.length !== newList.length ||
      newList.some(({ hasChanged }) => hasChanged);

    this.decimatedIRs = newList.map(({ hasChanged, ...rest }) => rest);
  }

  private updateDecimatedIRSamples = (
    irSamples: Float32Array,
    sampleRate: number
  ): { decimatedPoints: { x: number; y: number }[]; hasChanged: boolean } => {
    const existing = this.decimatedIRs.find(
      item => item.irSamples === irSamples
    );

    if (existing) {
      return {
        decimatedPoints: existing.decimatedPoints,
        hasChanged: false,
      };
    }

    const points = [];

    let lastIndexOfInterest = irSamples.length - 1;
    for (let i = irSamples.length - 1; i >= 0; i -= 1) {
      if (irSamples[i] ** 2 < LOWER_LIMIT) {
        lastIndexOfInterest = i;
      } else {
        break;
      }
    }

    const ofInterest = irSamples.subarray(0, lastIndexOfInterest + 1);

    for (let i = 0; i < ofInterest.length; i++) {
      points.push({
        x: (i + 1) / sampleRate,
        y: ofInterest[i] ** 2,
      });
    }

    const decimatedPoints = largestTriangleThreeBuckets(points, 400);

    return {
      decimatedPoints,
      hasChanged: true,
    };
  };
}
