const http = require('https');
const fs = require('fs');

console.log("downloading...")

const toDownload = [
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/vysio-workout.appspot.com/o/LowImpactCardio.mp4?alt=media&token=9853e998-3e6b-438b-94a5-f01718d0232f',
    dest: 'public/assets/LowImpactCardio.mp4'
  },
  {
    url: 'https://raw.githubusercontent.com/video-react/video-react/master/docs/static/poster.png',
    dest: 'public/assets/poster.png' 
  }
];

for(x of toDownload) {
  const file = fs.createWriteStream(x.dest);
  const request = http.get(x.url, function(response) {
    response.pipe(file);
  });
}


