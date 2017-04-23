const mongoose = require('mongoose');

// MongoDB Connection & Schema
mongoose.connect('mongodb://localhost:27017/nba', (err) => {
// mongoose.connect('mongodb://localhost:9001/nba', (err) => {
	if(err) {
		console.log('Error connecting to MongoDB: ' + err);
	} else {
		console.log('MongoDB connection successful!');
	}
});
let pbpSchema = new mongoose.Schema({
	gameId: Number,
	season: Number,
	date: String,
	homeTeam: String,
	awayTeam: String,
	box: {
		awayTeam: [{
			played: Boolean,
			note: String,
			player: String,
			position: String,
			minutes: String,
			fieldGoals: {
				attemps: Number,
				made: Number
			},
			freeThrows: {
				attemps: Number,
				made: Number
			},
			threePts: {
				attemps: Number,
				made: Number
			},
			plusMinus: String,
			OffRebounds: Number,
			rebounds: Number,
			assists: Number,
			blocks: Number,
			steals: Number,
			turnovers: Number,
			fouls: Number,
			points: Number
		}],
		homeTeam: [{
			played: Boolean,
			note: String,
			player: String,
			position: String,
			minutes: String,
			fieldGoals: {
				attemps: Number,
				made: Number
			},
			freeThrows: {
				attemps: Number,
				made: Number
			},
			threePts: {
				attemps: Number,
				made: Number
			},
			plusMinus: String,
			OffRebounds: Number,
			rebounds: Number,
			assists: Number,
			blocks: Number,
			steals: Number,
			turnovers: Number,
			fouls: Number,
			points: Number
		}]
	},
	playbyplay: [{
		quarter: Number,
		time: String,
		elapsedTimeSeconds: Number,
		team: String,
		awayTeamScore: Number,
		homeTeamScore: Number,
		description: String
	}]
});

PbpModel = mongoose.model('pbp', pbpSchema);

module.exports.getGames = function(date, callback) {
	PbpModel.find({ date: date }, (err, docs) => {
		if(err) {
			callback('Unexpected error fetching games on date: ' + date);
		} else {
			// let games = docs.map(elem => {
			// 	return {
			// 		gameId: elem.gameId,
			// 		awayTeam: elem.awayTeam,
			// 		homeTeam: elem.homeTeam
			// 	};
			// });
			callback(null, docs);
		}
	});
}