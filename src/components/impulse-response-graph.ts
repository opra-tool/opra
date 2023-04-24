import { msg, localized } from '@lit/localize';
import { Chart } from 'chart.js';
import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ImpulseResponse } from '../analyzing/impulse-response';
import { Analyzer } from '../analyzing/analyzer';
import { largestTriangleThreeBuckets } from '../math/decimation';

const LOWER_LIMIT = 1e-10;

@localized()
@customElement('impulse-response-graph')
export class ImpulseResponseGraph extends LitElement {
  @property({ type: Object })
  analyzer!: Analyzer;

  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @query('#canvas')
  private canvas!: HTMLCanvasElement;

  private chart: Chart | null = null;

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
                text: msg('Sound energy'),
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

      this.updateGraphDatasets();
      this.chart.update();
    }, 0);
  }

  shouldUpdate(changedProperties: PropertyValues<this>): boolean {
    if (!changedProperties.has('impulseResponses')) {
      return false;
    }

    // is undefined on first render
    const previousResponses: ImpulseResponse[] | undefined =
      changedProperties.get('impulseResponses');

    if (previousResponses === undefined) {
      return true;
    }

    if (this.impulseResponses.length !== previousResponses.length) {
      return true;
    }

    return this.impulseResponses.some(
      response =>
        !previousResponses ||
        previousResponses.find(r => r.id === response.id)?.buffer !==
          response.buffer
    );
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.get('impulseResponses') === undefined) {
      return;
    }

    if (!this.chart) {
      return;
    }

    this.chart.data.datasets = [];

    this.updateGraphDatasets();
  }

  updated() {
    this.chart?.update();
  }

  render() {
    return html`
      <titled-card .cardTitle=${msg('Squared Impulse Response')}>
        <div>
          <canvas id="canvas" width="400" height="100"></canvas>
        </div>
      </titled-card>
    `;
  }

  private updateGraphDatasets() {
    if (!this.chart) {
      throw new Error('expected graph to be defined');
    }

    for (const response of this.impulseResponses) {
      const points = [];
      const squaredIR = this.analyzer.getSquaredIR(response.id);

      let lastIndexOfInterest = squaredIR.length - 1;
      for (let i = squaredIR.length - 1; i >= 0; i -= 1) {
        if (squaredIR[i] < LOWER_LIMIT) {
          lastIndexOfInterest = i;
        } else {
          break;
        }
      }

      const squaredIROfInterest = squaredIR.subarray(
        0,
        lastIndexOfInterest + 1
      );

      for (let i = 0; i < squaredIROfInterest.length; i++) {
        points.push({
          x: (i + 1) / response.sampleRate,
          y: squaredIROfInterest[i],
        });
      }

      const decimated = largestTriangleThreeBuckets(points, 400);

      this.chart.data.datasets.push({
        data: decimated,
        fill: false,
        backgroundColor: response.color,
        barThickness: 'flex',
      });
    }
  }
}
