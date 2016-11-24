const express = require('express');
const app = express();
const router = express.Router();
const port = 8002;


const PbpModel = require('./db.js').PbpModel;
const analytics = require('./analytics.js');
const utils = require('./utils.js');

// Main
router.get('/', (req, res) => {
	res.send('nbaStats app is running!');
});

// Validate date
router.param('date', (req, res, next, date) => {

	// validate format
	if(!utils.isNumeric(date) || date.length !== 8) {
		// wrong format for date
		res.errorMsg = 'Wrong format for ID: ' + date;
		req.validated = false;
		next();
	} else {
		req.date = date;
		// Check if date exists
		PbpModel.find({ date: date }, (err, docs) => {
			if(docs.length >= 1) {
				// Found the game
				res.gameIds = docs.map(elem => {
					return {
						gameId: elem.gameId,
						awayTeam: elem.awayTeam,
						homeTeam: elem.homeTeam
					};
				});
				req.validated = true;
				next();
			} else {
				// Game not found
				res.errorMsg = 'Error: no game found with this ID: ' + date;
				req.validated = false;
				next();
			}
		});
	}
});


// Get list of games for a date
router.get('/games/:date', (req, res) => {
	if(req.validated) {
		let output = '<h2>Getting games on: ' + req.date + '</h2>';
		res.gameIds.forEach(elem => {
			let currGame = '<a href=/rating/' + elem.gameId + '>' + elem.awayTeam + ' @ ' + elem.homeTeam + '</p>';
			output += currGame;
		});
		res.send(output);
	} else {
		res.send(res.errorMsg);
	}
});

// Validate gameId
router.param('gameId', (req, res, next, gameId) => {

	// validate format
	if(!utils.isNumeric(gameId) || gameId.length !== 10) {
		// wrong format for gameId
		res.errorMsg = 'Wrong format for ID: ' + gameId;
		req.validated = false;
		next();
	} else {
		req.gameId = gameId;
		// Check if gameId exists
		PbpModel.find({ gameId: gameId }, (err, docs) => {
			if(docs.length === 1) {
				// Found the game
				let gameAnalytics = analytics.calcutateGameScore(docs[0]);
				res.gameScore = gameAnalytics.gameScore;
				res.indivScore = gameAnalytics.indivScore;
				res.gameScoreElements = gameAnalytics.gameScoreElements;
				req.validated = true;
				next();
			} else if(docs.length > 1) {
				// Unexpected Error: more than one game found
				res.errorMsg = 'Unexpected error: monre than one game found with this ID: ' + gameId;
				req.validated = false;
				next();
			} else {
				// Game not found
				res.errorMsg = 'Error: no game found with this ID: ' + gameId;
				req.validated = false;
				next();
			}
		});
	}
});


router.get('/rating/:gameId', (req, res) => {
	if(req.validated) {
		let output = '<h1>Getting rating for game : ' + req.gameId + '</h1><ul>';
		let overallScore = res.gameScore + res.indivScore;
		output += '<h2>Overall Game Score: ' + overallScore + '</h2>';
		output += '<h4>Game itself: ' + res.gameScore + '</h4>';
		output += '<h4>Individual Performances: ' + res.indivScore + '</h4>';
		output += '<li>Top team score: ' + res.gameScoreElements.maxTeamPoints + '</li>';
		output += '<li>Lead Changes: ' + res.gameScoreElements.leadChanges + '</li>';
		output += '<li>Late Lead Changes: ' + res.gameScoreElements.lateLeadChanges + '</li>';
		output += '<li>Ties: ' + res.gameScoreElements.ties + '</li>';
		output += '<li>Overtimes: ' + res.gameScoreElements.nbOvertimes + '</li>';
		output += '<li>Buzzer beater (to tie the game): ' + res.gameScoreElements.buzzerBeaterTier + '</li>';
		output += '<li>Buzzwe beater (to win the game): ' + res.gameScoreElements.buzzerBeaterWinner + '</li>';
		output += '<li>Time-averaged scoring differential: ' + res.gameScoreElements.scoringDiffWeightedAvg + '</li>';
		output += '<li>Individual performance - points: ' + JSON.stringify(res.gameScoreElements.pointsPerf) + '</li>';
		output += '<li>Individual performance - 3 Points made: ' + JSON.stringify(res.gameScoreElements.threePtsPerf) + '</li>';
		output += '<li>Individual performance - Rebounds: ' + JSON.stringify(res.gameScoreElements.reboundsPerf) + '</li>';
		output += '<li>Individual performance - Assists: ' + JSON.stringify(res.gameScoreElements.assistsPerf) + '</li>';
		output += '<li>Individual performance - Steals: ' + JSON.stringify(res.gameScoreElements.stealsPerf) + '</li>';
		output += '<li>Individual performance - Blocks: ' + JSON.stringify(res.gameScoreElements.blocksPerf) + '</li>';
		output += '<li>Individual performance - Triple Doubles: ' + JSON.stringify(res.gameScoreElements.tripleDoublePerf) + '</li></ul>';
		res.send(output);
	} else {
		res.send(res.errorMsg);
	}
});

app.use('/', router);


app.listen(port);
console.log('nbaStats app running on port ' + port);