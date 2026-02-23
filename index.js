const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));

app.post('/webhook', (req, res) => {
  const message = req.body.Body;
  const from = req.body.From;
  console.log('message from: ' + from);
  res.type('text/xml');
  res.send('<Response><Message>קיבלתי: ' + message + '</Message></Response>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('server running on port ' + PORT));