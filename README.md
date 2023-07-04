<p align="center"><img width="340"src="https://github.com/paulschwoerer/raqi-online-toolbox/assets/22923578/b11d3bea-53cd-48c3-b154-5473dcca481a"></p>

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

## Staging Environment

A staging environment reflecting the current state of the `main` branch is availabe at [raqi-staging.paulschwoerer.de](https://raqi-staging.paulschwoerer.de/).

## Room impulse response files

Room impulse response files can be obtained through [github.com/RoyJames/room-impulse-responses](https://github.com/RoyJames/room-impulse-responses).
Some are also stored in this repository in [testfiles/](./testfiles/).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md);
