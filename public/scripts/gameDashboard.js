
const NBAMaster = {
	showMaxDiff: 1,
	showRuns: 1,
	team: {
		BOS: ["Boston", "Celtics" ,"rgb(0,132,73)"],
		BKN: ["Brooklyn", "Nets" ,"rgb(30,30,30)"],
		NYK: ["New York", "Knicks" ,"rgb(246,132,40)"],
		PHI: ["Philadelphia", "76ers" ,"rgb(237,23,79)"],
		TOR: ["Toronto", "Raptors" ,"rgb(205,16,65)"],
		CHI: ["Chicago", "Bulls" ,"rgb(187,15,59)"],
		CLE: ["Cleveland", "Cavaliers" ,"rgb(181,0,23)"],
		DET: ["Detroit", "Pistons" ,"rgb(237,23,75)"],
		IND: ["Indiana", "Pacers" ,"rgb(255,187,52)"],
		MIL: ["Milwaukee", "Bucks" ,"rgb(0,71,27)"],
		ATL: ["Atlanta", "Hawks" ,"rgb(226,56,63)"],
		CHA: ["Charlotte", "Bobcats" ,"rgb(246,103,49)"],
		MIA: ["Miami", "Heat" ,"rgb(152,1,46)"],
		ORL: ["Orlando", "Magic" ,"rgb(8,120,198)"],
		WAS: ["Washington", "Wizards" ,"rgb(227,25,54)"],
		DAL: ["Dallas", "Mavericks" ,"rgb(0,108,185)"],
		HOU: ["Houston", "Rockets" ,"rgb(205,16,65)"],
		MEM: ["Memphis", "Gizzlies" ,"rgb(98,139,188)"],
		NOP: ["New Orleans", "Pelicans" ,"rgb(0,143,197)"],
		SAS: ["San Antonio", "Spurs" ,"rgb(68,77,82)"],
		DEN: ["Denver", "Nuggets" ,"rgb(75,144,205)"],
		MIN: ["Minnesota", "Timberwolves" ,"rgb(0,170,80)"],
		POR: ["Portland", "Trail Blazers" ,"rgb(214,54,61)"],
		OKC: ["Oklahoma City", "Thunder" ,"rgb(67,151,198)"],
		UTA: ["Utah", "Jazz" ,"rgb(0,72,18)"],
		GSW: ["Golden State", "Warriors" ,"rgb(0,103,178)"],
		LAC: ["Los Angeles", "Clippers" ,"rgb(236,10,66)"],
		LAL: ["Los Angeles", "Lakers" ,"rgb(84,37,131)"],
		PHX: ["Phoenix", "Suns" ,"rgb(62,38,128)"],
		SAC: ["Sacramento", "Kings" ,"rgb(57,57,150)"],
	}
};

$(document).ready(function(){

	buildScoringProfile(gameData.playbyplay);

	console.log(gameData.gameBox);
	// buildFGChart(gameData.gameBox);

});


// /************************************
// *************************************
// *****                           *****
// *****   Build Scoring Profile   *****
// *****                           *****
// *************************************
// ************************************/

buildScoringProfile = function(scoreData) {

	// Build data arrays
	let awayTeamScore = ['awayTeam', 0];
	let homeTeamScore = ['homeTeam', 0];
	let elapsedTime =['time', 0];

	scoreData.map(play => {
		if(awayTeamScore[awayTeamScore.length-1] !== play.awayTeamScore || homeTeamScore[homeTeamScore.length-1] !== play.homeTeamScore) {
			awayTeamScore.push(play.awayTeamScore);
			homeTeamScore.push(play.homeTeamScore);
			elapsedTime.push(play.elapsedTimeSeconds);
		}
	});

	let awayTeamScoreSample = awayTeamScore.slice(0,2);
	let homeTeamScoreSample = homeTeamScore.slice(0,2);

	console.log(Math.max(awayTeamScore[awayTeamScore.length-1], homeTeamScore[homeTeamScore.length-1]));
	
	var chart = c3.generate({
		bindto: "#scoringProfileChart",
		data: {
			"x": "time",
				columns: [
				awayTeamScoreSample,
				homeTeamScoreSample,
				elapsedTime
				],
			types: {
				'awayTeam': 'step',
				'homeTeam': 'step'
			},
		},
		axis: {
			y: {
				min: 10,
				max: Math.max(awayTeamScore[awayTeamScore.length-1], homeTeamScore[homeTeamScore.length-1])
			},
			x: {
				show: false,
				min: 0,
				max: elapsedTime[elapsedTime.length-1]
			}
		}
	});

	reloadChart = function() {
		if(awayTeamScoreSample.length === awayTeamScore.length) {
			clearInterval(handle);
		} else {
			awayTeamScoreSample.push(awayTeamScore[awayTeamScoreSample.length]);
			homeTeamScoreSample.push(homeTeamScore[homeTeamScoreSample.length]);
			chart.load({
				columns: [
					awayTeamScoreSample,
					homeTeamScoreSample
				]
			});
		}
	}
	
	let handle = setInterval(reloadChart, 50);
}
