const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const SHEETS_URL = process.env.SHEETS_URL;

async function loadHistory(phone) {
  try {
    const res = await fetch(SHEETS_URL + '?phone=' + encodeURIComponent(phone));
    const data = await res.json();
    return data.history || [];
  } catch (e) {
    return [];
  }
}

async function saveHistory(phone, history) {
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify({ phone, history }),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('שגיאה בשמירה:', e);
  }
}

async function askGroq(phone, message) {
  const history = await loadHistory(phone);
  history.push({ role: 'user', content: message });
  if (history.length > 10) history.splice(0, history.length - 10);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        { role: 'system', content: 'אתה מאמן כושר אישי בשם רועי. אתה ישראלי, מדבר עברית תקנית וטבעית בלבד. אסור לך להשתמש במילים באנגלית. אתה מעודד, מקצועי וחברותי. אתה עוזר עם תוכניות אימון, תזונה נכונה ומוטיבציה. בפגישה ראשונה שאל: מה שמך? מה המטרה שלך? כמה פעמים בשבוע אתה מתאמן?' },
        ...history
      ]
    })
  });

  const data = await response.json();
  const reply = data.choices[0].message.content;
  history.push({ role: 'assistant', content: reply });
  await saveHistory(phone, history);
  return reply;
}

app.post('/webhook', async (req, res) => {
  try {
    const message = req.body.Body || '';
    const phone = req.body.From || 'unknown';
    const reply = await askGroq(phone, message);
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