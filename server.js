const express = require('express');
const open = require('open');

const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  open(`http://localhost:${port}/DiagramPage.html`);
});
