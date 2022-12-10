import { html, render, TemplateResult } from 'lit';

function toast(
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

export function toastSuccess(message: string | TemplateResult) {
  return toast(message, 'success', 'check2-circle');
}

export function toastWarning(message: string | TemplateResult): Promise<void> {
  return toast(message, 'warning', 'exclamation-triangle');
}
