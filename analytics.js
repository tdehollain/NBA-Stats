module.exports.calcutateGameScore = function(game) {
	// Count ties and lead changes, overtimes
	let gameScoreElements = {};

	let nbTies = 0;
	let oldAwayTeamScore = 0;
	let oldHomeTeamScore = 0;
	let oldLeader = '';
	let oldElapsedTimeSeconds = 0;
	let nbLeadChanges = 0;
	let nbOvertimes = 0;
	let buzzerBeaterWinner = false;
	let buzzerBeaterTier = false;
	let lateLeadChanges = 0;
	let scoringDiffTotal = 0;

	game.playbyplay.forEach(play => {
		// skip while scores are 0
		if(play.awayTeamScore!==0 || play.homeTeamScore!==0) {
			let leader = '';
			let leadChange = false;
			// check if scoring play
			if(oldHomeTeamScore!==play.homeTeamScore || oldAwayTeamScore!==play.awayTeamScore) {
				if(play.homeTeamScore > play.awayTeamScore) leader = game.homeTeam;
				if(play.homeTeamScore < play.awayTeamScore) leader = game.awayTeam;
				if(play.homeTeamScore === play.awayTeamScore) leader = 'tie';

				if(leader === 'tie') nbTies++;
				if(leader !== 'tie' && leader !== oldLeader) {
					leadChange = true;
					nbLeadChanges++;
				}
				// Check if buzzerBeaterWinner
				if(play.quarter > 3) {
					if(leader==='tie' && play.time === '0:00') buzzerBeaterTier = true;
					if(leadChange && play.time === '0:00') buzzerBeaterWinner = true;
					if(leadChange && parseInt(play.time.split(':')[0], 10) === 0) lateLeadChanges++;
				}

				// integrate scoring difference
				let scoringDiff = play.awayTeamScore - play.homeTeamScore;
				let timeDiff = play.elapsedTimeSeconds - oldElapsedTimeSeconds;

				scoringDiffTotal += Math.abs(scoringDiff)*timeDiff;
				// console.log(`scores: ${play.awayTeamScore} - ${play.homeTeamScore}, scoringDiff: ${scoringDiff}, time difference: ${timeDiff}`);

				oldLeader = leader;
				oldAwayTeamScore = play.awayTeamScore;
				oldHomeTeamScore = play.homeTeamScore;
				oldElapsedTimeSeconds = play.elapsedTimeSeconds;
			}
		}

		// Count number of overtimes
		if(play.quarter > 4) nbOvertimes = play.quarter - 4;
	});

	// Adding information to result object
	gameScoreElements.maxTeamPoints = Math.max(game.playbyplay[game.playbyplay.length-1].awayTeamScore, game.playbyplay[game.playbyplay.length-1].homeTeamScore);
	gameScoreElements.leadChanges = nbLeadChanges;
	gameScoreElements.ties = nbTies;
	gameScoreElements.nbOvertimes = nbOvertimes;
	gameScoreElements.buzzerBeaterTier = buzzerBeaterTier;
	gameScoreElements.buzzerBeaterWinner = buzzerBeaterWinner;
	gameScoreElements.lateLeadChanges = lateLeadChanges;
	gameScoreElements.scoringDiffWeightedAvg = Math.round(10*scoringDiffTotal / game.playbyplay[game.playbyplay.length-1].elapsedTimeSeconds)/10;


	// Box Score
	let pointsPerf = [];
	let tripleDoublePerf = [];
	let threePtsPerf = [];
	let reboundsPerf = [];
	let assistsPerf = [];
	let stealsPerf = [];
	let blocksPerf = [];

	game.box.awayTeam.forEach(analyseBox);
	game.box.homeTeam.forEach(analyseBox);

	function analyseBox(player) {
		if(player.played) {
			if(player.points >= 35) pointsPerf.push({player: player.player, points: player.points});
			if(player.threePts.made >= 8) threePtsPerf.push({player: player.player, threePts: player.threePts.made});
			if(player.rebounds >= 15) reboundsPerf.push({player: player.player, rebounds: player.rebounds});
			if(player.assists >= 15) assistsPerf.push({player: player.player, assists: player.assists});
			if(player.steals >= 5) stealsPerf.push({player: player.player, steals: player.steals});
			if(player.blocks >= 5) blocksPerf.push({player: player.player, blocks: player.blocks});
			// Tripe-double
			if(player.points >= 10 && player.rebounds >= 10 && player.assists >= 10) tripleDoublePerf.push({player: player.player, points: player.points, rebounds: player.rebounds, assists: player.assists });
		}
	}

	gameScoreElements.pointsPerf = pointsPerf;
	gameScoreElements.threePtsPerf = threePtsPerf;
	gameScoreElements.reboundsPerf = reboundsPerf;
	gameScoreElements.assistsPerf = assistsPerf;
	gameScoreElements.stealsPerf = stealsPerf;
	gameScoreElements.blocksPerf = blocksPerf;
	gameScoreElements.tripleDoublePerf = tripleDoublePerf;
	

	// Calculating game score
	let gameScore = 0;
	gameScore += gameScoreElements.maxTeamPoints > 130 ? (gameScoreElements.maxTeamPoints - 120)/2 : 0;
	gameScore += gameScoreElements.buzzerBeaterTier ? 5 : 0;
	gameScore += gameScoreElements.buzzerBeaterWinner ? 10 : 0;
	gameScore += gameScoreElements.lateLeadChanges ? 5 : 0;
	gameScore += gameScoreElements.leadChanges / 2;
	gameScore += gameScoreElements.nbOvertimes * 10;
	gameScore += 50 / gameScoreElements.scoringDiffWeightedAvg;

	let indivScore = 0;
	gameScoreElements.pointsPerf.forEach(elem => { indivScore += elem.points - 34; });
	gameScoreElements.threePtsPerf.forEach(elem => { indivScore += (elem.threePts - 7) * 2; });
	gameScoreElements.reboundsPerf.forEach(elem => { indivScore += elem.rebounds - 14; });
	gameScoreElements.assistsPerf.forEach(elem => { indivScore += elem.assists - 14; });
	gameScoreElements.stealsPerf.forEach(elem => { indivScore += (elem.steals - 4) * 2; });
	gameScoreElements.blocksPerf.forEach(elem => { indivScore += (elem.blocks - 4) * 2; });

	gameScoreElements.tripleDoublePerf.forEach(elem => { indivScore += 5 + (elem.points - 30 + elem.rebounds - 10 + elem.assists - 10) /2; });

	return { gameScore: Math.round(gameScore), indivScore: Math.round(indivScore), gameScoreElements: gameScoreElements };
}