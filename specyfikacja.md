# 1. **Cel i zakres**

## Cel
Plantagotchi to aplikacja do zarządzania opieką nad roślinami domowymi.  
Użytkownik może dodawać rośliny, definiować gatunek i częstotliwość podlewania, a system wylicza harmonogram oraz wskazuje, które rośliny wymagają podlania.

## Zakres (in scope)
- Rejestracja roślin wraz z podstawowymi danymi.
- Definicja częstotliwości podlewania (w dniach).
- Automatyczne wyliczanie kolejnego terminu podlewania.
- Lista roślin do podlania "dzisiaj" i "w najbliższym czasie".
- Oznaczanie wykonania czynności pielęgnacyjnej.
- Trwałość danych lokalnie (bez backendu).

## Poza zakresem (out of scope)
- Integracje z urządzeniami IoT/czujnikami wilgotności.
- Konta użytkowników i synchronizacja między urządzeniami.
- Powiadomienia push/SMS/e-mail z zewnętrznych usług.
- Zaawansowana diagnostyka zdrowia roślin (AI/computer vision).
- Rozbudowany kalendarz współdzielony.

# 2. **Funkcjonalności**

## Must-have
- Dodawanie, edycja i usuwanie roślin.
- Ustalanie częstotliwości podlewania per roślina.
- Wyliczanie daty następnego podlewania.
- Rejestrowanie wykonanych działań (np. podlanie).
- Widok listy: zaległe, na dziś, nadchodzące.
- Walidacja danych wejściowych (np. częstotliwość > 0).

## Nice-to-have
- Filtrowanie/sortowanie roślin (gatunek, status podlewania).
- Etykiety i notatki użytkownika.
- Podstawowe statystyki (np. liczba podlań w tygodniu).
- Eksport/import stanu aplikacji (JSON).
- Tryb ciemny.

# 3. **Widoki / UI**

## 1) Ekran główny (Dashboard)
- Podsumowanie: ile roślin wymaga podlania dziś.
- Sekcje: "Zaległe", "Dziś", "Nadchodzące".
- Szybkie akcje: "Dodaj roślinę", "Oznacz jako podlane".

## 2) Lista roślin
- Karty/wiersze roślin z najważniejszymi danymi.
- Status nawodnienia i data kolejnego podlewania.
- Akcje: podgląd szczegółów, edycja, usuń.

## 3) Formularz rośliny (dodawanie/edycja)
- Pola: nazwa, gatunek, częstotliwość podlewania, data ostatniego podlania.
- Walidacja i komunikaty błędów.
- Zapis/Anuluj.

## 4) Szczegóły rośliny
- Pełne dane rośliny.
- Historia działań pielęgnacyjnych.
- Przycisk "Podlano teraz".

## 5) Widok historii działań
- Chronologiczna lista zdarzeń (podlanie/inna opieka).
- Filtrowanie po roślinie i typie akcji.

## Wersja konsolowa (alternatywny UI)
- Menu główne z opcjami: dodaj roślinę, lista, oznacz podlanie, historia.
- Widoki tabelaryczne w terminalu.
- Potwierdzenia i walidacja przez prompty CLI.

# 4. **Stack techniczny**

## Rekomendacja: React + Vite + TypeScript + LocalStorage

### Uzasadnienie
- Aplikacja jest naturalnie "widokowa" (listy, statusy, formularze), więc React przyspiesza budowę UI.
- Vite zapewnia szybki start i krótkie czasy feedbacku podczas nauki/testowania.
- TypeScript poprawia bezpieczeństwo modelu danych (harmonogramy, daty, akcje).
- LocalStorage wystarczy na MVP bez kosztu backendu.
- Łatwo dodać testy jednostkowe logiki biznesowej (Jest) i później rozwinąć projekt.

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
  wateringFrequencyDays: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  lastWateredAt: string | null;
  nextWateringAt: string;
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
  type: "WATERING" | "FERTILIZING" | "PRUNING" | "OTHER";
  performedAt: string;
  note?: string;
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
  schedules: WateringSchedule[];
  careActions: CareAction[];
  version: number;
}
```

# 6. **Ryzyka i założenia**

## Ryzyka
- **Daty i strefy czasowe**: błędne wyliczenia "na dziś" przy zmianie strefy/czasu letniego.
- **LocalStorage**: ograniczenia pojemności i brak synchronizacji między urządzeniami.
- **Spójność danych**: ryzyko rozjazdu między historią akcji a harmonogramem po błędnej aktualizacji.
- **Skalowanie**: przy dużej liczbie wpisów wydajność filtrowania może spadać bez optymalizacji.
- **Jakość danych wejściowych**: brak walidacji może psuć harmonogram (np. częstotliwość 0 lub ujemna).

## Założenia
- MVP działa dla jednego użytkownika na jednym urządzeniu.
- Daty są przechowywane jako ISO 8601 (UTC) i formatowane w UI lokalnie.
- Główna logika biznesowa będzie odseparowana od UI, aby testować ją jednostkowo.
- Historia akcji jest źródłem prawdy dla wykonanych czynności.
