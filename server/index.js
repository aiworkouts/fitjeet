const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const { videoToken } = require('./tokens');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);

app.use(`/`, express.static(`build`));

const sendTokenResponse = (token, res, code) => {
  let role = 'default';
  if(code === 'secret2020rona')
    role = 'instructor'
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt(),
      role: role,
    })
  );
};

const sendClassNotFound = (res) => {
  let role = 'default';
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: '',
      role: role,
      error: 'Class room not found'
    })
  );
};

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.post('/video/token', (req, res) => {
  let identity = req.body.identity;
  const room = req.body.room;
  const code = req.body.code;
  if(room !== 'workout101') {
    sendClassNotFound(res)
    return
  }
  if(code === 'secret2020rona')
    identity += '-instructor'
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res, code);
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
