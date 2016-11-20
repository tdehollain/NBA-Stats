exports.calcutateGameScore = function(game) {
	// Count ties and lead changes, overtimes
	let gameScore = 0;
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
	let threePtsPerf = [];
	let reboundsPerf = [];
	let assistsPerf = [];
	let stealsPerf = [];
	let blocksPerf = [];

	game.box.awayTeam.forEach(analyseBox);
	game.box.homeTeam.forEach(analyseBox);

	function analyseBox(player) {
		if(player.points >= 35) pointsPerf.push({player: player.player, points: player.points});
		if(player.threePts.made >= 8) threePtsPerf.push({player: player.player, threePts: player.threePts.made});
		if(player.rebounds >= 15) reboundsPerf.push({player: player.player, rebounds: player.rebounds});
		if(player.assists >= 15) assistsPerf.push({player: player.player, assists: player.assists});
		if(player.steals >= 5) stealsPerf.push({player: player.player, steals: player.steals});
		if(player.blocks >= 5) blocksPerf.push({player: player.player, blocks: player.blocks});
	}

	gameScoreElements.pointsPerf = pointsPerf;
	gameScoreElements.threePtsPerf = threePtsPerf;
	gameScoreElements.reboundsPerf = reboundsPerf;
	gameScoreElements.assistsPerf = assistsPerf;
	gameScoreElements.stealsPerf = stealsPerf;
	gameScoreElements.blocksPerf = blocksPerf;
	

	return(gameScoreElements);
}