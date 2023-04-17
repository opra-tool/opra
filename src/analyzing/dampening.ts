/**
 * Calculate dampening of audible sound in air at an assumed pressure of one atmosphere (101325 kPa).
 *
 * Based on the implementation by Eberhard Sengpiel (http://www.sengpielaudio.com/Rechner-luft.htm).
 *
 * @param temperature Temperatue from -20°C to +50°C.
 * @param relativeHumidity Relative air humidity from 10% to 100%.
 * @param frequency Frequency from 50Hz to 10kHz.
 * @returns Dampening in dB / m.
 */
export function calculateSoundDampingInAir(
  temperature: number,
  relativeHumidity: number,
  frequency: number
): number {
  if (temperature < -20 || temperature > 50) {
    throw new Error('expected temperature between -20°C and +50°C');
  }

  if (relativeHumidity < 10 || relativeHumidity > 100) {
    throw new Error('expected relative humidity between 10% and 100%');
  }

  if (frequency < 50 || frequency > 10_000) {
    throw new Error('expected frequency between 50Hz and 10kHz');
  }

  const airTemperatureKelvin = temperature + 273.15;
  const CHumid = 4.6151 - 6.8346 * (273.15 / airTemperatureKelvin) ** 1.261;
  const hum = relativeHumidity * 10 ** CHumid;
  // convert to relative air temp (re 20 deg C)
  const tempr = airTemperatureKelvin / 293.15;
  const frO = 24 + (4.04e4 * hum * (0.02 + hum)) / (0.391 + hum);
  const frN =
    tempr ** -0.5 * (9 + 280 * hum * Math.exp(-4.17 * (tempr ** (-1 / 3) - 1)));
  const alpha =
    8.686 *
    frequency *
    frequency *
    (1.84e-11 * Math.sqrt(tempr) +
      tempr ** -2.5 *
        (0.01275 *
          (Math.exp(-2239.1 / airTemperatureKelvin) /
            (frO + (frequency * frequency) / frO)) +
          0.1068 *
            (Math.exp(-3352 / airTemperatureKelvin) /
              (frN + (frequency * frequency) / frN))));

  return alpha;
}
