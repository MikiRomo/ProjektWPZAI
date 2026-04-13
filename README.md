# Plantagotchi

Plantagotchi to aplikacja webowa do monitorowania podlewania roślin domowych.  
Użytkownik może dodawać rośliny, określać interwał podlewania, przeglądać kalendarz i historię działań oraz oceniać kondycję roślin na podstawie wskaźnika zdrowia.

## Główne funkcje aplikacji

- dodawanie, edycja i usuwanie roślin,
- zapisywanie ostatniego podlania i automatyczne wyliczanie kolejnych terminów,
- widok zakładkowy: `Rośliny`, `Kalendarz`, `Historia`,
- health score 0-100 z paskiem postępu i statusem (`healthy`, `warning`, `critical`),
- upload zdjęcia rośliny (base64) z limitem rozmiaru 200KB,
- powiadomienia przeglądarkowe o podlewaniu (Web Notifications API),
- tryb jasny/ciemny z zapisem preferencji,
- persystencja danych przez localStorage.

## Instrukcja instalacji i uruchomienia

### Wymagania

- Node.js 20+,
- npm 10+.

### Instalacja

```bash
npm install
```

### Uruchomienie deweloperskie

```bash
npm run dev
```

Domyślny adres: `http://localhost:5173/` (lub kolejny wolny port, np. `5174`).

### Build produkcyjny

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Testy jednostkowe

```bash
npm test
```

## Technologie

- React 19
- TypeScript
- Vite
- Vitest
- Zod
- ESLint
- localStorage (przechowywanie stanu)
- Web Notifications API

## Status testów jednostkowych

Aktualnie wszystkie testy przechodzą pomyślnie:
- `7` plików testowych,
- `38` testów,
- status: **passed**.

## Dokumentacja dodatkowa

Szczegółowa specyfikacja projektu znajduje się w pliku `specyfikacja.md`.

## Zakres wsparcia AI

### Etapy wykonane samodzielnie

- wykonanie większości funkcjonalności aplikacji,
- przygotowanie głównego wyglądu i układu interfejsu,
- decyzje dotyczące kierunku rozwoju i testowanie działania.

### Etapy wykonane z pomocą AI

- poprawa i ulepszenie istniejącego programu,
- wsparcie w refaktoryzacji wybranych elementów kodu,
- pomoc w dopracowaniu dokumentacji technicznej.
