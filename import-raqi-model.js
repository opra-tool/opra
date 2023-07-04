const fs = require('fs');
const { exit } = require('process');

const args = process.argv.slice(2);

if (args.length === 0) {
  // eslint-disable-next-line no-console
  console.log('ERROR: a path to the RAQI model file is needed')
  exit(1);
}

const fileContents = fs.readFileSync(args[0]);

const json = JSON.parse(fileContents);

const parameters = [];

function mapCoefficients(key, type) {
  const data = json[key][type];
  
  return `{
    coefficients: {
      ${Object.entries(data.coefficients)
        .map(([k, v]) => `${k}: ${v}`).join(',\n      ')}
    },
    stimulusIntercepts: {
      ${Object.entries(data.stimulusIntercepts)
        .map(([k, v]) => `${k.replace('interceptStim_', '')}: ${v}`).join(',\n      ')}
    },
    intercept: ${data.intercept.intercept}
  }`;
}

for (const key of Object.keys(json)) {
  const parameter = json[key];

  const { nameEnglish } = parameter;
  const nameGerman = parameter.nameGerman
    .replace('ae', 'ä')
    .replace('ue', 'ü')
    .replace('oe', 'ö');

  const parameterStr = `{
  id: "${nameEnglish.toLowerCase().replace(/\s/g, '-')}",
  nameEnglish: "${nameEnglish}",
  nameGerman: "${nameGerman}",
  omnidirectional: ${mapCoefficients(key, 'omnidirectional')},
  binaural: ${mapCoefficients(key, 'binaural')},
  'mid-side': ${mapCoefficients(key, 'mid_side')}
}`;

  parameters.push(parameterStr)
}

const code = `export const RAQI_PARAMETERS = [${parameters.join(', ')}];

export type RAQIParameter = typeof RAQI_PARAMETERS extends readonly (infer ElementType)[] ? ElementType : never
`;


fs.writeFileSync('./src/raqi/raqi-data.ts', code);