const express = require('express');
const open = require('open');
var reload = require('reload')

const app = express();
const port = 3000;

app.use(express.static(__dirname));
// app.listen(port, () => {
  
//   console.log(`Server listening at http://localhost:${port}`);
//   open(`http://localhost:${port}/index.html`)
// });



reload(app).then(function () {
  app.listen(port, function () {
   console.log(`Server listening at http://localhost:${port}`);
  })
}).catch(function (err) {
  console.error('Reload could not start, could not start server/sample app', err)
})
