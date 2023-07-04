import { html, render, TemplateResult } from 'lit';

function notify(
  message: string | TemplateResult,
  variant: string = 'primary',
  icon = 'info-circle'
): Promise<void> {
  const alert = Object.assign(document.createElement('sl-alert'), {
    variant,
    closable: true,
    duration: 4000,
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

export function notifySuccess(message: string | TemplateResult) {
  return notify(message, 'success', 'check2-circle');
}

export function notifyWarning(message: string | TemplateResult): Promise<void> {
  return notify(message, 'warning', 'exclamation-triangle');
}
