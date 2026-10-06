# Paketpreis für die EU

Mobil optimierter Rechner für Warenpreis, DHL-Privatkundenversand ab Deutschland und einen PayPal-Aufschlag von 4 %. Statische Website für GitHub Pages, ohne Backend, Datenbank oder Docker.

Die Website ist über GitHub Pages unter [https://jensgiehl.github.io/bg-price-calculation/](https://jensgiehl.github.io/bg-price-calculation/) erreichbar.

## Berechnung

1. Warenpreis in Euro eingeben, z. B. `50,00` oder `50.00`.
2. DHL Paket bis 2, 5 oder 10 kg wählen.
3. Eines der 27 EU-Länder mit lokaler SVG-Flagge auswählen. Standard ist Deutschland; der Warenpreis startet leer.

`Gesamtpreis = Warenpreis + Versand + rund((Warenpreis + Versand) × 0,04)`

Alle Beträge werden in ganzen Cent verarbeitet. Der Aufschlag wird kaufmännisch auf Cent gerundet. Beispiel: 50,00 € Warenpreis + 17,49 € Versand + 2,70 € Aufschlag = **70,19 €**. Auch ein Warenpreis von 0 € ist möglich. Die 4 % sind ein vorgegebener Aufschlag, keine Abfrage tatsächlicher PayPal-Gebühren und keine Hochrechnung zur vollständigen Deckung abgezogener Gebühren.

Neben „Gesamtpreis kopieren“ gibt es „BGG-Text kopieren“. Der Button kopiert eine kurze englische Nachricht als Klartext mit Zeilenumbrüchen und Absätzen für BoardGameGeek/GeekMail. Sie enthält den Warenpreis, DHL-Versand ins gewählte Land mit Trackingnummer und Versicherung bis 500 EUR, den PayPal-Betrag und die Rechnung zur Gesamtsumme. Prozentangabe und Paketgewicht werden ausgelassen. Der Nachrichtentext wird auf der Seite nicht angezeigt. Die Zwischenablage benötigt HTTPS oder localhost; ohne gültigen Warenpreis bleiben beide Kopierbuttons deaktiviert. [DHL bestätigt Tracking und Versicherung für Paket International](https://www.dhl.de/de/privatkunden/hilfe-kundenservice/themen/international/export.html).

Die Oberfläche beginnt direkt mit dem Rechner, ohne Header. Im Footer wird der letzte erfolgreiche DHL-Abruf mit Datum und Uhrzeit für Europe/Berlin angezeigt.

## Preisquelle und Geltungsbereich

- [DHL Paket international, Zone 1 – Europäische Union](https://www.dhl.de/de/privatkunden/pakete-versenden/weltweit-versenden/preise-international.html)
- [DHL Paket national](https://www.dhl.de/de/privatkunden/pakete-versenden/deutschlandweit-versenden/preise-national.html) für Deutschland

Verwendet werden die Einzelpreise der **Online-Frankierung für Privatkunden**, keine Päckchen, Filialpreise, Sparsets oder Expressprodukte. Die EU-Auslandsländer teilen sich derzeit einen Tarif. Deutschland verwendet den Inlandstarif. Monaco wird trotz seiner Zuordnung zur DHL-Zone 1 nicht angeboten, da es kein EU-Mitglied ist.

Die JSON-Datei enthält Preise in Cent pro Tarifzone und Gewicht sowie die Zuordnung aller Länder. Paketmaße: 2 kg bis 60 × 30 × 15 cm; 5 und 10 kg bis 120 × 60 × 60 cm, Gurtmaß maximal 300 cm. Ausgenommene Sondergebiete werden bei der Länderauswahl angezeigt. Zusatzleistungen sind nicht enthalten. Preise und Konditionen vor dem Versand bei DHL prüfen.

Der Abruf liest die öffentlichen HTML-Preistabellen; es handelt sich nicht um eine zugesicherte Preis-API. Ändert DHL die Struktur oder Länderzuordnung, muss der Parser gegebenenfalls angepasst werden. Bei HTTP-, Parsing- oder Validierungsfehlern schlägt der Workflow fehl und **überschreibt keine vorhandenen Preise**. Identische Tabellen für Mobil- und Desktopansicht werden akzeptiert, widersprüchliche Preise abgelehnt. Drei Abrufversuche mit Timeout sind vorgesehen. Ein über 24 Stunden alter Prüfstand wird auf der Seite hervorgehoben, damit ein ausgebliebener täglicher Abruf sichtbar wird.

## GitHub einrichten

1. Dateien in ein GitHub-Repository pushen. Der Default-Branch muss `main` oder `master` sein.
2. Unter **Settings → Pages → Build and deployment → Source** die Option **GitHub Actions** auswählen.
3. GitHub Actions für das Repository aktivieren und die verwendeten offiziellen `actions/*` zulassen. Der Preisworkflow benötigt `contents: write`; Organisationsrichtlinien und Branch-Schutz müssen dem Actions-Bot direkte Commits erlauben. Die Berechtigungen sind in den Workflows definiert; ein zusätzliches Personal Access Token ist nicht nötig.
4. Falls das Environment `github-pages` auf bestimmte Branches eingeschränkt ist, den Default-Branch erlauben.
5. Den Workflow **GitHub Pages** starten oder auf `main`/`master` pushen. Die fertige URL steht im Deployment und unter Settings → Pages.
6. Optional einmal **DHL-Preise aktualisieren → Run workflow** auf dem Default-Branch ausführen.

Der tägliche Abruf ist für **05:23 UTC** geplant, also 06:23 Uhr im deutschen Winter und 07:23 Uhr im Sommer. GitHub kann geplante Ausführungen verzögern; Zeitpläne laufen nur auf dem Default-Branch. In inaktiven öffentlichen Repositories kann GitHub Zeitpläne nach 60 Tagen deaktivieren. Bei Fehlschlägen die Actions-Läufe prüfen.

Jeder erfolgreiche tägliche Abruf aktualisiert `checkedAt` und committet die JSON-Datei, auch bei unveränderten Preisen. `pricesChangedAt` ändert sich nur bei Tarifänderungen. Anschließend wird der Pages-Workflow direkt als wiederverwendbarer Workflow aufgerufen und baut den tatsächlich gepushten Commit. Das ist notwendig, weil ein Push mit `GITHUB_TOKEN` keinen neuen Push-Workflow auslöst. Gewöhnliche Pushes auf `main` und `master` veröffentlichen ebenfalls die Seite. Es gibt keine Commit-Schleife.

Ist der Default-Branch geschützt und erlaubt keine direkten Bot-Commits, ist der Update-Workflow in dieser Form nicht lauffähig; dafür wäre ein gesonderter Pull-Request-Ablauf nötig. Ein konkurrierender Push wird vor dem Bot-Push per Rebase berücksichtigt. Konflikte führen zu einem Fehler statt zu einem erzwungenen Push.

## Lokal entwickeln

Node.js ab Version 22 und npm; für CI wird Node.js 24 verwendet.

```sh
npm ci
npm test
npm run build
npm run preview
```

Dann [http://127.0.0.1:4173](http://127.0.0.1:4173) öffnen. Der mitgelieferte, geprüfte Preisstand ermöglicht einen Build ohne erneuten DHL-Abruf. Den Stand manuell aktualisieren:

```sh
npm run update-prices
npm test
npm run build
```

Abhängigkeiten kommen aus npm. **Bootstrap 5.3.8 wird als unverändertes WebJar `org.webjars:bootstrap` aus Maven Central mitgeliefert** (`vendor/bootstrap-5.3.8.jar`), mit einem fest hinterlegten SHA-256 geprüft und als lokale CSS-Datei nach `dist/vendor` extrahiert. Dadurch benötigt der Build keinen Maven-Central-Download. Es ist kein Java-Projekt; zur Verarbeitung des WebJars ist keine Java-Installation nötig. Die 27 Länderflaggen werden aus [flag-icons](https://github.com/lipis/flag-icons) (MIT-Lizenz) als SVG-Dateien nach `dist/flags` kopiert; die Lizenz liegt in `dist/vendor/flag-icons-LICENSE.txt`. Die Auswahlliste verwendet Bilder statt systemabhängiger Flaggen-Emoji. Sie lässt sich auch per Tastatur bedienen: Pfeiltasten, Home/End, Anfangsbuchstaben, Enter und Escape. Der Browser benötigt keine externe CDN-Verbindung. Texte und Dateien verwenden UTF-8. Alle Asset- und Datenpfade sind relativ, damit auch GitHub Pages unter einem Repository-Unterpfad funktioniert.

## Struktur

| Pfad | Zweck |
| --- | --- |
| `site/` | HTML, CSS und Browserlogik |
| `site/data/dhl-prices.json` | Automatisch geprüfter Preisstand und Länder |
| `scripts/update-prices.mjs` | Abruf und atomare JSON-Aktualisierung |
| `scripts/price-parser.mjs` | Striktes Auslesen der DHL-Pakettabellen |
| `scripts/build.mjs` | Statische Ausgabe mit Bootstrap-WebJar |
| `test/` | Berechnung, alle Länder/Gewichte und Parser-Fehlerfälle |
| `.github/workflows/update-prices.yml` | Täglicher Abruf, Commit und Veröffentlichung |
| `.github/workflows/pages.yml` | Veröffentlichung nach Push oder Wiederverwendung |
| `.github/workflows/check.yml` | Tests und Build bei Pull Requests |

Die HTML-Testfixtures sind gekürzte Tabellenausschnitte der oben verlinkten DHL-Seiten. `dist/`, `.cache/` und `node_modules/` werden nicht committet. Zum Deployment wird ausschließlich `dist/` verwendet.
