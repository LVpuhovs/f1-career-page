(function (root) {
  function chanceOfSuccess(score, team) {
    const value = Number(score) || 0;
    if (!team || !team.pointsRequired || team.pointsRequired <= 0) return 100;
    const raw = (value / team.pointsRequired) * team.reputation;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }

  function calculatePlayerAcclaim(player) {
    const baseAcclaim = Number(player?.acclaimBase ?? 1) || 1;
    const races = Number(player?.races ?? 0) || 0;
    const wins = Number(player?.wins ?? 0) || 0;
    const podiums = Number(player?.podiums ?? 0) || 0;
    const fastestLaps = Number(player?.fastestLaps ?? 0) || 0;
    const teammateBeatenPercent = Number(player?.teammateBeatenPercent ?? 0) || 0;
    const driverChampionships = Number(player?.driverChampionships ?? 0) || 0;
    const constructorChampionships = Number(player?.constructorChampionships ?? 0) || 0;
    const racesDriven = Number(player?.racesDriven ?? player?.races ?? 0) || 0;

    const currentAcclaim = (races + wins + podiums + fastestLaps + teammateBeatenPercent) / 2;
    const bonus = racesDriven > 0 ? (currentAcclaim + wins) / racesDriven : 0;
    const finalAcclaim = baseAcclaim + currentAcclaim + bonus + (driverChampionships + constructorChampionships) * 0.5;

    return Number(finalAcclaim.toFixed(2));
  }

  function pickWeightedTeam(player, teams) {
    const score = Number(player?.acclaim ?? player?.points ?? 0) || 0;
    const weighted = (teams || [])
      .map(team => ({ team, chance: chanceOfSuccess(score, team) }))
      .filter(item => item.chance > 0);

    if (!weighted.length) {
      return teams?.[0] || null;
    }

    const total = weighted.reduce((sum, item) => sum + item.chance, 0);
    let roll = Math.random() * total;

    for (const item of weighted) {
      roll -= item.chance;
      if (roll <= 0) return item.team;
    }

    return weighted[weighted.length - 1].team;
  }

  function resolveRoundAttempt(player, round, teams) {
    if (!round) return { team: null, result: "", note: "", randomized: false };

    const selectedTeam = round.team ? (teams || []).find(team => team.id === round.team) : null;
    if (!selectedTeam) {
      round.result = "";
      round.attempts = 0;
      return { team: round.team, result: round.result, note: round.note || "", randomized: false };
    }

    const chance = chanceOfSuccess(player?.acclaim ?? player?.points ?? 0, selectedTeam);
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
      if (randomizedTeam) {
        round.team = randomizedTeam.id;
        round.result = "";
        round.attempts = 0;
        round.note = `${round.note || ""} Randomized after 3 failed attempts`.trim();
        return { team: round.team, result: round.result, note: round.note, randomized: true };
      }
    }

    return { team: round.team, result: round.result, note: round.note || "", randomized: false };
  }

  const api = { chanceOfSuccess, calculatePlayerAcclaim, pickWeightedTeam, resolveRoundAttempt };
  root.careerLogic = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
