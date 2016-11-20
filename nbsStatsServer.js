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
				res.gameScoreData = analytics.calcutateGameScore(docs[0]);
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
		let output = '<h2>Getting rating for game : ' + req.gameId + '</h2><ul>';
		output += '<li>Top team score: ' + res.gameScoreData.maxTeamPoints + '</li>';
		output += '<li>Lead Changes: ' + res.gameScoreData.leadChanges + '</li>';
		output += '<li>Late Lead Changes: ' + res.gameScoreData.lateLeadChanges + '</li>';
		output += '<li>Ties: ' + res.gameScoreData.ties + '</li>';
		output += '<li>Overtimes: ' + res.gameScoreData.nbOvertimes + '</li>';
		output += '<li>Buzzer beater (to tie the game): ' + res.gameScoreData.buzzerBeaterTier + '</li>';
		output += '<li>Buzzwe beater (to win the game): ' + res.gameScoreData.buzzerBeaterWinner + '</li>';
		output += '<li>Time-averaged scoring differential: ' + res.gameScoreData.scoringDiffWeightedAvg + '</li>';
		output += '<li>Individual performance - points: ' + JSON.stringify(res.gameScoreData.pointsPerf) + '</li>';
		output += '<li>Individual performance - 3 Points made: ' + JSON.stringify(res.gameScoreData.threePtsPerf) + '</li>';
		output += '<li>Individual performance - Rebounds: ' + JSON.stringify(res.gameScoreData.reboundsPerf) + '</li>';
		output += '<li>Individual performance - Assists: ' + JSON.stringify(res.gameScoreData.assitsPerf) + '</li>';
		output += '<li>Individual performance - Steals: ' + JSON.stringify(res.gameScoreData.stealsPerf) + '</li>';
		output += '<li>Individual performance - Blocks: ' + JSON.stringify(res.gameScoreData.blocksPerf) + '</li></ul>';
		res.send(output);
	} else {
		res.send(res.errorMsg);
	}
});

app.use('/', router);


app.listen(port);
console.log('nbaStats app running on port ' + port);