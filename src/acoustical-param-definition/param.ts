import { TemplateResult } from 'lit';

export interface AcousticalParam {
  id: string;
  name: () => string | TemplateResult;
  description: () => string | TemplateResult;

  source: {
    url: string;
    shortName: string;
    longName: string;
  };

  symbol?: () => string | TemplateResult;
  unit?: string;
}

export function createParam(definition: AcousticalParam) {
  return definition;
}
