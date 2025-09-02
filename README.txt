NONSENSE TEXT FILTER - WEB INTERFACE
=====================================

Dette prosjektet er et system for å filtrere ut nonsens-tekster ved hjelp av 
7 forskjellige filtre og en trigram-basert språkmodell.

SYSTEMKRAV
----------
- Node.js installert på systemet
- En moderne nettleser (Chrome, Firefox, Safari, Edge)

OPPSTART AV INTERFACET
----------------------

1. Åpne Terminal/Kommandolinje

2. Naviger til prosjektmappen:
   cd "/Users/erlendkloumanhoiner/Desktop/Programmering/Nonsense texts filter/Nonsense filer v3"

3. Start serveren:
   node server.js

4. Åpne nettleseren og gå til:
   http://localhost:3000

5. Du vil nå se terminal-interfacet i nettleseren

BRUK AV INTERFACET
------------------

Terminal-interfacet har følgende kommandoer:

- help     : Viser alle tilgjengelige kommandoer og filterinformasjon
- clear    : Tømmer terminal-skjermen
- [tekst]  : Test en hvilken som helst tekst for nonsens-mønstre

Skriv bare inn tekst og trykk ENTER for å teste den mot alle filtrene.

STOPPE SERVEREN
---------------

For å stoppe serveren:
1. Gå tilbake til Terminal-vinduet hvor serveren kjører
2. Trykk Ctrl+C (Windows/Linux) eller Cmd+C (Mac)

Alternativt kan du kjøre:
pkill -f "node server.js"

FILTERENE SOM BRUKES
--------------------

Systemet bruker 7 forskjellige filtre for å oppdage nonsens-tekster:

1. Trigram Filter (språkmodell)
2. Dominant Character Filter
3. Character Repetition Filter  
4. Word to Character Ratio Filter
5. Dominant Word Filter
6. Word Repetition Filter
7. Pure Punctuation Filter

TEKNISKE DETALJER
-----------------

- Backend: Node.js server med Express-stil API
- Frontend: HTML/CSS/JavaScript terminal-interface
- Font: Monaco (eller fallback til andre monospace-fonter)
- Design: Responsiv med viewport-basert skalering
- API endpoint: /api/test (POST med JSON)

FEILSØKING
----------

Hvis serveren ikke starter:
- Sjekk at Node.js er installert: node --version
- Sjekk at du er i riktig mappe
- Sjekk at port 3000 ikke er opptatt

Hvis nettleseren ikke viser interfacet:
- Sjekk at serveren kjører (skal vise "Server running at...")
- Prøv å refresh siden (F5 eller Cmd+R)
- Sjekk konsollen for feilmeldinger (F12 → Console)

UTVIKLET AV
-----------
Erlend Klouman Høiner
August-September 2025
