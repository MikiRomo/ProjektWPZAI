# 1. **Cel i zakres**

## Cel
Plantagotchi to aplikacja do zarządzania opieką nad roślinami domowymi.  
Użytkownik może dodawać rośliny, definiować gatunek i częstotliwość podlewania, a system wylicza harmonogram oraz wskazuje, które rośliny wymagają podlania.

## Zakres (in scope)
- Rejestracja roślin wraz z danymi podstawowymi i zdjęciem.
- Definicja interwału podlewania (1-365 dni).
- Automatyczne wyliczanie kolejnego terminu podlewania.
- Lista roślin do podlania i historia działań pielęgnacyjnych.
- Kalendarz miesięczny z oznaczeniem dni podlewania.
- Wskaźnik zdrowia rośliny (health score 0-100).
- Trwałość danych lokalnie (localStorage).
- Powiadomienia przeglądarkowe (po wyrażeniu zgody).
- Tryb jasny/ciemny.

## Poza zakresem (out of scope)
- Integracje z urządzeniami IoT/czujnikami wilgotności.
- Konta użytkowników i synchronizacja między urządzeniami.
- Powiadomienia push/SMS/e-mail z zewnętrznych usług.
- Zaawansowana diagnostyka zdrowia roślin (AI/computer vision).
- Rozbudowany kalendarz współdzielony.

# 2. **Funkcjonalności**

## Must-have
- Dodawanie, edycja i usuwanie roślin.
- Ustalanie interwału podlewania per roślina.
- Wyliczanie daty następnego podlewania.
- Rejestrowanie wykonanych działań (np. podlanie).
- Widok listy: zaległe, na dziś, nadchodzące.
- Walidacja danych wejściowych (Zod + błędy inline pod polami).
- Zakładki nawigacyjne: `Rośliny`, `Kalendarz`, `Historia`.
- Persystencja danych roślin i akcji.
- Minimum 5 testów jednostkowych logiki biznesowej.

## Nice-to-have
- Filtrowanie/sortowanie roślin (gatunek, status podlewania).
- Etykiety i notatki użytkownika.
- Podstawowe statystyki (np. liczba podlań w tygodniu).
- Eksport/import stanu aplikacji (JSON).
- Rozszerzone powiadomienia i personalizacja godzin przypomnień.

# 3. **Widoki / UI**

## 1) Ekran główny (Dashboard)
- Podsumowanie: liczba roślin i statystyki podlewania.
- Banner powiadomień (gdy użytkownik nie podjął decyzji o zgodzie).
- Toggle motywu (jasny/ciemny).
- Pasek zakładek do przełączania modułów.

## 2) Lista roślin
- Karty/wiersze roślin z najważniejszymi danymi.
- Status nawodnienia i data kolejnego podlewania.
- Akcje: podlano, aktualizacja, usuń.
- Zdjęcie rośliny 40x40 i fallback emoji.
- Pasek health score i status (`healthy`, `warning`, `critical`).

## 3) Formularz rośliny (dodawanie/edycja)
- Pola: nazwa, gatunek, interwał podlewania, data ostatniego podlania, zdjęcie, notatki.
- Walidacja i komunikaty błędów.
- Blokada przycisku zapisu przy niepoprawnych danych.

## 4) Szczegóły rośliny
- Pełne dane rośliny.
- Historia działań pielęgnacyjnych.
- Przycisk "Podlano teraz".

## 5) Widok historii działań
- Chronologiczna lista zdarzeń (podlanie/inna opieka).
- Filtrowanie po roślinie i typie akcji.

## 6) Empty state / onboarding
- Ilustracja doniczki (SVG inline).
- Komunikat startowy i CTA do formularza.
- Brak pustych sekcji listy przy zerowej liczbie roślin.

# 4. **Stack techniczny**

## Rekomendacja: React + Vite + TypeScript + localStorage + Vitest + Zod

### Uzasadnienie
- Aplikacja jest naturalnie "widokowa" (listy, statusy, formularze), więc React przyspiesza budowę UI.
- Vite zapewnia szybki start i krótkie czasy feedbacku podczas nauki/testowania.
- TypeScript poprawia bezpieczeństwo modelu danych (harmonogramy, daty, akcje).
- LocalStorage wystarczy na MVP bez kosztu backendu.
- Vitest zapewnia szybkie testy jednostkowe.
- Zod zapewnia spójną i typowaną walidację danych formularza.

## Alternatywa: Node.js aplikacja konsolowa
- Plusy: prostszy start i mniej warstw.
- Minusy: gorsza ergonomia codziennego użycia dla aplikacji, której rdzeniem jest lista zadań i szybkie oznaczanie czynności.
- Wniosek: dobra do nauki logiki, ale słabsza jako docelowe MVP produktu.

# 5. **Struktury danych**

```ts
/**
 * Reprezentuje pojedynczą roślinę w aplikacji.
 * @example
 * const plant: Plant = {
 *   id: "p1",
 *   name: "Monstera",
 *   species: "Monstera deliciosa",
 *   wateringFrequencyDays: 7,
 *   createdAt: "2026-04-13T10:00:00.000Z",
 *   updatedAt: "2026-04-13T10:00:00.000Z"
 * };
 */
export interface Plant {
  id: string;
  name: string;
  species: string;
  wateringIntervalDays: number;
  lastWatered: Date;
  photoUrl?: string;
  notes?: string;
  createdAt: Date;
}

/**
 * Opisuje harmonogram podlewania dla rośliny.
 * @example
 * const schedule: WateringSchedule = {
 *   plantId: "p1",
 *   lastWateredAt: "2026-04-10T08:00:00.000Z",
 *   nextWateringAt: "2026-04-17T08:00:00.000Z",
 *   isOverdue: false
 * };
 */
export interface WateringSchedule {
  plantId: string;
  lastWateredAt: Date | null;
  nextWateringAt: Date;
  isOverdue: boolean;
}

/**
 * Rejestruje pojedynczą akcję opieki nad rośliną.
 * @example
 * const action: CareAction = {
 *   id: "a1",
 *   plantId: "p1",
 *   type: "WATERING",
 *   performedAt: "2026-04-13T09:15:00.000Z",
 *   note: "Podlane umiarkowanie"
 * };
 */
export interface CareAction {
  id: string;
  plantId: string;
  type: "WATERING" | "FERTILIZING" | "REPOTTING";
  performedAt: Date;
  notes?: string;
}

/**
 * Globalny stan aplikacji przechowywany lokalnie.
 * @example
 * const state: AppState = {
 *   plants: [],
 *   schedules: [],
 *   careActions: [],
 *   version: 1
 * };
 */
export interface AppState {
  plants: Plant[];
  careActions: CareAction[];
  activeTab: "plants" | "calendar" | "history";
  theme: "light" | "dark" | "system";
}
```

# 6. **Ryzyka i założenia**

## Ryzyka
- **Daty i strefy czasowe**: błędne wyliczenia "na dziś" przy zmianie strefy/czasu letniego.
- **LocalStorage**: ograniczenia pojemności i brak synchronizacji między urządzeniami.
- **Spójność danych**: ryzyko rozjazdu między historią akcji a harmonogramem po błędnej aktualizacji.
- **Skalowanie**: przy dużej liczbie wpisów wydajność filtrowania może spadać bez optymalizacji.
- **Jakość danych wejściowych**: brak walidacji może psuć harmonogram (np. częstotliwość 0 lub ujemna).
- **Web Notifications API**: działanie zależne od uprawnień i wsparcia przeglądarki.
- **Rozmiar zdjęć**: przekroczenie limitu może powodować problemy z wydajnością i localStorage.

## Założenia
- MVP działa dla jednego użytkownika na jednym urządzeniu.
- Daty są serializowane jako ISO w localStorage i deserializowane do `Date`.
- Główna logika biznesowa będzie odseparowana od UI, aby testować ją jednostkowo.
- Historia akcji jest źródłem prawdy dla wykonanych czynności.
- Kod produkcyjny posiada komentarze dla funkcji i klas eksportowanych.

# 7. **Wymagania techniczne**

- Aplikacja oparta o React + TypeScript + Vite.
- Strict typing bez `any` i bez `@ts-ignore`.
- Walidacja formularzy przez Zod.
- Persystencja lokalna przez własne hooki.
- Testy jednostkowe realizowane przez Vitest.
- Stylowanie przez własne CSS (bez bibliotek UI).

# 8. **Wynik testów jednostkowych**

- Liczba testów: **38**
- Liczba plików testowych: **7**
- Status: **wszystkie testy przechodzą pomyślnie**
