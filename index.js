const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const conversations = {};

async function askGroq(userPhone, message) {
  if (!conversations[userPhone]) {
    conversations[userPhone] = [];
  }
  conversations[userPhone].push({ role: 'user', content: message });
  if (conversations[userPhone].length > 10) {
    conversations[userPhone] = conversations[userPhone].slice(-10);
  }

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
        { role: 'system', content: 'אתה מאמן כושר אישי בשם רועי. אתה ישראלי, מדבר עברית תקנית וטבעית בלבד. אסור לך להשתמש במילים באנגלית. אתה מעודד, מקצועי וחברותי. אתה עוזר עם תוכניות אימון, תזונה נכונה ומוטיבציה. שאלות ראשונות תמיד: מה המטרה שלך? כמה פעמים בשבוע אתה מתאמן?' },
        ...conversations[userPhone]
      ]
    })
  });

  const data = await response.json();
  const reply = data.choices[0].message.content;
  conversations[userPhone].push({ role: 'assistant', content: reply });
  return reply;
}

app.post('/webhook', async (req, res) => {
  try {
    const message = req.body.Body || '';
    const userPhone = req.body.From || 'unknown';
    const reply = await askGroq(userPhone, message);
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