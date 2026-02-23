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
  if (history.length > 10) history.splice(0, history.length - 1