import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import "./App.css";
import { APP_LIMITS } from "./constants";
import { useNotifications } from "./hooks/useNotifications";
import { usePlants } from "./hooks/usePlants";
import { useTheme } from "./hooks/useTheme";
import type { PlantFormData } from "./types";
import {
  calculateHealthScore,
  getHealthStatus,
  getNextWateringDate,
  getPlantsDueForWatering,
  groupPlantsByWateringDay,
} from "./utils/watering";
import { validatePlantForm } from "./utils/validation";

function toLocalDateTimeValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T09:00`;
}

function toInputDate(value: string): Date {
  return new Date(value);
}

function healthColor(score: number): string {
  if (score <= 40) {
    return "var(--color-danger)";
  }

  if (score <= 70) {
    return "var(--color-warning)";
  }

  return "var(--color-success)";
}

function estimateDataUrlSize(dataUrl: string): number {
  return new Blob([dataUrl]).size;
}

function App() {
  const { plants, careActions, addPlant, removePlant, updatePlant, markWatered, isLoading } = usePlants();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { shouldShowBanner, isDenied, enableNotifications } = useNotifications(plants);
  const [activeTab, setActiveTab] = useState<"plants" | "calendar" | "history">("plants");
  const [monthCursor, setMonthCursor] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const [name, setName] = useState<string>("");
  const [species, setSpecies] = useState<string>("");
  const [wateringIntervalDays, setWateringIntervalDays] = useState<string>("7");
  const [lastWateredInput, setLastWateredInput] = useState<string>(toLocalDateTimeValue(new Date()));
  const [notes, setNotes] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [photoError, setPhotoError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [formTouched, setFormTouched] = useState<boolean>(false);

  const parsedForm: PlantFormData = useMemo(() => {
    return {
      name,
      species,
      wateringIntervalDays: Number(wateringIntervalDays),
      lastWatered: toInputDate(lastWateredInput),
      notes: notes.trim() ? notes.trim() : undefined,
      photoUrl,
    };
  }, [lastWateredInput, name, notes, photoUrl, species, wateringIntervalDays]);

  const validation = useMemo(() => validatePlantForm(parsedForm, new Date()), [parsedForm]);
  const filteredPlants = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return plants;
    }

    return plants.filter((plant) => `${plant.name} ${plant.species}`.toLowerCase().includes(search));
  }, [plants, query]);

  const duePlants = useMemo(() => getPlantsDueForWatering(filteredPlants, new Date()), [filteredPlants]);
  const groupedByDay = useMemo(() => groupPlantsByWateringDay(filteredPlants), [filteredPlants]);

  const daysInCalendar = useMemo(() => {
    const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const startWeekday = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - startWeekday);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [monthCursor]);

  const latestActions = useMemo(() => {
    return [...careActions].sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime()).slice(0, 20);
  }, [careActions]);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const getFieldError = (field: keyof PlantFormData): string | undefined => {
    return validation.errors.find((error) => error.field === field)?.message;
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoUrl(undefined);
      return;
    }

    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("Nie udalo sie odczytac zdjecia."));
      };
      reader.onerror = () => reject(new Error("Nie udalo sie odczytac zdjecia."));
      reader.readAsDataURL(file);
    });

    if (estimateDataUrlSize(dataUrl) > APP_LIMITS.MAX_PHOTO_BYTES) {
      setPhotoError("Zdjecie jest za duze (max 200KB).");
      setPhotoUrl(undefined);
      return;
    }

    setPhotoError("");
    setPhotoUrl(dataUrl);
  };

  const submitPlant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormTouched(true);

    if (!validation.success || photoError) {
      return;
    }

    addPlant(parsedForm);
    setName("");
    setSpecies("");
    setWateringIntervalDays("7");
    setLastWateredInput(toLocalDateTimeValue(new Date()));
    setNotes("");
    setPhotoUrl(undefined);
    setPhotoError("");
    setFormTouched(false);
  };

  if (isLoading) {
    return <main className="layout">Ladowanie...</main>;
  }

  return (
    <main className={`layout ${resolvedTheme === "dark" ? "theme-dark" : ""}`}>
      {shouldShowBanner && (
        <section className="notification-banner">
          <span>Wlaczyc przypomnienia o podlewaniu?</span>
          <button onClick={() => void enableNotifications()} type="button">
            Wlacz przypomnienia
          </button>
        </section>
      )}

      <header className="app-header">
        <div>
          <h1>Plantagotchi</h1>
          <p>Tracker pielegnacji roslin domowych.</p>
        </div>
        <button className="toggle-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} type="button">
          {resolvedTheme === "dark" ? "🌙" : "☀️"}
        </button>
      </header>

      <section className="card section-card tabs-nav">
        <button className={`tab-button ${activeTab === "plants" ? "tab-button-active" : ""}`} onClick={() => setActiveTab("plants")} type="button">🌿 Rosliny</button>
        <button className={`tab-button ${activeTab === "calendar" ? "tab-button-active" : ""}`} onClick={() => setActiveTab("calendar")} type="button">📅 Kalendarz</button>
        <button className={`tab-button ${activeTab === "history" ? "tab-button-active" : ""}`} onClick={() => setActiveTab("history")} type="button">📋 Historia</button>
      </section>

      <section className="layout-desktop">
        <section className="card section-card form-column" id="add-plant-form-section">
          <h2>Dodaj rosline</h2>
          <form className="form" onSubmit={submitPlant}>
            <label>Nazwa<input value={name} onChange={(event) => { setFormTouched(true); setName(event.target.value); }} /></label>
            {formTouched && getFieldError("name") && <small className="form-error">{getFieldError("name")}</small>}
            <label>Gatunek<input value={species} onChange={(event) => { setFormTouched(true); setSpecies(event.target.value); }} /></label>
            {formTouched && getFieldError("species") && <small className="form-error">{getFieldError("species")}</small>}
            <label>Interwal podlewania (dni)<input min="1" max="365" type="number" value={wateringIntervalDays} onChange={(event) => { setFormTouched(true); setWateringIntervalDays(event.target.value); }} /></label>
            {formTouched && getFieldError("wateringIntervalDays") && <small className="form-error">{getFieldError("wateringIntervalDays")}</small>}
            <label>Ostatnie podlanie<input type="datetime-local" value={lastWateredInput} onChange={(event) => { setFormTouched(true); setLastWateredInput(event.target.value); }} /></label>
            {formTouched && getFieldError("lastWatered") && <small className="form-error">{getFieldError("lastWatered")}</small>}
            <label>Zdjecie<input accept="image/*" type="file" onChange={(event) => void onFileChange(event)} /></label>
            {photoError && <small className="form-error">{photoError}</small>}
            <label>Notatki<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
            <button disabled={!validation.success || Boolean(photoError)} type="submit">Dodaj</button>
          </form>
          {isDenied && <p className="form-error">Powiadomienia sa zablokowane w przegladarce.</p>}
        </section>

        <section className="content-column">
          {plants.length === 0 && (
            <section className="card section-card empty-state">
              <svg aria-hidden="true" className="empty-state-icon" viewBox="0 0 80 80" width="80" height="80">
                <ellipse cx="40" cy="69" rx="24" ry="6" fill="rgba(47,122,68,0.2)" />
                <path d="M24 36h32l-4 24H28l-4-24z" fill="#d79a5b" />
                <path d="M40 18v23" stroke="#2f7a44" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <h2>Twoj ogrodek jest pusty</h2>
              <p>Dodaj pierwsza rosline i zacznij sledzic jej pielegnacje.</p>
              <button className="action-button" onClick={() => document.getElementById("add-plant-form-section")?.scrollIntoView({ behavior: "smooth" })} type="button">
                Dodaj rosline
              </button>
            </section>
          )}

          {activeTab === "plants" && (
            <section className="tab-panel">
              <section className="card section-card">
                <h2>Lista roslin</h2>
                <label className="filter-label">Szukaj<input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
                <ul>
                  {filteredPlants.map((plant) => {
                    const score = calculateHealthScore(plant, new Date());
                    const status = getHealthStatus(score);
                    return (
                      <li key={plant.id} className="plant-item">
                        <div className="plant-avatar">
                          {plant.photoUrl ? <img alt={plant.name} src={plant.photoUrl} /> : <span>🌿</span>}
                        </div>
                        <div className="plant-main">
                          <strong>{plant.name}</strong>
                          <small>{plant.species}</small>
                          <small>Nastepne: {getNextWateringDate(plant).toLocaleDateString()}</small>
                          <div className="health-bar"><div style={{ width: `${score}%`, background: healthColor(score) }} /></div>
                          <small>{status} ({score})</small>
                        </div>
                        <div className="row-actions">
                          <button className="action-button" onClick={() => markWatered(plant.id)} type="button">Podlano</button>
                          <button className="action-button" onClick={() => updatePlant(plant.id, { lastWatered: new Date() })} type="button">Reset</button>
                          <button className="danger-button" onClick={() => removePlant(plant.id)} type="button">Usun</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
              <section className="card section-card">
                <h2>Do podlania dzisiaj</h2>
                <ul>{duePlants.map((plant) => <li key={plant.id}>{plant.name}</li>)}</ul>
              </section>
            </section>
          )}

          {activeTab === "calendar" && (
            <section className="tab-panel">
              <section className="card section-card">
                <div className="calendar-header">
                  <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))} type="button">{"<"}</button>
                  <h2>{monthCursor.toLocaleString("pl-PL", { month: "long", year: "numeric" })}</h2>
                  <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))} type="button">{">"}</button>
                </div>
                <div className="calendar-grid">
                  {daysInCalendar.map((date) => {
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                    const list = groupedByDay[key] ?? [];
                    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    return (
                      <div key={key} className={`calendar-cell ${key === todayKey ? "calendar-cell-today" : ""} ${isPast ? "calendar-cell-past" : ""}`} title={list.map((item) => item.name).join(", ")}>
                        <span>{date.getDate()}</span>
                        {list.length > 0 && <strong>{list.length}x</strong>}
                      </div>
                    );
                  })}
                </div>
                <ul className="calendar-mobile-list">
                  {Object.entries(groupedByDay).map(([day, list]) => (
                    <li key={day}>
                      <strong>{day}</strong>: {list.map((plant) => plant.name).join(", ")}
                    </li>
                  ))}
                </ul>
              </section>
            </section>
          )}

          {activeTab === "history" && (
            <section className="tab-panel">
              <section className="card section-card">
                <h2>Historia</h2>
                <ul>
                  {latestActions.map((action) => (
                    <li key={action.id}>{action.type} - {action.performedAt.toLocaleString()}</li>
                  ))}
                </ul>
              </section>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
