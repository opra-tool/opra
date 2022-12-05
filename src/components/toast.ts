import { html, render, TemplateResult } from 'lit';

export function toast(
  message: string | TemplateResult,
  variant = 'primary',
  icon = 'info-circle',
  duration = 4000
): Promise<void> {
  const alert = Object.assign(document.createElement('sl-alert'), {
    variant,
    closable: true,
    duration,
  });

  render(
    html`
      <sl-icon name="${icon}" slot="icon"></sl-icon>
      ${message}
    `,
    alert
  );

  document.body.append(alert);
  return alert.toast();
}
