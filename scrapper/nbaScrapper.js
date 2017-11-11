const http=require('http');
const cheerio=require('cheerio');
const mongoose = require('mongoose');

// MongoDB Connection & Schema
// mongoose.connect('mongodb://localhost:27017/nba', (err) => {
mongoose.connect('mongodb://localhost:9001/nba', (err) => {
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

let PbpModel = mongoose.model('pbp', pbpSchema);

String.prototype.addZero =  function() {
	return this.length < 2 ? '0' + this : this;
}
Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

/****************************
*****   HTTP requests   *****
****************************/

const season = '2016';
let date = process.argv[2];
if(!date) {
	let today = new Date();
	let yesterday = today.addDays(-1);
	date = yesterday.getFullYear().toString() + (yesterday.getMonth()+1).toString().addZero() + yesterday.getDate().toString().addZero();
}
const mainURL = 'http://msnbchosted.stats.com/nba/scoreboard.asp?day=' + date;
const host = 'http://msnbchosted.stats.com';
// const userAgents = [
// 	'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17',
// 	'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:18.0) Gecko/20100101 Firefox/18.0',
// 	'Mozilla/5.0 (Windows NT 5.1; rv:13.0) Gecko/20100101 Firefox/13.0.1',
// 	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/536.26.17 (KHTML, like Gecko) Version/6.0.2 Safari/536.26.17',
// 	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17',];
// const headers = {
// 	'User-Agent': userAgents[0],
// 	'Content-Type': 'application/x-www-form-urlencoded'};


myOwnGetRequest(mainURL, (err, rawData) => {
	if(err) {
		console.log(err.message);
		mongoose.connection.close();
		return;
	}
	const gameList = getGames(rawData);
	let i=0;
	if(gameList.length) {
		gameList.forEach(gameURLs => {
			getPlayByPlay(gameURLs.pbp, (err2, gameData) => {
				console.log('Getting PBP for: ' + gameURLs.pbp);
				if(err2) {
					console.log("Error getting data for game URL: " + gameURLs.pbp);
				} else {
					getBox(gameURLs.box, (err3, gameBox) => {
						gameData.box = gameBox;
						writeGameToDB(gameData, gameURLs.pbp, (err3) => {
							i++;
							if(err3) console.log(err3); else console.log('Game saved to DB: ' + i + ': ' + gameURLs.pbp);
							if(i===gameList.length) mongoose.connection.close();
						});
					});
				}
			});
		});
	} else {
		console.log('No game on date: ' + date);
		mongoose.connection.close();
		process.exit();
	}
});


function myOwnGetRequest(url, callback) {
	http.get(url, (res) => {
		if(res.statusCode !== 200) {
			const error = new Error("Error: failed to load URL '" + url + "'- Status Code: " + res.statusCode);
			res.resume();
			callback(error);
			return;
		}

		res.setEncoding('utf-8');
		let rawData = '';
		res.on('data', (chunck) => rawData += chunck);
		res.on('end', () => {callback(null, rawData);});
	});
}

function getGames(content) {
	const $ = cheerio.load(content);
	let list = [];
	$('.shsRecapLink a').each((i, elem) => {
		let url = elem.attribs.href;
		let gameURLs = {};
		if(url.indexOf('recap') !== -1) {
			let gameCode = url.slice(url.indexOf('?g=') + 3, url.indexOf('?g=') + 13);
			gameURLs.box = 'http://msnbchosted.stats.com/nba/boxscore.asp?gamecode=' + gameCode;
			gameURLs.pbp = 'http://msnbchosted.stats.com/nba/pbp.asp?gamecode=' + gameCode;
			list.push(gameURLs);
		}
	});
	return list;
}

function getBox(url, callback) {
	myOwnGetRequest(url, (err, content) => {
		const $ = cheerio.load(content);
		let data= {
			awayTeam: [],
			homeTeam: []
		};
		$('#shsBoxscore').find('table.shsBorderTable').each((i, elem) => {
			$(elem).find('tr.shsRow0Row, tr.shsRow1Row').each((j, subElem) => {
				let playerData = {};
				$(subElem).find('td').each((k, subSubElem) => {
					if($(subSubElem).hasClass('shsDNP')) {
						playerData.played = false;
						switch(k) {
							case 0: playerData.player = $(subSubElem).text();
							case 1: playerData.note = $(subSubElem).text();
						}
					} else {
						playerData.played = true;
						playerData.note = '';
						switch(k) {
							case 0: playerData.player = $(subSubElem).text();
							case 1: playerData.position = $(subSubElem).text();
							case 2: playerData.minutes = $(subSubElem).text();
							case 3: {
								let myArr = $(subSubElem).text().split('-');
								playerData.fieldGoals = { attemps: parseInt(myArr[1], 10), made: parseInt(myArr[0], 10) };
							}
							case 4: {
								let myArr = $(subSubElem).text().split('-');
								playerData.freeThrows = { attemps: parseInt(myArr[1], 10), made: parseInt(myArr[0], 10) };
							}
							case 5: {
								let myArr = $(subSubElem).text().split('-');
								playerData.threePts = { attemps: parseInt(myArr[1], 10), made: parseInt(myArr[0], 10) };
							}
							case 6: playerData.plusMinus = $(subSubElem).text();
							case 7: playerData.OffRebounds = parseInt($(subSubElem).text(), 10);
							case 8: playerData.rebounds = parseInt($(subSubElem).text(), 10);
							case 9: playerData.assists = parseInt($(subSubElem).text(), 10);
							case 10: playerData.blocks = parseInt($(subSubElem).text(), 10);
							case 11: playerData.steals = parseInt($(subSubElem).text(), 10);
							case 12: playerData.turnovers = parseInt($(subSubElem).text(), 10);
							case 13: playerData.fouls = parseInt($(subSubElem).text(), 10);
							case 14: playerData.points = parseInt($(subSubElem).text(), 10);
						}
					}
				});
				i === 0 ? data.awayTeam.push(playerData) : data.homeTeam.push(playerData);
			});	
		});

		callback(null, data);
	});
}

function getPlayByPlay(url, callback) {
	myOwnGetRequest(url, (err, content) => {
		const $ = cheerio.load(content);
		let data = {
			awayTeam: '',
			homeTeam: '',
			pbp: []
		};

		// Get teams
		$('table.shsMastScoreboard').find('a').each((i, elem) => {
			i===0 ? data.awayTeam = $(elem).text() : data.homeTeam = $(elem).text();
		});

		// Get Play by Play data
		$('table.shsBorderTable').find('tr').each((i, elem) => {
			if($(elem).hasClass('shsMorePBPRow') && ($(elem).hasClass('shsRow0Row') || $(elem).hasClass('shsRow1Row'))) {
				let play = {};
				$(elem).find('td').each((j, subElem) => {
					switch(j) {
						case 0: play.quarter = $(subElem).text();
						case 1: play.time = $(subElem).text();
						case 2: play.team = $(subElem).text();
						case 3: play.description = $(subElem).text();
						case 4: play.awayTeamScore = parseInt($(subElem).text(), 10);
						case 5: play.homeTeamScore = parseInt($(subElem).text(), 10);
					}
				});

				data.pbp.push(play);
			}
		});

		// reverse the array if it starts with the end		
		if(data.pbp[0].quarter !== "1") data.pbp = data.pbp.reverse();

		// Simplify quarters
		data.pbp.forEach(play => {
			// convert OT quarters
			if(play.quarter.indexOf('OT')!==-1) {
				if(play.quarter.length===2) {
					play.quarter = 5;
				} else {
					play.quarter = 4 + parseInt(play.quarter.replace('OT', ''), 10);
				}
			} else {
				play.quarter = parseInt(play.quarter, 10);
			}

			let minutes = 0;
			let seconds = 0;
			let timeArr = play.time.split(':');
			minutes = parseInt(timeArr[0], 10);
			seconds = parseInt(timeArr[1], 10);
			play.elapsedTimeSeconds = play.quarter < 5 ? play.quarter*12*60 - minutes*60 - seconds : 4*12*60 + (play.quarter-4)*5*60 - minutes*60 - seconds;
		});

		callback(null, data);
	});
}


function writeGameToDB(gameData, gameURL, callback) {
	
	// Build data model
	let pbp = new PbpModel({
		gameId: gameURL.slice(gameURL.indexOf('?gamecode=') + 10, gameURL.indexOf('?gamecode=') + 20),
		season: season,
		date: date,
		awayTeam: gameData.awayTeam,
		homeTeam: gameData.homeTeam,
		box: gameData.box,
		playbyplay: gameData.pbp
	});

	// Check if already exists
	PbpModel.find({ 
		date: date,
		awayTeam: gameData.awayTeam,
		homeTeam: gameData.homeTeam 
	}, (err, docs) => {
		if(err) {
			callback(new Error('Unknown Error looking for game ' + gameURL + ': ' + err));
			return;
		} else {
			if(docs.length) {
				callback('Error saving game ' + gameURL + ': game already exists in DB');
			} else {
				// Save
				pbp.save((err) => {	
					if(err)	{
						callback(new Error('Unknown Error saving game ' + gameURL + ': ' + err));
					} else {
						callback(null);
					}
				});
			}
		}
	});
}





