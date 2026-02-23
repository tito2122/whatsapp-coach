const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));

app.post('/webhook', (req, res) => {
  const message = req.body.Body;
  const from = req.body.From;
  
  console.log(`הודעה מ-${from}: ${message}`);
  
  // תגובה בסיסית
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>קיבלתי את ההודעה שלך: "${message}" 💪</Message>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`שרת רץ על פורט ${PORT}`));
```