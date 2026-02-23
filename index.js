const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

async function askGroq(message) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 500,
      messages: [
        { role: 'system', content: 'אתה מאמן כושר אישי בשם קואץ. אתה עונה בעברית בצורה קצרה, מעודדת ומקצועית. אתה עוזר למשתמש עם תוכניות אימון, תזונה ומוטיבציה.' },
        { role: 'user', content: message }
      ]
    })
  });
  const data = await response.json();
  console.log('Groq response:', JSON.stringify(data));
  return data.choices[0].message.content;
}

app.post('/webhook', async (req, res) => {
  try {
    const message = req.body.Body || '';
    const reply = await askGroq(message);
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