const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/webhook', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send('<Response><Message>שלום! קיבלתי את הודעתך 💪</Message></Response>');
});

app.get('/', (req, res) => {
  res.send('ok');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('server running on port ' + PORT));