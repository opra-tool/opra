import { html } from 'lit';

const TRESHOLD = 0.001;

export const P0_VAR = html`<var>p<sub>0</sub></var>`;

export function formatP0(p0: number): string {
  if (p0 <= TRESHOLD) {
    return p0.toExponential();
  }

  return p0.toString();
}
