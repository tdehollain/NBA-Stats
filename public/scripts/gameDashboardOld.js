
let awayTeam, homeTeam, date, quarter;
let scoringTypeData, scoringTypeDataPct;

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

});


// /************************************
// *************************************
// *****                           *****
// *****   Build Scoring Profile   *****
// *****                           *****
// *************************************
// ************************************/

function buildScoringProfile(gameData) {
	
	var team1ScoreData = [{ score: 0, time: 0 }];
	var team2ScoreData = [{ score: 0, time: 0 }];
	
	team1ScoreData.push({ score: gameData[0].awayTeamScore, time: gameData[0].elapsedTimeSeconds });
	team2ScoreData.push({ score: gameData[0].homeTeamScore, time: gameData[0].elapsedTimeSeconds });

	for(i=1; i<gameData.length; i++) {
		if(gameData[i].awayTeamScore !== team1ScoreData[team1ScoreData.length-1].score) {
			team1ScoreData.push({ score: gameData[i].awayTeamScore, time: gameData[i].elapsedTimeSeconds });
		}
		if(gameData[i].homeTeamScore !== team2ScoreData[team2ScoreData.length-1].score) {
			team2ScoreData.push({ score: gameData[i].homeTeamScore, time: gameData[i].elapsedTimeSeconds });
		}
	}
	
	drawScoringProfile(team1ScoreData, team2ScoreData);
}
	
function drawScoringProfile(team1ScoreData, team2ScoreData) {

	var width = 1200;
	var height = 0.5 * width;


	var score1 = team1ScoreData[team1ScoreData.length-1];
	var score2 = team2ScoreData[team2ScoreData.length-1];

	$("#scoringProfileChart").empty();

	var chart = d3.select("#scoringProfileChart").append("svg")
		.attr("class", "scoringChart")
		.attr("width", width)
		.attr("height", height);

	var x = d3.scale.linear()
			.domain([0, team1ScoreData[team1ScoreData.length-1].time])
			.range([10, width-150]);

	// Find the max of the two scores
	var awayTeamFinalScore = team1ScoreData[team1ScoreData.length-1].score;
	var homeTeamFinalScore = team2ScoreData[team2ScoreData.length-1].score;
	var maxScore = d3.max([awayTeamFinalScore, homeTeamFinalScore]);
	var y = d3.scale.linear()
			.domain([0, maxScore])
			.range([height-30, 30]);


	// Line generators
	var line = d3.svg.line()
			.x(function(d){ return x(d.time) + 20; })
			.y(function(d){ return y(d.score/1.1); })
			.interpolate("step-after");

	var quarterLine = d3.svg.line()
			.x(function(d){ return x(d.time) + 20; })
			.y(function(d){ return y(Math.floor(d.score/(5)*5)); })
			.interpolate("linear");

	var maxDiffLine = d3.svg.line()
			.x(function(d){ return x(d.time) + 20; })
			.y(function(d){ return y(d.score/1.1); })
			.interpolate("linear");

	// Area Generator
	var area = d3.svg.area()
			.x(function(d){ return x(d.time) + 20; })
			.y0(function(d){ return y(d.score1/1.1); })
			.y1(function(d){ return y(d.score2/1.1); })
			.interpolate("step-after");

	// Find the max time (duration)
	var duration = team1ScoreData[team1ScoreData.length-1].time;
	console.log(duration);
	var yforAxis = d3.scale.linear()
			.domain([0, maxScore*1.1])
			.range([height-30, 30]);
	var yAxis = d3.svg.axis().scale(yforAxis).ticks(10).tickSize(x(-1*(duration+20))).tickSubdivide(1).orient("left");


	// createMarkers();

	// Create y-axis
	chart.append("svg:g")
		.attr("class", "yAxis")
		.attr("transform", "translate(30, 0)")
		.call(yAxis);

	// Create x-axis (line)
	for(i=2; i<=quarter; i++) {
		if(i<5){
			chart.append("svg:path")
				.attr("class", "xAxis")
				.attr("d", quarterLine([{score: 0, time: (i-1)*720}, {score: maxScore, time: (i-1)*720}]));
		} else {
			// line
			chart.append("svg:path")
				.attr("class", "xAxis")
				.attr("d", quarterLine([{score: 0, time: 4*720+(i-5)*300}, {score: maxScore, time: 4*720+(i-5)*300}]));
		}
	}

	// Create x-axis (label)
	for(i=1; i<=quarter; i++) {
		if(i<5) {
			chart.append("svg:text")
				.attr("class", "quarterText")
				.attr("x", x(i*720 - 350))
				.attr("y", height-5)
				.text("Q" + i);
		} else {
			if(quarter==5) {
				chart.append("svg:text")
					.attr("class", "quarterText")
					.attr("x", x(4*720 + 160))
					.attr("y", height-5)
					.text("OT");
			} else {
				chart.append("svg:text")
					.attr("class", "quarterText")
					.attr("x", x(4*720 + (i-4)*300 - 160))
					.attr("y", height-5)
					.text((i-4) + "OT");
			}
		}
	}


	// Create Team 1 profile
	chart.append("svg:path")
		.attr("class", "team1Profile")
	// Create Team 2 profile
	chart.append("svg:path")
		.attr("class", "team2Profile")

	// Create Team 1 Score Text
	chart.append("svg:text")
		.attr("class", "team1Text")
	// Create Team 2 Score Text
	chart.append("svg:text")
		.attr("class", "team2Text")

	// Animate profile
	var k=0, n=team1ScoreData.length;
	d3.timer(function() {
		animateProfile(1, team1ScoreData, k);
		animateProfile(2, team2ScoreData, k);
		if((k+=1) > (n-1)) {
			return true;
		}
	}, 1000);

	// // Scoring Differential
	// var maxScoreDiff = 0;
	// var maxScoreData = {low: 0, high: 0, time: 0, k: 0};

	// // Scoring runs
	// var scoringRunsArr = [];
	// var currentScoreRun = { 
	// 	team: 0,
	// 	start: 0,
	// 	end: 0,
	// 	runMin: 0,
	// 	runMax: 0
	// };

	function animateProfile(team, values, k) {

		// Draw Profile
		d3.select(".team" + team + "Profile").attr("d", line(values.slice(0, k+1)));

		// Team Score Text
		var team1Score = team1ScoreData.slice(0, k+1)[k].score;
		var team2Score = team2ScoreData.slice(0, k+1)[k].score;
		var scoreDiff = (team==1) ? team1Score-team2Score : team2Score-team1Score;

		var scoreAdjust = -1;
		if(k == n-1) {
			if(Math.abs(scoreDiff) > 3) {
				scoreAdjust = -1;
			} else if(scoreDiff > 0) {
				scoreAdjust = 3-scoreDiff;
			} else {
				scoreAdjust = -1*(scoreDiff+3);
			}
		}
		d3.select(".team" + team + "Text").attr("x", x(values.slice(0, k+1)[k].time + 75));
		d3.select(".team" + team + "Text").attr("y", y(values.slice(0, k+1)[k].score/1.1 + scoreAdjust));
		if(team == 1) var thisTeam = awayTeam;
		if(team == 2) var thisTeam = homeTeam;
		d3.select(".team" + team + "Text").text(values.slice(0, k+1)[k].score + " - " + thisTeam);

		
		// /***************************************
		// *****   Max Scoring Differential   *****
		// ***************************************/
		// if(Math.abs(scoreDiff) > maxScoreDiff) {
		// 	maxScoreDiff = scoreDiff;
		// 	maxScoreData.low = (team1Score > team2Score) ? team2Score : team1Score;
		// 	maxScoreData.high = (team1Score > team2Score) ? team1Score : team2Score;
		// 	maxScoreData.time = values.slice(0, k+1)[k].time;
		// 	maxScoreData.k = k;
		// }

		// /***********************************
		// *****   Notable Scoring Runs   *****
		// ***********************************/

		// // check if this is a scoring run
		// var pointsScored = (k<1) ? 0 : values[k].score - values[k-1].score;
		// var scoringPlay = (pointsScored) ? true : false;
		
		// if(scoringPlay && k < 2) {
		// 	// find who scored first
		// 	if(values[k].score != 0) {
		// 		currentScoreRun.team = team;
		// 		currentScoreRun.start = (k===0) ? 0 : k-1;
		// 		currentScoreRun.runMin = 0;
		// 		currentScoreRun.runMax = values[k].score;
		// 	}
		// } else if(scoringPlay && k >= 2) {
		// 	if(team == currentScoreRun.team) { // if the same team is scoring
		// 		currentScoreRun.runMax += pointsScored;
		// 		currentScoreRun.end = k;
		// 	} else {
		// 		// if(currentScoreRun.runMin + pointsScored < 1) { // counting runs with other team scoring up to 5 points
		// 		// 	currentScoreRun.runMin += pointsScored;
		// 		// } else { // end of the scoring run and start of a new one
		// 			scoringRunsArr.push({
		// 				team: currentScoreRun.team,
		// 				start: currentScoreRun.start,
		// 				end: currentScoreRun.end,
		// 				runMin: currentScoreRun.runMin,
		// 				runMax: currentScoreRun.runMax
		// 			});
		// 			// new run
		// 			currentScoreRun.team = team;
		// 		currentScoreRun.start = (k===0) ? 0 : k-1;
		// 			currentScoreRun.runMin = 0;
		// 			currentScoreRun.runMax = pointsScored;
		// 		// }
		// 	}
		// } if(k==n-1 && team == 2) {
		// 	scoringRunsArr.push({
		// 		team: currentScoreRun.team,
		// 		start: currentScoreRun.start,
		// 		end: currentScoreRun.end,
		// 		runMin: currentScoreRun.runMin,
		// 		runMax: currentScoreRun.runMax
		// 	});

		// 	// sort by the run's magnitude
		// 	scoringRunsArr.sort(function(a, b) {
		// 		var Adiff = a.runMax - a.runMin;
		// 		var Bdiff = b.runMax - b.runMin;
		// 		return Bdiff - Adiff;
		// 	});
		// }

		// // Draw stuff at the very end
		// if(k==n-1) if(team==2) {
		// 	drawScoringRuns(scoringRunsArr, 3);
		// 	drawMaxDiff(maxScoreData, team1ScoreData, team2ScoreData);
		// }
	}


	/****************************************
	*****   Draw Notable Scoring Runs   *****
	****************************************/

	// function drawScoringRuns(scoringRunsArr, number) {
	// 	for(i=0; i < number; i++) {
	// 		var thisRunTeam1 = team1ScoreData.slice(scoringRunsArr[i].start, scoringRunsArr[i].end + 2);
	// 		var thisRunTeam2 = team2ScoreData.slice(scoringRunsArr[i].start, scoringRunsArr[i].end + 2);

	// 		var thisRun = [];
	// 		for(j=0; j<thisRunTeam1.length; j++) {
	// 			thisRun[j] = {
	// 				time: thisRunTeam1[j].time,
	// 				score1: thisRunTeam1[j].score,
	// 				score2: thisRunTeam2[j].score
	// 			};
	// 		}

	// 		var areaColor = (scoringRunsArr[i].team == 1) ? "rgba(255,0,0,0.7)" : "rgba(155,155,155,0.7)";
	// 		var textColor = (scoringRunsArr[i].team == 1) ? "rgba(255,0,0,1)" : "rgba(50,50,50,1)";

	// 		// Area
	// 		chart.append("svg:path")
	// 				.attr("class", "scoringRun")
	// 				.style("fill", areaColor)
	// 				.attr("opacity", NBAMaster.showRuns)
	// 				.attr("d", area(thisRun))

	// 		// Text
	// 		var runMiddle = (thisRun[0].time + thisRun[thisRun.length-1].time) / 2; // mean of the start and end times
	// 		var minScore = d3.min([thisRunTeam1[0].score, thisRunTeam2[0].score]);

	// 		var teamShort = (scoringRunsArr[i].team == 1) ? awayTeam : homeTeam;
	// 		chart.append("svg:text")
	// 				.attr("class", "scoringRun")
	// 				.style("fill", textColor)
	// 				.attr("opacity", NBAMaster.showRuns)
	// 				.attr("x", x(runMiddle))
	// 				.attr("y", y((minScore-4)/1.1))
	// 				.text(scoringRunsArr[i].runMax + " - " + scoringRunsArr[i].runMin);
	// 	}
	// }




	// /********************************************
	// *****   Draw Max Scoring Differential   *****
	// ********************************************/

	// function drawMaxDiff(maxScoreDiff, team1ScoreData, team2ScoreData) {

	// 	// find the middle of the max diff zone
	// 	// team with the low score
	// 	var lowTeamData = (team1ScoreData[maxScoreDiff.k].score > team2ScoreData[maxScoreDiff.k].score) ? team2ScoreData : team1ScoreData;

	// 	var i = maxScoreDiff.k;
	// 	var nextScoreTime = lowTeamData[lowTeamData.length-1].time;
	// 	while(i++ < lowTeamData.length-1) {
	// 		if(lowTeamData[i].score > lowTeamData[i-1].score) {
	// 			nextScoreTime = lowTeamData[i].time;
	// 			break;
	// 		}
	// 	}
	// 	var maxDiffTime = (maxScoreDiff.time + nextScoreTime)/2;
	// 	var maxDiff = maxScoreDiff.high - maxScoreDiff.low;
	// 	chart.append("svg:path")
	// 			.attr("class", "maxDiff")
	// 			.attr("opacity", NBAMaster.showDiff)
	// 			.attr("d", maxDiffLine([{time: maxDiffTime, score: maxScoreDiff.low}, {time: maxDiffTime, score: maxScoreDiff.high}]))
	// 			.attr("marker-start", "url('#startMarker')")
	// 			.attr("marker-end", "url('#endMarker')");

	// 	chart.append("svg:text")
	// 			.attr("class", "maxDiff")
	// 			.attr("opacity", NBAMaster.showDiff)
	// 			.attr("x", x(maxDiffTime + 100))
	// 			.attr("y", y((maxScoreDiff.low + maxDiff/2)/1.1))
	// 			.text(maxDiff);
	// }

	function createMarkers() {

		chart.insert("svg:defs", ".yAxis")
		.append("svg:marker")
				.attr("id", "startMarker")
				.attr("viewBox", "0 0 10 10")
				.attr("refX", 1)
				.attr("refY", 5)
				.attr("markerWidth", 4)
				.attr("markerHeight", 4)
				.attr("orient", "auto")
		.append("svg:path")
				.attr("d", "M 0 5 L 10 0 L 10 10 z");

		d3.select("defs")
		.append("svg:marker")
				.attr("id", "endMarker")
				.attr("viewBox", "0 0 10 10")
				.attr("refX", 9)
				.attr("refY", 5)
				.attr("markerWidth", 4)
				.attr("markerHeight", 4)
				.attr("orient", "auto")
		.append("svg:path")
				.attr("d", "M 0 0 L 10 5 L 0 10 z")
	}

}

// 	/**************************
// 	*****   gamesOnDate   *****
// 	**************************/

// 	$('#datePicker').datepicker({
// 			onSelect: function(dataText) {
// 			fillDates(dataText);
// 		}
// 	});

// 	function fillDates(dataText) {
// 		// convert to DB date
// 		var dateArr = dataText.split("/");
// 		date = dateArr[2] + dateArr[0] + dateArr[1];

// 		$("#gamePicker").empty();
// 		$("#gamePicker").append("<option class='infoOption'>[Waiting...]</option>");
// 		socket.emit('req_gamesOnDate', date);
// 	}

// 	socket.on('res_gamesOnDate', function(gamesArr) {		
// 		if(gamesArr[0]) {
// 			$("#gamePicker").empty();
// 			$("#gamePicker").append("<option class='infoOption'>[Please select]</option>");
// 			gamesArr.forEach(function(gameObj){
// 				var newEntry = gameObj.awayTeam + " @ " + gameObj.homeTeam;
// 				$("#gamePicker").append("<option>" + newEntry + "</option>");
// 			});
// 		} else {
// 			$("#gamePicker").empty();
// 			$("#gamePicker").append("<option>No game on this day</option>");
// 		}
// 	});



// 	/********************
// 	*****   score   *****
// 	********************/

// 	$('#gamePicker').change(function() {
		
// 		// Hide current pictures and text
// 		$('#awayLogo').attr("src", 'data:image/png;base64,R0lGODlhFAAUAIAAAP///wAAACH5BAEAAAAALAAAAAAUABQAAAIRhI+py+0Po5y02ouz3rz7rxUAOw==');
// 		$('#homeLogo').attr("src", 'data:image/png;base64,R0lGODlhFAAUAIAAAP///wAAACH5BAEAAAAALAAAAAAUABQAAAIRhI+py+0Po5y02ouz3rz7rxUAOw==');
// 		$('#awayScore').text('');
// 		$('#dashScore').text('');
// 		$('#homeScore').text('');

// 		// Show loading icons
// 		$("#loops .icon-loop").removeClass("hidden");

// 		// teams
// 		var gameStr = $('#gamePicker').find(':selected').text();
// 		if(gameStr.length > 10) return;
// 		var arr1 = gameStr.split(" @ ");
// 		awayTeam = arr1[0];
// 		homeTeam = arr1[1];

// 		// Get team logos
// 		$('#awayLogo').attr("src", 'img/teamLogos/200px/' + awayTeam + '.png');
// 		$('#homeLogo').attr("src", 'img/teamLogos/200px/' + homeTeam + '.png');

// 		// Hide loading icons when image is loaded
// 		$('#awayLogo').load(function() {
// 			$('#scoreLoading1').addClass("hidden");
// 		});
// 		$('#homeLogo').load(function() {
// 			$('#scoreLoading3').addClass("hidden");
// 		});

// 		// convert date
// 		var dateArr = $('#datePicker').val().split("/");
// 		date = dateArr[2] + dateArr[0] + dateArr[1];
		
// 		// ask for final score
// 		var scoreReq = {
// 			date: date,
// 			awayTeam: awayTeam,
// 			homeTeam: homeTeam
// 		};
// 		socket.emit('req_score', scoreReq);

// 		// Empty charts
// 		$('#scoringProfileChart').empty();
// 		$('.chartPlaceholder').empty();

// 		// Unhide sections if hidden
// 		$('#scoringProfile').removeClass('hidden');
// 		$('#charts').removeClass('hidden');

// 	});

// 	socket.on('res_score', function(data) {

// 		// e.g. data = "CHI 89-99"
// 		var team = data.substr(0, 3);
// 		var arr1 = data.split(" ");
// 		var score1 = parseInt(arr1[1].split("-")[0]);
// 		var score2 = parseInt(arr1[1].split("-")[1]);

// 		var team1FinalScore = (team==awayTeam) ? score1 : score2;
// 		var team2FinalScore = (team==awayTeam) ? score2 : score1;
		
// 		// Print the score
// 		$('#scoreLoading2').addClass("hidden");
// 		$('#awayScore').text(team1FinalScore);
// 		$('#dashScore').text('  -  ');
// 		$('#homeScore').text(team2FinalScore);

// 		// Display the scoring profile
// 		showProfile();

// 		// Display the charts
// 		showCharts();
// 	});



// 	/**********************
// 	*****   profile   *****
// 	**********************/

// 	var showProfile = function() {
// 		if($('#gamePicker').find(':selected').text().length != 9) return; // Do nothing if no game is selected
// 		var gameReq = {
// 			date: date,
// 			awayTeam: awayTeam,
// 			homeTeam: homeTeam
// 		};
// 		socket.emit('req_profile', gameReq);
// 	};

// 	socket.on('res_profile', function(profileData) {
// 		buildScoringProfile(profileData);
// 	});

// 	// Notable Runs
// 	$("#notableRunsButton").click(function() {
// 		$("#notableRunsButton").toggleClass("active");
// 		if(NBAMaster.showRuns) {
// 			NBAMaster.showRuns = 0;
// 			$("#notableRunsButton").text("Notable Runs");
// 			d3.selectAll(".scoringRun").attr("opacity", 0);
// 		}	else {
// 			NBAMaster.showRuns = 1;
// 			$("#notableRunsButton").text("Notable Runs");
// 			d3.selectAll(".scoringRun").attr("opacity", 1);
// 		}
// 	});
// 	// Maximum Lead
// 	$("#maxDiffButton").click(function() {
// 		$("#maxDiffButton").toggleClass("active");
// 		if(NBAMaster.showMaxDiff) {
// 			NBAMaster.showMaxDiff = 0;
// 			$("#maxDiffButton").text("maximum lead");
// 			d3.selectAll(".maxDiff").attr("opacity", 0);
// 		}	else {
// 			NBAMaster.showMaxDiff = 1;
// 			$("#maxDiffButton").text("maximum lead");
// 			d3.selectAll(".maxDiff").attr("opacity", 1);
// 		}
// 	});



// 	/*********************
// 	*****   Charts   *****
// 	*********************/

// 	var showCharts = function() {
// 		if($('#gamePicker').find(':selected').text().length != 9) return; // Do nothing if no game is selected
// 		var gameReq = {
// 			date: date,
// 			awayTeam: awayTeam,
// 			homeTeam: homeTeam
// 		};
// 		socket.emit('req_charts', gameReq);
// 		socket.emit('req_season', { name: awayTeam, season: 2014 });
// 	};

// 	socket.on('res_charts', function(chartsData) {
// 		buildPieChart(chartsData, "turnovers");
// 		buildPieChart(chartsData, "rebounds");
// 		buildFGBarChart(chartsData, "fg");
// 		buildBarChart(chartsData, "ft");
// 		buildBarChart(chartsData, "threePts");
// 		buildPieChart(chartsData, "assists");
// 	}); // End showCharts()

// 	socket.on('res_season', function(seasonData) {
// 		// console.log(seasonData);
// 	});
// }); // End $(document).ready()






// /**************************
// ***************************
// *****                 *****
// *****   Build Chart   *****
// *****                 *****
// ***************************
// **************************/

// function buildPieChart(gameData, label) {
// 	// pie chart globals
// 	var w=400, h=300, r=150;
// 	var logoSize = 50;
// 	var color = d3.scale.category10();

// 	// Create the svg area
// 	var chart = d3.select('#' + label).append("svg:svg")
// 				.attr("class", "chart")
// 				.attr("width", w)
// 				.attr("height", h);

// 	var resultToPrintAway = gameData.awayTeam[label];
// 	var resultToPrintHome = gameData.homeTeam[label];

// 	// Add home team logo
// 	chart.append("svg:image")
// 		.attr("transform", "translate(" + 0.34*(w-logoSize/2) + "," + (h/2-25-logoSize/2) + ")")
// 		.attr("width", logoSize)
// 		.attr("height", logoSize)
// 		.attr("xlink:href", 'img/teamLogos/200px/' + awayTeam + '.png');
// 	// Add [turnovers, rebounds,...]
// 	chart.append("svg:text")
// 		.attr("class", "teamChartLabel")
// 		.attr("transform", "translate(" + 0.37*w + "," + (h/2+35) + ")")
// 		.attr("text-anchor", "middle")
// 		.attr("fill", "#666")
// 		.text(resultToPrintAway);
// 	// Add home team logo
// 	chart.append("svg:image")
// 		.attr("transform", "translate(" + 0.6*(w-logoSize/2) + "," + (h/2-25-logoSize/2) + ")")
// 		.attr("width", logoSize)
// 		.attr("height", logoSize)
// 		.attr("xlink:href", 'img/teamLogos/200px/' + homeTeam + '.png');
// 	// Add [turnovers, rebounds,...]
// 	chart.append("svg:text")
// 		.attr("class", "teamChartLabel")
// 		.attr("transform", "translate(" + 0.63*w + "," + (h/2+35) + ")")
// 		.attr("text-anchor", "middle")
// 		.attr("fill", "#666")
// 		.text(resultToPrintHome);

// 	// Add vertical line
// 	chart.append("svg:line")
// 		.attr("class", "verticalChartLine")
// 		.attr("x1", 0.5)
// 		.attr("y1", -0.4*r)
// 		.attr("x2", 0.5)
// 		.attr("y2", 0.4*r)
// 		.attr("transform", "translate(" + w/2 + "," + h/2 + ")");


// 	chart.append("svg:g")
// 		 .attr("class", label + "Chart") // ex: "turnoverChart"
// 		 .attr("transform", "translate(" + w/2 + "," + h/2 + ")");

// 	drawPie(gameData);

// 	function drawPie(gameData) {

// 		var currentGroup = d3.select("g." + label + "Chart");
// 		var pieData = [gameData.homeTeam[label], gameData.awayTeam[label]];
		
// 		currentGroup.data(pieData);

// 		var arc = d3.svg.arc();
// 		var pie = d3.layout.pie().sort(null);
// 		pie.value(function(d) { return d; });

// 		var iRadius = 0.75*r;
// 		var oRadius = r;
// 		arc.innerRadius(iRadius).outerRadius(oRadius);
		
// 		var arcs = currentGroup.selectAll("g.slice")
// 					.data(pie(pieData));

// 		// enter
// 		arcs.enter()
// 			.append("svg:g")
// 				.attr("class", "slice")
// 			.append("svg:path")
// 				.attr("d", arc)
// 				.attr("fill", function(d, i) { return teamColor(i); })
// 				.attr("stroke", "rgb(255,255,255")
// 				.attr("stroke-width", "3px");

// 		// update
// 		arcs.attr("d", arc)
// 				.attr("fill", "#eee");

// 		// exit
// 		arcs.exit().remove();
// 	}
// }



// function buildFGBarChart(gameData) {
// 	// bar chart globals
// 	var w = 400, h = 300;
// 	var logoSize = 50;
// 	var barWidth = 50, barHeight = 240;

// 	// Create the svg area
// 	var chart = d3.select('#fg').append("svg:svg")
// 				.attr("class", "chart")
// 				.attr("width", w)
// 				.attr("height", h);

// 	// scales
// 	var y = d3.scale.linear()
// 				.domain([0, 65])
// 				.range([barHeight, 0]);

// 	var data = [
// 				{
// 					team: homeTeam,
// 					value: Math.floor(1000*gameData.homeTeam.fg.made/gameData.homeTeam.fg.att)/10
// 				},
// 				{
// 					team: awayTeam,
// 					value: Math.floor(1000*gameData.awayTeam.fg.made/gameData.awayTeam.fg.att)/10
// 				}
// 	];

// 	var bar = chart.selectAll('g')
// 					.data(data)
// 					.enter().append('g')
// 					.attr('transform', function(d, i) { return "translate(" + (80+(2*(1-i)+1)*barWidth) + ',0)'; });

// 	// the bar itself
// 	bar.append("rect")
// 			.attr('y', function(d) { return y(d.value); })
// 			.attr('height', function(d) { return barHeight - y(d.value); })
// 			.attr('width', barWidth)
// 			.attr('fill', function(d, i) { return teamColor(i); });

// 	// the text
// 	bar.append("text")
// 			.attr('x', barWidth/2-23)
// 			.attr('y', function(d) { return y(d.value+2); })
// 			.attr('class', 'teamFGChartLabel')
// 			.text(function(d) { return d.value.toPrecision(3) + '%'; });

// 	// X axis line
// 	chart.append("line")
// 			.attr('x1', 0.2*w)
// 			.attr('x2', 0.8*w)
// 			.attr('y1', barHeight)
// 			.attr('y2', barHeight)
// 			.attr('stroke', "#666")
// 			.attr('stroke-width', "1px");
// 	// Add away team logo
// 	chart.append("svg:image")
// 		.attr("transform", "translate(" + 0.32*w + "," + (barHeight+5) + ")")
// 		.attr("width", logoSize)
// 		.attr("height", logoSize)
// 		.attr("xlink:href", 'img/teamLogos/200px/' + awayTeam + '.png');
// 	// Add home team logo
// 	chart.append("svg:image")
// 		.attr("transform", "translate(" + 0.57*w + "," + (barHeight+5) + ")")
// 		.attr("width", logoSize)
// 		.attr("height", logoSize)
// 		.attr("xlink:href", 'img/teamLogos/200px/' + homeTeam + '.png');
// }



// function buildBarChart(gameData, label) {
// 	// bar chart globals
// 	var w = 400, h = 300;
// 	var logoSize = 50;
// 	var barWidth = 50, barHeight = 240;

// 	var data = [
// 				{
// 					team: homeTeam,
// 					made: gameData.homeTeam[label].made,
// 					att: gameData.homeTeam[label].att,
// 				},
// 				{
// 					team: awayTeam,
// 					made: gameData.awayTeam[label].made,
// 					att: gameData.awayTeam[label].att,
// 				}
// 	];

// 	// Create the svg area
// 	var chart = d3.select('#' + label).append("svg:svg")
// 				.attr("class", "chart")
// 				.attr("width", w)
// 				.attr("height", h);

// 	// scales
// 	var y = d3.scale.linear()
// 				.domain([0, 1.15*d3.max(data, function(d) { return d.made; })]) // *1.1 so that the bar doesn't go too high and leaves space for the text
// 				.range([barHeight, 0]);

// 	var bar = chart.selectAll('g')
// 					.data(data)
// 					.enter().append('g')
// 					.attr('transform', function(d, i) { return "translate(" + (80+(2*(1-i)+1)*barWidth) + ',0)'; });

// 	// the bar itself
// 	bar.append("rect")
// 			.attr('y', function(d) { return y(d.made); })
// 			.attr('height', function(d) { return barHeight - y(d.made); })
// 			.attr('width', barWidth)
// 			.attr('fill', function(d, i) { return teamColor(i); });

// 	// the text
// 	bar.append("text")
// 			.attr('x', barWidth/2-30)
// 			.attr('y', function(d) { return y(d.made)-10; })
// 			.attr('class', 'teamBarChartLabel')
// 			.text(function(d) { return d.made + ' / ' + d.att; });

// 	// X axis line
// 	chart.append("line")
// 			.attr('x1', 0.2*w)
// 			.attr('x2', 0.8*w)
// 			.attr('y1', barHeight)
// 			.attr('y2', barHeight)
// 			.attr('stroke', "#666")
// 			.attr('stroke-width', "1px");
// 	// Add away team logo
// 	chart.append("svg:image")
// 		.attr("transform", "translate(" + 0.32*w + "," + (barHeight+5) + ")")
// 		.attr("width", logoSize)
// 		.attr("height", logoSize)
// 		.attr("xlink:href", 'img/teamLogos/200px/' + awayTeam + '.png');
// 	// Add home team logo
// 	chart.append("svg:image")
// 		.attr("transform", "translate(" + 0.57*w + "," + (barHeight+5) + ")")
// 		.attr("width", logoSize)
// 		.attr("height", logoSize)
// 		.attr("xlink:href", 'img/teamLogos/200px/' + homeTeam + '.png');
// }






// function teamColor(i) {
// 	return (i===0) ? NBAMaster.team[homeTeam][2] : NBAMaster.team[awayTeam][2];
// }


