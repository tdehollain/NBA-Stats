const express = require('express');
const app = express();
const port = 8002;


app.get('/', (req, res) => {
	res.send('App is running!');
});



app.listen(port);
console.log('nbaStats app running on port ' + port);