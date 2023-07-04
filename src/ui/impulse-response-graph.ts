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

  private decimatedIRSamples: {
    fileColor: string;
    squaredIR: Float32Array;
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
                text: 'dB',
              },
              type: 'logarithmic',
              ticks: {
                callback: val => {
                  if (
                    typeof val === 'number' &&
                    val.toExponential().startsWith('1e')
                  ) {
                    return val.toExponential();
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

    this.chart.data.datasets = this.decimatedIRSamples.map(
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
      ({ fileColor, irSamples: squaredIR, sampleRate }) => ({
        ...this.updateDecimatedIRSamples(squaredIR, sampleRate),
        fileColor,
        squaredIR,
      })
    );

    this.chartDataHasChanged =
      this.decimatedIRSamples.length !== newList.length ||
      newList.some(({ hasChanged }) => hasChanged);

    this.decimatedIRSamples = newList.map(({ hasChanged, ...rest }) => rest);
  }

  private updateDecimatedIRSamples = (
    squaredIR: Float32Array,
    sampleRate: number
  ): { decimatedPoints: { x: number; y: number }[]; hasChanged: boolean } => {
    const existing = this.decimatedIRSamples.find(
      item => item.squaredIR === squaredIR
    );

    if (existing) {
      return {
        decimatedPoints: existing.decimatedPoints,
        hasChanged: false,
      };
    }

    const points = [];

    let lastIndexOfInterest = squaredIR.length - 1;
    for (let i = squaredIR.length - 1; i >= 0; i -= 1) {
      if (squaredIR[i] < LOWER_LIMIT) {
        lastIndexOfInterest = i;
      } else {
        break;
      }
    }

    const squaredIROfInterest = squaredIR.subarray(0, lastIndexOfInterest + 1);

    for (let i = 0; i < squaredIROfInterest.length; i++) {
      points.push({
        x: (i + 1) / sampleRate,
        y: squaredIROfInterest[i],
      });
    }

    const decimatedPoints = largestTriangleThreeBuckets(points, 400);

    return {
      decimatedPoints,
      hasChanged: true,
    };
  };
}
