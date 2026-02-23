const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

async function askClaude(message) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: 'אתה מאמן כושר אישי בשם קואץ. אתה עונה בעברית בצורה קצרה ומקצועית.',
      messages: [{ role: 'user', content: message }]
    })
  });
  const data = await response.json();
  console.log('Claude response:', JSON.stringify(data));
  if (data.content && data.content[0]) {
    return data.content[0].text;
  }
  console.log('Error:', JSON.stringify(data));
  return 'לא הצלחתי לענות, נסה שוב';
}

app.post('/webhook', async (req, res) => {
  try {
    const message = req.body.Body || '';
    const reply = await askClaude(message);
    res.set('Content-Type', 'text/xml');
    res.send('<Response><Message>' + reply + '</Message></Response>');
  } catch (err) {
    console.error('Error:', err);
    res.set('Content-Type', 'text/xml');
    res.send('<Response><Message>שגיאה, נסה שוב</Message></Response>');
  }
});

app.get('/', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('server running on port ' + PORT));