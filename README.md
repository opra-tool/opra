<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/opra-tool/opra/assets/22923578/c0760cb2-1990-44d6-b71f-bb4a64913f65">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/opra-tool/opra/assets/22923578/a415253e-78dc-44db-97d5-61b863897a92">
      <img alt="The OPRA Logo, where the A transitions into a visual representation of a room impulse response" src="https://github.com/opra-tool/opra/assets/22923578/a07b44ba-ea00-4de8-b4de-4ab41f697792">
    </picture>
</p>

<p align="center">
    <b>Online tool for the prediction of room acoustical qualities</b>
</p>

<br>
<br>


This application calculates acoustical parameters from room impulse responses, primarily from ISO 3382-1[^1], Soulodre & Bradley[^2] and L.L. Beranek[^3].
It is in parts based on an earlier implemented Matlab tool[^4].
The accompanying masters thesis goes into detail about calculation methods used in this application[^5].

Both tools were programmed at the [Institute of Sound and Vibration Engineering​ (ISAVE)](https://isave.hs-duesseldorf.de/), which is part of the [Hochschule Düsseldorf](https://hs-duesseldorf.de/).

[^1]: ISO 3382-1. (2009). *Acoustics – Measurement of roomacoustic parameters – Part1: Performance Spaces*
[^2]: Soulodre, G. A., & Bradley, J. S. (1995). *Subjective evaluation of new room acoustic measures*
[^3]: Beranek, L. L. (1962). *Concert Halls and Opera Houses Music, Acoustics, and Architecture*
[^4]: Prinz, L. J. (2021). *Entwicklung eines Werkzeugs für dieAuswertung von Impulsantworten zur Untersuchung raumakustischer Qualität*
[^5]: Schwörer, P. (2023). *A web-based toolbox for analyzing acoustic room impulse responses*

## Using OPRA

OPRA is available at [https://opra.isave.hs-duesseldorf.de](https://opra.isave.hs-duesseldorf.de/).
All data is kept locally in your browser.

## Room impulse response files

Room impulse response files can be obtained through [github.com/RoyJames/room-impulse-responses](https://github.com/RoyJames/room-impulse-responses).
Some are also stored in this repository in [testfiles/](./testfiles/).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md);

## Known Issues

### Stuttering in Chromium-based browsers on Linux

There seems to be a bug in chromium-based browsers with certain Linux configurations.
`createIIRFilter()` takes around 50ms to complete, while on Firefox, it takes <1ms.
This causes the UI to be unresponsive during file analyzing ([minimal example](https://gist.github.com/paulschwoerer/57e92f20ffb11fee4db4c286d717db3f)).
Consider switching to Firefox.
