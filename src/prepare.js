const http = require('https');
const fs = require('fs');

console.log("downloading...")

const url = 'https://firebasestorage.googleapis.com/v0/b/vysio-workout.appspot.com/o/LowImpactCardio.mp4?alt=media&token=9853e998-3e6b-438b-94a5-f01718d0232f'
const file = fs.createWriteStream('public/assets/LowImpactCardio.mp4');
const request = http.get(url, function(response) {
  response.pipe(file);
});

