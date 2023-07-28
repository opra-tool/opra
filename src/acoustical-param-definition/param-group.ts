import { TemplateResult } from 'lit';
import { AcousticalParam } from './param';

export interface AcousticalParamGroup {
  id: string;
  params: AcousticalParam[];
  name: () => string | TemplateResult;
  description: () => string | TemplateResult;
}
