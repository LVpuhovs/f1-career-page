const assert = require('assert');
const { chanceOfSuccess, calculatePlayerAcclaim, pickWeightedTeam } = require('../careerLogic.js');

const team = { id: 'redbull', pointsRequired: 100, reputation: 50 };
assert.strictEqual(chanceOfSuccess(120, team), 60);
assert.strictEqual(calculatePlayerAcclaim({ acclaimBase: 1, races: 10, wins: 2, podiums: 4, fastestLaps: 1, teammateBeatenPercent: 20, driverChampionships: 1, constructorChampionships: 0, racesDriven: 10 }), 1 + 18.5 + 2.05 + 0.5);

const teams = [
  { id: 'a', pointsRequired: 100, reputation: 100 },
  { id: 'b', pointsRequired: 100, reputation: 50 },
  { id: 'c', pointsRequired: 100, reputation: 0 },
];
const player = { acclaim: 100 };
const picked = pickWeightedTeam(player, teams);
assert.ok(['a', 'b', 'c'].includes(picked));

console.log('Career logic tests passed');
