const express = require('express');
const https = require('https');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

let currentCharacterIndex = 0;
let characters = [];

function getCharacters(callback) {
  const url = 'https://thronesapi.com/api/v2/Characters';

  https.get(url, (resp) => {
    let data = '';


    resp.on('data', (chunk) => {
      data += chunk;
    });

 
    resp.on('end', () => {
      characters = JSON.parse(data);
      callback();
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

// Renderizar el personaje actual
function renderCharacter(res, index) {
  const character = characters[index];
  const family = character.family ? character.family : 'Unknown';
  const familyCrest = character.familyCrest || '';

  res.render('index', {
    character,
    family,
    familyCrest,
    index,
    total: characters.length
  });
}


app.get('/', (req, res) => {
  if (characters.length === 0) {
    getCharacters(() => {
      renderCharacter(res, currentCharacterIndex);
    });
  } else {
    renderCharacter(res, currentCharacterIndex);
  }
});

app.get('/next', (req, res) => {
  currentCharacterIndex = (currentCharacterIndex + 1) % characters.length;
  renderCharacter(res, currentCharacterIndex);
});

app.get('/prev', (req, res) => {
  currentCharacterIndex = (currentCharacterIndex - 1 + characters.length) % characters.length;
  renderCharacter(res, currentCharacterIndex);
});


app.get('/search', (req, res) => {
  const searchQuery = req.query.q.toLowerCase();
  const searchResults = characters.filter(character =>
    character.firstName.toLowerCase().includes(searchQuery) ||
    character.lastName.toLowerCase().includes(searchQuery)
  );

  if (searchResults.length > 0) {
    renderCharacter(res, characters.indexOf(searchResults[0]));
  } else {
    res.send('Character not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
