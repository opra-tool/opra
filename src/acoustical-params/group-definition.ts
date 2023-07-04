import { TemplateResult } from 'lit';
import { OctaveBandParamDefinition } from './param-definition';

export interface AcousticalParamGroupDefinition {
  id: string;
  params: OctaveBandParamDefinition[];
  name: () => string | TemplateResult;
  description: () => string | TemplateResult;
}
