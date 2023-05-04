// Do not modify this file by hand!
// Re-generate this file by running lit-localize

import { html } from 'lit';

/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const templates = {
  h21b9866c746fbbbf: html`Ausgabe normalisieren: Setzt das
    <code>normalize</code> Attribut der verwendeten <code>ConvolverNode</code>.
    Eine Änderung dieser Einstellung hat keinen Einfluss auf die aktuelle
    Wiedergabe.`,
  h9316bd703223dc0f: html`
    ${0} und ${1} beschreiben die Balance zwischen dem frühen und späten
    Schallanteil einer Raumimpulsantwort. ${2} wird hauptsächlich zur Bewertung
    von Sprache herangezogen, während ${3} für Musik verwendet wird. Beide
    Parameter sind in ISO 3382-1 definiert durch
  `,
  ha195ddcb3696a80c: html`
    In der Regel ist es nicht möglich, eine Abnahme der Schallenergie von 60 dB
    zu messen. Die Nachhallzeit wird daher durch Extrapolation einer linearen
    Regressionslinie gemessen, die an die Abnahme von -5 dB bis -25 dB angepasst
    wird. Die frühe Abklingzeit wird auf ähnliche Weise berechnet, wobei 0 und
    -10 dB zur Anpassung der Regressionslinie verwendet werden.
  `,
  s01b3b23ccba74fd8: `Lufttemperatur [°C]`,
  s08b05407b5565ca4: `oder`,
  s0edccf8ccc576146: `
            Der frühe und späte seitliche Schallpegel wird als Maß für die Zuhörer-Einhüllung berechnet.
            ISO 3382-1 definiert sie als
          `,
  s0f2b2dc9fb9dd86d: `Umgebungswerte erfolgreich gesetzt`,
  s15b70d1b44576ead: `Mitten/Seiten`,
  s16bb1dcb244b6f78: `Dieser Parameter wird benötigt, da der Referenzdruck angegeben ist.`,
  s1d239e20ebb93f76: `Zeit in Sekunden`,
  s21117c76540f5fe1: `Ja, alle entfernen`,
  s25090109e492e0f9: `Leistung der Schallquelle [W]`,
  s251a76634b35932d: `Frühes Basslevel`,
  s2568b2b00044bb29: `Als Referenzdruck wird hier der Wert der digitale Amplitude erwartet, welcher einem Schalldruck von 1 Pascal entspricht.`,
  s284f9a007a222dc2: `Alle Impulsantworten entfernen`,
  s29a26d2ca3ba8d74: `Fühes Stärkemaß`,
  s3019bdb56b4ee311: `Als binaurale Impulsantwort behandeln`,
  s30a6412eb8b9650e: `Nachhallzeit`,
  s3810c3632cd9ccce: `Siehe Spezifikation für Details`,
  s38389353bdfc8bcb: `Genauere Ergebnisse können erzielt werden, wenn die Leistung der Schallquelle und der Referenzdruck bekannt sind.`,
  s38beac14eccc0c6f: `Weitere Einstellungen für diese Impulsantwort`,
  s3df9c7b795b7e6c5: `ignoriert`,
  s40d760cc51e1ad71: `Für das Stärkemaß und verwandte Parameter werden Umgebungswerte angenommen.`,
  s44444cdb4765019f: `Kann nicht deaktiviert werden, da keine andere Impulsantwort aktiv ist.`,
  s477ffb0841b2808d: `
            Die Nachhallzeit ist seit mehr als einem Jahrhundert ein weit verbreiteter Parameter zur Bewertung raumakustischer Eindrücke.
            Sie beschreibt die Zeit, die nach dem Abschalten der Schallquelle benötigt wird, bis die Schallenergie um 60 dB abgenommen hat
          `,
  s4b3ab99331bfc6c7: `Nachhall`,
  s4c159fe41145b863: `Binaural`,
  s4e4d23b157b9c659: `Empfundener Bass`,
  s50dc09393c99feda: `Monaural`,
  s516f1f455d0b7007: `Sichtbarkeit in Graphen umschalten`,
  s5787e20cab57b383: `Unbekannter Fehler`,
  s5fe5299a9789b5c0: `Frühe IACC`,
  s6ad389116e8ea757: `
            Die interaurale Kreuzkorrelation (IACC) wird für binaurale Raumimpulsantworten berechnet.
            Diese werden mit Hilfe eines Kunstkopfes aufgenommen, der die charakteristischen Reflektionen der Ohrmuschel simuliert.
            Die IACC misst den Unterschied zwischen der Impulsantwort am rechten und der am linken Ohr.
            Um frühe Reflektionen zu berücksichtigen, wird zusätzlich der frühe IACC über die ersten 80ms der Impulsantwort berechnet. 
            Beide Parameter sind in der ISO 3382-1 durch die interaurale Kreuzkorrelationsfunktion (IACF) definiert
          `,
  s6b838cf87783f9bd: `Zeit [s]`,
  s6bc84d43b3db4bd0: `Höhenverhältnis`,
  s6ff0144bf13be05e: `Hilfe schließen`,
  s6ffa4e2d558d55af: `Frühe Abklingzeit`,
  s77254dde396a3476: `Faltung von Audiodateien anhand von Raumimpulsantworten`,
  s78cb1ae8a1d79653: `Als Mitten/Seiten Impulsantwort behandeln`,
  s7918caa28313467f: `Spätes Stärkemaß`,
  s794bcbe84b9b3840: `Umgebungswerte setzen`,
  s7f187fdac1f91f05: `Scheinbare Quellenbreite (ASW)`,
  s8407ec11c3fa5991: `Distanz zur Schallquelle [m]`,
  s858ca7435ce9ffa5: `Stärkemaß`,
  s8635817f218ac8bc: `Empfundene Höhen`,
  s8855c508722fe598: `Kann nicht aktiviert werden, da das Limit an gleichzeitig aktiven Impulsantworten erreicht ist.`,
  s88ad31dce26701b3: `Schwerpunktzeit`,
  s8a478db342bc2d89: `
            Das Stärkemaß ist ein Maß des subjektiven Basspegels.
            Sie ist definiert als das logarithmische Verhältnis zwischen der Schallenergie der Impulsantwort zu der einer anderen,
            im Abstand von 10 Metern zu der Schallquelle gemessenen Impulsantwort.
            Das frühe Stärkemaß wird für Schall vor der 80ms-Marke berechnet,
            das späte Stärkemaß für Schall nach der 80ms-Marke.
            ISO 3382-1 definiert das Stärkemaß als
          `,
  s8cf84c09568b1264: `Für dieses Element gibt es noch keine Hilfe.`,
  s8e8396b2db5b7c6c: `Nein, doch nicht`,
  s9224ed62985fbd03: `Kein Effekt`,
  s97128b8913cdfc3b: `Impulsantwort`,
  s979ceb45938c45d4: `Analysiere Datei(en) ...`,
  s9ed630bbd4e1a4d6: `Die Werte werden im Browser für deinen nächsten Besuch gespeichert.`,
  sa0cd790a6afc4722: `Empfundener Nachhall`,
  sa5be1ba4649735f8: `Einzahlwerte`,
  sa5dc5b21b42f8e51: `Umgebungswerte für Stärkemaß und verwandte Parameter setzen.`,
  sa839a71768515684: `Empfundene Klarheit des Klangs`,
  saca513c2aba139b1: `Relative Luftfeuchtigkeit [%]`,
  sacc7d7ed03aa6261: `Referenzdruck`,
  sad69d8cf37fd5551: `aktivierte Raumimpulsantwort(en)`,
  sadf9ac04abb2c03e: `Technische Details`,
  safa8613aa4ab25b3: `Ergebnisse herunterladen`,
  sc00a88b90cd60661: `Entfernen`,
  sc2af25399372651e: `Umgebungswerte anzeigen und setzen`,
  sc49fb4f16606971a: `Dieser Parameter wird benötigt, da der Referenzdruck oder die Leistung der Schallquelle angegeben ist.`,
  sc5369185e5aa8027: `Später seitlicher Schallpegel`,
  sc58d9c161092732d: `Dieser Parameter wird benötigt, da die Leistung der Schallquelle angegeben ist.`,
  sc6b8315cb7dc297d: `Ein Fehler ist aufgetreten`,
  scb830009d3d61b90: `Eigene Audiodateien hier ablegen`,
  sce52b3eced130d0a: `Diese Werte sind optional.`,
  sd14599a1d51f5fa8: `Was ist das?`,
  sd2f6b812a5a3e468: `
            Der frühe seitliche Energieanteil ist ein Maß für die scheinbare Breite einer Schallquelle.
            ISO 3382-1 definiert ihn als
          `,
  sd2ffce103eac0816: `Früher seitlicher Schallpegel`,
  sd3eac79f739323df: `Klarheitsmaß`,
  sd4076ccc972a1c65: `Früher seitlicher Energieanteil`,
  sd6b609963453c5c6: `Bei binauralen Raumimpulsantworten wird eine Mittelung beider Kanäle vorgenommen
          und aus dieser Mittelung dann monaurale Parameter berechnet.
          Die Head-Related Transfer Function kann Einfluss auf monaurale Parameter haben.`,
  sd80e4b4178b216ca: `Raumimpulsantwortdateien hier ablegen`,
  sda368d49761aef66: `Zuhörer-Einhüllung (LEV)`,
  se1efccbe41b18f79: `Frequenz [Hz]`,
  se511606cf6a6c4b5: `Bestätigung notwendig`,
  sea93d3c78c26da12: `Interaurale Kreuzkorrelation (IACC)`,
  sefcf950b3cc4fc3b: `Sprache`,
  sf11c26d807a68579: `Seitlicher Schallpegel`,
  sf26193ea9ec517e1: `Subjektiver Schallpegel`,
  sfba93af00dca196b: `Luftdichte`,
  sfcb0080cab096498: `Bist du sicher, dass alle Raumimpulsantworten entfernt werden sollen?`,
  sfd396ad5707a3135: `Bass-Verhältnis`,
  sfd963ba27f135016: `A-Gewichtetes Stärkemaß`,
  sfdb0e52d13786ac6: `Datei(en) auswählen`,
  s2a2957356ab1c7fe: `Level-Adjusted`,
};
