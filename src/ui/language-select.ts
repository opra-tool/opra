import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { configureLocalization, localized, msg } from '@lit/localize';
import { SlMenuItem } from '@shoelace-style/shoelace';
import {
  sourceLocale,
  targetLocales,
  allLocales,
} from '../localization/locales';
import { templates } from '../localization/locales/de';

const LOCALIZED_TEMPLATES = new Map([['de', { templates }]]);

const LOCALE_NAMES = {
  de: 'Deutsch',
  en: 'English',
};

@localized()
@customElement('language-select')
export class LanguageSelect extends LitElement {
  private setLocale: (locale: string) => Promise<void>;

  private getLocale: () => string;

  constructor() {
    super();

    const { setLocale, getLocale } = configureLocalization({
      sourceLocale,
      targetLocales,
      loadLocale: async locale => {
        const module = LOCALIZED_TEMPLATES.get(locale);

        if (!module) {
          setLocale('en');
          throw new Error(`could not load locale '${locale}'`);
        }

        return module;
      },
    });

    this.setLocale = setLocale;
    this.getLocale = getLocale;

    if (targetLocales.find(l => l === getPrefferedLanguage())) {
      setLocale(getPrefferedLanguage());
    }
  }

  protected render() {
    return html`
      <sl-dropdown>
        <sl-button slot="trigger" caret>
          <sl-icon slot="prefix" name="globe2"></sl-icon>
          ${msg('Language')}
        </sl-button>
        <sl-menu @sl-select=${this.onSelect}>
          ${allLocales.map(
            locale => html`
              <sl-menu-item
                key=${locale}
                value=${locale}
                .disabled=${this.getLocale() === locale}
              >
                ${LOCALE_NAMES[locale]}
              </sl-menu-item>
            `
          )}
        </sl-menu>
      </sl-dropdown>
    `;
  }

  private async onSelect({
    detail: { item },
  }: CustomEvent<{ item: SlMenuItem }>) {
    await this.setLocale(item.value);
    this.requestUpdate();
  }
}

function getPrefferedLanguage() {
  return navigator.language.split('-')[0];
}
