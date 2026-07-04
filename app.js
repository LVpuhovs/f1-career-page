/* ==========================================================================
   2026 CAREER MODE — app logic
   Plain vanilla JS, no build step. State lives in localStorage so this works
   as a static file straight out of a GitHub repo (GitHub Pages, or even just
   opening index.html locally).
   ========================================================================== */

const STORAGE_KEY = "f1_2026_career_tracker_v1";

let state = loadState();

/* ---------------------------- persistence ---------------------------- */

function defaultState() {
  return {
    teams: JSON.parse(JSON.stringify(DEFAULT_TEAMS)),
    drivers: JSON.parse(JSON.stringify(DEFAULT_DRIVERS)),
    calendar: JSON.parse(JSON.stringify(DEFAULT_CALENDAR)),
    driverStandings: DEFAULT_DRIVERS.map(d => ({ driver: d.id, points: 0 })),
    constructorStandings: DEFAULT_TEAMS.map(t => ({ team: t.id, points: 0 })),
    players: makeDefaultPlayers(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // shallow-merge against defaults so new fields introduced later don't crash old saves
    return Object.assign(defaultState(), parsed);
  } catch (e) {
    console.warn("Could not load save, starting fresh.", e);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const status = document.getElementById("saveStatus");
  if (status) {
    status.textContent = "Saved to this browser at " + new Date().toLocaleTimeString();
  }
}

function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

function teamById(id) {
  return state.teams.find(t => t.id === id);
}
function driverById(id) {
  return state.drivers.find(d => d.id === id);
}

/* ---------------------------- tabs ---------------------------- */

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  const name = btn.dataset.tab;
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById("view-" + name).classList.remove("hidden");
});

/* ---------------------------- chance of success ---------------------------- */

function chanceOfSuccess(points, team) {
  if (!team.pointsRequired || team.pointsRequired <= 0) return 100;
  const raw = (points / team.pointsRequired) * team.reputation;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function getPlayerAcclaim(player) {
  if (!player) return 0;
  player.acclaim = calculatePlayerAcclaim(player);
  return player.acclaim;
}

function pickWeightedTeam(player, teams) {
  const score = getPlayerAcclaim(player);
  const weighted = (teams || [])
    .map(team => ({ team, chance: chanceOfSuccess(score, team) }))
    .filter(item => item.chance > 0);

  if (!weighted.length) return null;

  const total = weighted.reduce((sum, item) => sum + item.chance, 0);
  let roll = Math.random() * total;
  for (const item of weighted) {
    roll -= item.chance;
    if (roll <= 0) return item.team;
  }
  return weighted[weighted.length - 1].team;
}

function resolveRoundAttempt(player, round, teams) {
  const selectedTeam = round.team ? teams.find(team => team.id === round.team) : null;
  if (!selectedTeam) {
    round.result = "";
    round.attempts = 0;
    return { team: round.team, result: round.result, note: round.note || "", randomized: false };
  }

  const chance = chanceOfSuccess(getPlayerAcclaim(player), selectedTeam);
  const passed = Math.random() * 100 < chance;

  if (passed) {
    round.result = "Success";
    round.attempts = 0;
    return { team: round.team, result: round.result, note: round.note || "", randomized: false };
  }

  round.result = "Fail";
  round.attempts = (Number(round.attempts) || 0) + 1;

  if (round.attempts >= 3) {
    const randomizedTeam = pickWeightedTeam(player, teams);
    if (randomizedTeam && randomizedTeam.id !== round.team) {
      round.team = randomizedTeam.id;
      round.result = "";
      round.attempts = 0;
      round.note = `${round.note || ""} Randomized after 3 failed attempts`.trim();
      return { team: round.team, result: round.result, note: round.note, randomized: true };
    }
  }

  return { team: round.team, result: round.result, note: round.note || "", randomized: false };
}

function calculatePlayerAcclaim(player) {
  const wins = Number(player.wins ?? 0) || 0;
  const podiums = Number(player.podiums ?? 0) || 0;
  const fastestLaps = Number(player.fastestLaps ?? 0) || 0;
  const teammateBeatenPercent = Number(player.teammateBeatenPercent ?? 0) || 0;
  const driverChampionships = Number(player.driverChampionships ?? 0) || 0;
  const constructorChampionships = Number(player.constructorChampionships ?? 0) || 0;
  const races = Number(player.races ?? player.racesDriven ?? 0) || 0;

  const currentAcclaim = (races + wins + podiums + fastestLaps + teammateBeatenPercent / 100) / 2;
  const bonus = races > 0 ? (currentAcclaim + wins) / races : 0;
  const finalAcclaim = currentAcclaim + bonus + (driverChampionships + constructorChampionships) * 0.5;

  return Number(Math.max(1, finalAcclaim).toFixed(2));
}

/* ---------------------------- render: Teams ---------------------------- */

function renderChanceContextOptions() {
  const sel = document.getElementById("chanceContext");
  const prev = sel.value;
  sel.innerHTML = state.players.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
  if (prev && state.players.some(p => p.id === prev)) sel.value = prev;
}

function renderTeams() {
  renderChanceContextOptions();
  const activePlayerId = document.getElementById("chanceContext").value;
  const activePlayer = state.players.find(p => p.id === activePlayerId) || state.players[0];
  const acclaim = activePlayer ? getPlayerAcclaim(activePlayer) : 0;
  const chanceDetails = document.getElementById("chanceDetails");
  if (chanceDetails) {
    chanceDetails.textContent = `${escapeHtml(activePlayer.name)} acclaim: ${acclaim}`;
  }

  const tbody = document.querySelector("#teamsTable tbody");
  const sorted = [...state.teams].sort((a, b) => b.pointsRequired - a.pointsRequired);
  tbody.innerHTML = sorted.map((team, i) => {
    const chance = chanceOfSuccess(acclaim, team);
    return `
      <tr data-id="${team.id}">
        <td class="mono">${i + 1}</td>
        <td><span class="team-chip"><span class="team-dot" style="background:${team.color}"></span>${escapeHtml(team.name)}</span></td>
        <td><input class="cell-input" type="number" min="0" data-field="pointsRequired" value="${team.pointsRequired}" style="max-width:90px"></td>
        <td><input class="cell-input" type="number" min="0" max="100" data-field="reputation" value="${team.reputation}" style="max-width:90px"></td>
        <td>
          <div class="chance">
            <div class="chance-track"><div class="chance-fill" style="width:${chance}%"></div></div>
            <span class="chance-val">${chance}%</span>
          </div>
        </td>
      </tr>`;
  }).join("");

  tbody.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("change", () => {
      const row = inp.closest("tr");
      const team = teamById(row.dataset.id);
      team[inp.dataset.field] = Number(inp.value) || 0;
      saveState();
      renderTeams();
      renderPlayers(); // team dropdowns unaffected but keep chance previews fresh
    });
  });
}

document.getElementById("chanceContext").addEventListener("change", renderTeams);

/* ---------------------------- render: Drivers ---------------------------- */

function renderDrivers() {
  const tbody = document.querySelector("#driversTable tbody");
  tbody.innerHTML = state.drivers.map(d => {
    const team = teamById(d.team);
    return `
      <tr data-id="${d.id}">
        <td class="mono">${d.number}</td>
        <td>${escapeHtml(d.name)}</td>
        <td>
          <select class="cell-input" data-field="team">
            ${state.teams.map(t => `<option value="${t.id}" ${t.id === d.team ? "selected" : ""}>${escapeHtml(t.name)}</option>`).join("")}
          </select>
        </td>
      </tr>`;
  }).join("");

  tbody.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("change", () => {
      const row = sel.closest("tr");
      const driver = driverById(row.dataset.id);
      driver.team = sel.value;
      saveState();
      renderStandings();
    });
  });
}

/* ---------------------------- render: Standings ---------------------------- */

function renderStandings() {
  const dTbody = document.querySelector("#driverStandingsTable tbody");
  const sortedDrivers = [...state.driverStandings].sort((a, b) => b.points - a.points);
  dTbody.innerHTML = sortedDrivers.map((s, i) => {
    const driver = driverById(s.driver);
    const team = driver ? teamById(driver.team) : null;
    return `
      <tr data-id="${s.driver}">
        <td class="mono">${i + 1}</td>
        <td>${driver ? escapeHtml(driver.name) : s.driver}</td>
        <td>${team ? `<span class="team-chip"><span class="team-dot" style="background:${team.color}"></span>${escapeHtml(team.name)}</span>` : "—"}</td>
        <td><input class="cell-input" type="number" data-field="points" value="${s.points}" style="max-width:90px"></td>
      </tr>`;
  }).join("");

  dTbody.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("change", () => {
      const row = inp.closest("tr");
      const s = state.driverStandings.find(x => x.driver === row.dataset.id);
      s.points = Number(inp.value) || 0;
      saveState();
      renderStandings();
    });
  });

  const cTbody = document.querySelector("#constructorStandingsTable tbody");
  const sortedConstructors = [...state.constructorStandings].sort((a, b) => b.points - a.points);
  cTbody.innerHTML = sortedConstructors.map((s, i) => {
    const team = teamById(s.team);
    return `
      <tr data-id="${s.team}">
        <td class="mono">${i + 1}</td>
        <td>${team ? `<span class="team-chip"><span class="team-dot" style="background:${team.color}"></span>${escapeHtml(team.name)}</span>` : s.team}</td>
        <td><input class="cell-input" type="number" data-field="points" value="${s.points}" style="max-width:90px"></td>
      </tr>`;
  }).join("");

  cTbody.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("change", () => {
      const row = inp.closest("tr");
      const s = state.constructorStandings.find(x => x.team === row.dataset.id);
      s.points = Number(inp.value) || 0;
      saveState();
      renderStandings();
    });
  });
}

/* ---------------------------- render: Calendar ---------------------------- */

function renderCalendar() {
  const tbody = document.querySelector("#calendarTable tbody");
  tbody.innerHTML = state.calendar.map((race, i) => `
    <tr data-index="${i}">
      <td><input type="checkbox" data-field="completed" ${race.completed ? "checked" : ""}></td>
      <td class="mono">${race.round}</td>
      <td><input class="cell-input wide" type="text" data-field="name" value="${escapeAttr(race.name)}"></td>
      <td><input class="cell-input" type="text" data-field="place" value="${escapeAttr(race.place)}"></td>
      <td><input class="cell-input" type="text" data-field="date" value="${escapeAttr(race.date)}" style="max-width:110px"></td>
      <td><input type="checkbox" data-field="sprint" ${race.sprint ? "checked" : ""}></td>
      <td><button class="btn--icon" data-action="delete-race" title="Remove race">✕</button></td>
    </tr>`).join("");

  tbody.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("change", () => {
      const i = Number(inp.closest("tr").dataset.index);
      const race = state.calendar[i];
      const field = inp.dataset.field;
      race[field] = inp.type === "checkbox" ? inp.checked : inp.value;
      saveState();
    });
  });
  tbody.querySelectorAll('[data-action="delete-race"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.closest("tr").dataset.index);
      state.calendar.splice(i, 1);
      saveState();
      renderCalendar();
    });
  });
}

document.getElementById("addRaceBtn").addEventListener("click", () => {
  state.calendar.push({
    round: state.calendar.length + 1,
    name: "New Grand Prix",
    place: "",
    date: "",
    sprint: false,
    completed: false,
  });
  saveState();
  renderCalendar();
});

/* ---------------------------- render: Careers ---------------------------- */

function teamOptions(selectedId) {
  return `<option value="">— none —</option>` + state.teams
    .map(t => `<option value="${t.id}" ${t.id === selectedId ? "selected" : ""}>${escapeHtml(t.name)}</option>`)
    .join("");
}

function renderPlayers() {
  const wrap = document.getElementById("playersWrap");
  wrap.innerHTML = state.players.map(player => {
    getPlayerAcclaim(player);

    const rounds = player.rounds.map(round => {
      const team = round.team ? teamById(round.team) : null;
      const chance = team ? chanceOfSuccess(player.acclaim, team) : null;
      return `
        <div class="round-row" data-player="${player.id}" data-round="${round.id}">
          <span class="round-label">${escapeHtml(round.label)}</span>
          <select class="cell-input" data-field="team">${teamOptions(round.team)}</select>
          <button class="btn btn--ghost" data-action="attempt-signing">Attempt sign</button>
          <div class="round-meta">${chance !== null ? `Chance: ${chance}%` : "Select a team"}${round.attempts ? ` · Attempts: ${round.attempts}/3` : ""}</div>
          <select class="result-pill" data-field="result" data-result="${round.result}">
            <option value="" ${round.result === "" ? "selected" : ""}>Pending</option>
            <option value="Success" ${round.result === "Success" ? "selected" : ""}>✓ Success</option>
            <option value="Fail" ${round.result === "Fail" ? "selected" : ""}>✕ Fail</option>
          </select>
          <input class="cell-input" type="text" data-field="note" value="${escapeAttr(round.note)}" placeholder="Notes...">
          <button class="btn--icon" data-action="delete-round" title="Remove round">✕</button>
        </div>`;
    }).join("");

    return `
      <div class="player-card" data-player="${player.id}">
        <div class="player-card__head">
          <input type="text" data-field="name" value="${escapeAttr(player.name)}">
          <div class="stat">
            <label>Career points</label>
            <input class="cell-input" type="number" data-field="points" value="${player.points}">
          </div>
          <div class="stat">
            <label>Races</label>
            <input class="cell-input" type="number" min="0" data-field="races" value="${player.races ?? 0}">
          </div>
          <div class="stat">
            <label>Wins</label>
            <input class="cell-input" type="number" min="0" data-field="wins" value="${player.wins ?? 0}">
          </div>
          <div class="stat">
            <label>Podiums</label>
            <input class="cell-input" type="number" min="0" data-field="podiums" value="${player.podiums ?? 0}">
          </div>
          <div class="stat">
            <label>Fastest laps</label>
            <input class="cell-input" type="number" min="0" data-field="fastestLaps" value="${player.fastestLaps ?? 0}">
          </div>
          <div class="stat">
            <label>Teammate beaten %</label>
            <input class="cell-input" type="number" min="0" data-field="teammateBeatenPercent" value="${player.teammateBeatenPercent ?? 0}">
          </div>
          <div class="stat">
            <label>Driver titles</label>
            <input class="cell-input" type="number" min="0" data-field="driverChampionships" value="${player.driverChampionships ?? 0}">
          </div>
          <div class="stat">
            <label>Constructor titles</label>
            <input class="cell-input" type="number" min="0" data-field="constructorChampionships" value="${player.constructorChampionships ?? 0}">
          </div>
          <div class="stat">
            <label>Races driven</label>
            <input class="cell-input" type="number" min="0" data-field="racesDriven" value="${player.racesDriven ?? player.races ?? 0}">
          </div>
          <div class="stat">
            <label>Acclaim</label>
            <input class="cell-input" type="number" data-field="acclaim" value="${player.acclaim}" disabled title="Calculated from the acclaim formula">
          </div>
          <div class="spacer"></div>
          <button class="btn btn--ghost" data-action="add-round">+ Round</button>
          <button class="btn btn--danger" data-action="delete-player">Remove player</button>
        </div>
        <div class="rounds">${rounds}</div>
      </div>`;
  }).join("");

  // player-level field changes
  wrap.querySelectorAll(".player-card__head input").forEach(inp => {
    inp.addEventListener("change", () => {
      const playerId = inp.closest(".player-card").dataset.player;
      const player = state.players.find(p => p.id === playerId);
      const field = inp.dataset.field;
      const value = field === "name" ? inp.value : (Number(inp.value) || 0);

      if (field === "races" || field === "racesDriven") {
        player.races = value;
        player.racesDriven = value;
      } else {
        player[field] = value;
      }

      saveState();
      renderPlayers();
      renderTeams();
    });
  });

  // round-level field changes
  wrap.querySelectorAll(".round-row").forEach(row => {
    row.querySelectorAll("[data-field]").forEach(inp => {
      inp.addEventListener("change", () => {
        const playerId = row.dataset.player;
        const roundId = row.dataset.round;
        const player = state.players.find(p => p.id === playerId);
        const round = player.rounds.find(r => r.id === roundId);
        const field = inp.dataset.field;

        if (field === "team") {
          round.team = inp.value;
          round.result = "";
          round.attempts = 0;
          saveState();
          renderPlayers();
          renderTeams();
          return;
        }

        round[field] = inp.value;
        saveState();
        renderPlayers();
      });
    });
    row.querySelector('[data-action="delete-round"]').addEventListener("click", () => {
      const playerId = row.dataset.player;
      const roundId = row.dataset.round;
      const player = state.players.find(p => p.id === playerId);
      player.rounds = player.rounds.filter(r => r.id !== roundId);
      saveState();
      renderPlayers();
    });

    row.querySelector('[data-action="attempt-signing"]').addEventListener("click", () => {
      const playerId = row.dataset.player;
      const roundId = row.dataset.round;
      const player = state.players.find(p => p.id === playerId);
      const round = player.rounds.find(r => r.id === roundId);
      resolveRoundAttempt(player, round, state.teams);
      saveState();
      renderPlayers();
      renderTeams();
    });
  });

  wrap.querySelectorAll('[data-action="add-round"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const playerId = btn.closest(".player-card").dataset.player;
      const player = state.players.find(p => p.id === playerId);
      player.rounds.push({
        id: uid("round"),
        label: "Round " + (player.rounds.length + 1),
        team: "",
        points: 0,
        result: "",
        attempts: 0,
        note: "",
      });
      saveState();
      renderPlayers();
    });
  });

  wrap.querySelectorAll('[data-action="delete-player"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const playerId = btn.closest(".player-card").dataset.player;
      if (!confirm("Remove this player's whole career from this save?")) return;
      state.players = state.players.filter(p => p.id !== playerId);
      saveState();
      renderPlayers();
      renderTeams();
    });
  });
}

document.getElementById("addPlayerBtn").addEventListener("click", () => {
  const n = state.players.length + 1;
  state.players.push({
    id: uid("player"),
    name: "Player " + n,
    acclaim: 1,
    points: 0,
    races: 0,
    wins: 0,
    podiums: 0,
    fastestLaps: 0,
    teammateBeatenPercent: 0,
    driverChampionships: 0,
    constructorChampionships: 0,
    racesDriven: 0,
    rounds: ["Round 1", "Round 2", "Round 3", "Randomized"].map((label) => ({
      id: uid("round"),
      label, team: "", points: 0, result: "", attempts: 0, note: "",
    })),
  });
  saveState();
  renderPlayers();
  renderTeams();
});

/* ---------------------------- Data tab ---------------------------- */

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `f1-2026-career-save-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== "object") throw new Error("Not a valid save file");
      state = Object.assign(defaultState(), parsed);
      saveState();
      renderAll();
      alert("Save imported.");
    } catch (err) {
      alert("Couldn't read that file as a save: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("This wipes everything in this browser's save and restores the 2026 defaults. Export a backup first if you want to keep it. Continue?")) return;
  state = defaultState();
  saveState();
  renderAll();
});

/* ---------------------------- utils ---------------------------- */

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
}
function escapeAttr(str) { return escapeHtml(str); }

/* ---------------------------- boot ---------------------------- */

function renderAll() {
  renderTeams();
  renderDrivers();
  renderStandings();
  renderCalendar();
  renderPlayers();
}

renderAll();
