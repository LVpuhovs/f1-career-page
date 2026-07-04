/* ==========================================================================
   F1 2026 CAREER TRACKER — default reference data
   Edit these arrays any time; they only seed a NEW save. Once the app has
   saved data to this browser's localStorage, these defaults are ignored
   (use the "Reset to defaults" button on the Data tab to start over).
   ========================================================================== */

const DEFAULT_TEAMS = [
  // id, display name, livery colour, points required to be signed,
  // reputation (0-100 — how open the team is to hiring outside its points bar)
  { id: "redbull",     name: "Red Bull Racing", color: "#3671C6", pointsRequired: 100, reputation: 50 },
  { id: "ferrari",     name: "Ferrari",         color: "#E8002D", pointsRequired: 100, reputation: 50 },
  { id: "mercedes",    name: "Mercedes",        color: "#27F4D2", pointsRequired: 81,  reputation: 70 },
  { id: "mclaren",     name: "McLaren",         color: "#FF8000", pointsRequired: 76,  reputation: 60 },
  { id: "astonmartin", name: "Aston Martin",    color: "#00665E", pointsRequired: 51,  reputation: 50 },
  { id: "alpine",      name: "Alpine",          color: "#00A1E8", pointsRequired: 41,  reputation: 40 },
  { id: "haas",        name: "Haas",            color: "#B6BABD", pointsRequired: 15,  reputation: 50 },
  { id: "racingbulls", name: "Racing Bulls",    color: "#6C98FF", pointsRequired: 15,  reputation: 50 },
  { id: "williams",    name: "Williams",        color: "#64C4FF", pointsRequired: 11,  reputation: 80 },
  { id: "audi",        name: "Audi",            color: "#9B0000", pointsRequired: 10,  reputation: 20 },
  { id: "cadillac",    name: "Cadillac",        color: "#8A8D8F", pointsRequired: 5,   reputation: 30 },
];

// Confirmed 2026 race-seat line-up, used to seed the Drivers & Standings tabs.
const DEFAULT_DRIVERS = [
  { id: "verstappen", name: "Max Verstappen",     team: "redbull",     number: 1  },
  { id: "hadjar",     name: "Isack Hadjar",       team: "redbull",     number: 6  },
  { id: "leclerc",    name: "Charles Leclerc",    team: "ferrari",     number: 16 },
  { id: "hamilton",   name: "Lewis Hamilton",     team: "ferrari",     number: 44 },
  { id: "russell",    name: "George Russell",     team: "mercedes",    number: 63 },
  { id: "antonelli",  name: "Kimi Antonelli",     team: "mercedes",    number: 12 },
  { id: "norris",     name: "Lando Norris",       team: "mclaren",     number: 4  },
  { id: "piastri",    name: "Oscar Piastri",      team: "mclaren",     number: 81 },
  { id: "alonso",     name: "Fernando Alonso",    team: "astonmartin", number: 14 },
  { id: "stroll",     name: "Lance Stroll",       team: "astonmartin", number: 18 },
  { id: "gasly",      name: "Pierre Gasly",       team: "alpine",      number: 10 },
  { id: "colapinto",  name: "Franco Colapinto",   team: "alpine",      number: 43 },
  { id: "ocon",       name: "Esteban Ocon",       team: "haas",        number: 31 },
  { id: "bearman",    name: "Oliver Bearman",     team: "haas",        number: 87 },
  { id: "lawson",     name: "Liam Lawson",        team: "racingbulls", number: 30 },
  { id: "lindblad",   name: "Arvid Lindblad",     team: "racingbulls", number: 41 },
  { id: "albon",      name: "Alex Albon",         team: "williams",    number: 23 },
  { id: "sainz",      name: "Carlos Sainz",       team: "williams",    number: 55 },
  { id: "hulkenberg", name: "Nico Hülkenberg",    team: "audi",        number: 27 },
  { id: "bortoleto",  name: "Gabriel Bortoleto",  team: "audi",        number: 5  },
  { id: "perez",      name: "Sergio Pérez",       team: "cadillac",    number: 11 },
  { id: "bottas",     name: "Valtteri Bottas",    team: "cadillac",    number: 77 },
];

// 2026 calendar — 22 rounds after the Bahrain/Saudi cancellations. Dates for
// the second half of the year weren't all confirmed at the time this app was
// built, so several say "TBC" — edit them freely on the Calendar tab.
const DEFAULT_CALENDAR = [
  { round: 1,  name: "Australian Grand Prix",           place: "Albert Park",           date: "6–8 Mar",   sprint: false, completed: false },
  { round: 2,  name: "Chinese Grand Prix",               place: "Shanghai",              date: "13–15 Mar", sprint: true,  completed: false },
  { round: 3,  name: "Japanese Grand Prix",               place: "Suzuka",                date: "27–29 Mar", sprint: false, completed: false },
  { round: 4,  name: "Miami Grand Prix",                  place: "Miami",                 date: "1–3 May",   sprint: true,  completed: false },
  { round: 5,  name: "Canadian Grand Prix",                place: "Montréal",              date: "22–24 May", sprint: true,  completed: false },
  { round: 6,  name: "Monaco Grand Prix",                  place: "Monte Carlo",           date: "5–7 Jun",   sprint: false, completed: false },
  { round: 7,  name: "Barcelona-Catalunya Grand Prix",      place: "Barcelona",             date: "12–14 Jun", sprint: false, completed: false },
  { round: 8,  name: "Austrian Grand Prix",                 place: "Red Bull Ring",         date: "26–28 Jun", sprint: false, completed: false },
  { round: 9,  name: "British Grand Prix",                  place: "Silverstone",           date: "3–5 Jul",   sprint: true,  completed: false },
  { round: 10, name: "Belgian Grand Prix",                  place: "Spa-Francorchamps",     date: "17–19 Jul", sprint: false, completed: false },
  { round: 11, name: "Hungarian Grand Prix",                place: "Hungaroring",           date: "24–26 Jul", sprint: false, completed: false },
  { round: 12, name: "Dutch Grand Prix",                    place: "Zandvoort",             date: "21–23 Aug", sprint: true,  completed: false },
  { round: 13, name: "Italian Grand Prix",                  place: "Monza",                 date: "4–6 Sep",   sprint: false, completed: false },
  { round: 14, name: "Spanish Grand Prix",                  place: "Madrid (Madring)",      date: "11–13 Sep", sprint: false, completed: false },
  { round: 15, name: "Azerbaijan Grand Prix",               place: "Baku",                  date: "25–27 Sep", sprint: false, completed: false },
  { round: 16, name: "Singapore Grand Prix",                place: "Marina Bay",            date: "TBC Oct",   sprint: true,  completed: false },
  { round: 17, name: "United States Grand Prix",            place: "Austin",                date: "TBC Oct",   sprint: false, completed: false },
  { round: 18, name: "Mexico City Grand Prix",              place: "Mexico City",           date: "TBC Oct/Nov", sprint: false, completed: false },
  { round: 19, name: "São Paulo Grand Prix",                place: "Interlagos",            date: "TBC Nov",   sprint: false, completed: false },
  { round: 20, name: "Las Vegas Grand Prix",                place: "Las Vegas",             date: "TBC Nov",   sprint: false, completed: false },
  { round: 21, name: "Qatar Grand Prix",                    place: "Lusail",                date: "TBC Nov/Dec", sprint: false, completed: false },
  { round: 22, name: "Abu Dhabi Grand Prix",                place: "Yas Marina",            date: "4–6 Dec",   sprint: false, completed: false },
];

// Starter career players — rename/add/remove freely on the Careers tab.
// Round labels mirror the original spreadsheet's layout (Round 1-3 + Randomized).
function makeDefaultPlayers() {
  const roundLabels = ["Round 1", "Round 2", "Round 3", "Randomized"];
  const names = ["Player 1", "Player 2", "Player 3"];
  return names.map((n, i) => ({
    id: "player_" + (i + 1),
    name: n,
    acclaim: 0,
    points: 0,
    rounds: roundLabels.map((label, j) => ({
      id: "player_" + (i + 1) + "_round_" + j,
      label,
      team: "",
      points: 0,
      result: "",
      note: "",
    })),
  }));
}
