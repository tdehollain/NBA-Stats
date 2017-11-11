const express = require('express');
const app = express();
const router = express.Router();
const port = 8002;

app.set('view engine', 'pug');
app.use(express.static('public'));

const db = require('./db.js');
const analytics = require('./analytics.js');
const utils = require('./utils.js');



// Main
router.get('/', (req, res) => {
	let todayDate = new Date;
	renderDay(res, todayDate.addDays(-1));
});


// Validate date format
router.param('date', (req, res, next, date) => {
	if(!utils.isNumeric(date) || date.length !== 8) {
		// wrong format for date
		res.errorMsg = 'Wrong format for ID: ' + date;
		req.validated = false;
		next();
	} else {
		req.date = date;
		req.validated = true;
		next();
	}
});


// Get list of games for a date
router.get('/:date', (req, res) => {
	if(req.validated) {
		let todayDate = new Date(req.date.substr(0,4), req.date.substr(4,2)-1, req.date.substr(6,2));
		renderDay(res, todayDate);
	} else {
		res.send(res.errorMsg);
	}
});


function renderDay(res, todayDate) {
	let yesterday = todayDate.addDays(-1).stringify();
	let today = todayDate.stringify();
	let tomorrow = todayDate.addDays(1).stringify();
	db.getGames(today, (err, games) => {
		if(err){
			res.send(err);
		} else {
			let gamesData = games.map(elem => {
				return {
					gameId: elem.gameId,
					awayTeam: elem.awayTeam,
					awayTeamShort: utils.teamData[elem.awayTeam].shortName,
					homeTeam: elem.homeTeam,
					homeTeamShort: utils.teamData[elem.homeTeam].shortName,
					gameScoreData: analytics.calcutateGameScore(elem)
				};
			}); 
			res.render('index', { 
				dates: { 
					yesterday: yesterday, 
					today: today, 
					tomorrow: tomorrow, 
					yesterdayLong: yesterday.expandDate(), 
					todayLong: today.expandDate(), 
					tomorrowLong: tomorrow.expandDate() 
				}, 
				games: gamesData 
			});
		}
	});
}


// Validate gameId and get data
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


router.get('/game/:gameId', (req, res) => {
	if(req.validated) {
		res.send('Under construction');
	} else {
		res.send(res.errorMsg);
	}
});

app.use('/', router);


app.listen(port);
console.log('nbaStats app running on port ' + port);



String.prototype.expandDate = function() {
	let year = this.substr(0,4);
	let month = this.substr(4,2)-1;
	let day = this.substr(6,2);

	let monthArr = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
	]
	return day + ' ' + monthArr[month] + ' ' + year;
}

String.prototype.addZero =  function() {
	return this.length < 2 ? '0' + this : this;
}


Date.prototype.addDays = function(days) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

Date.prototype.stringify = function() {
	let dat = new Date(this.valueOf());
	return dat.getFullYear().toString() + (dat.getMonth()+1).toString().addZero() + dat.getDate().toString().addZero();
}