const express = require('express');
const app = express();
const router = express.Router();
const port = 8002;



router.get('/', (req, res) => {
	res.send('nbaStats app is running!');
});

router.param('gameid', (req, res, next, gameid) => {
	if(!isNumeric(gameid)) {
		req.good = false;
	} else {
		req.good = true;
	}
	req.gameid = gameid;
	next(); 
});

router.get('/rating/:gameid', (req, res) => {
	if(req.good) {
		res.send('Getting rating for game : ' + req.params.gameid);
	} else {
		res.send('Wrong query: ' + req.gameid);
	}
});

app.use('/', router);


app.listen(port);
console.log('nbaStats app running on port ' + port);



function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}