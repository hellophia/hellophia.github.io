
const fs = require('fs');
const path = require('path');

const folderPath = '/Users/sophiafoster-dimino/Dropbox/github/hellophia/españolmix/letras';

const songlist = [];

fs.readdirSync(folderPath).forEach(file => {
    if (file.endsWith('.txt')) {
        const filePath = path.join(folderPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8').split('\n');
        const artistName = fileContent[0].trim();
        const songName = fileContent[1].trim();
        const spotifyURI = fileContent[2].trim(); // Assuming URI is on the third line

        songlist.push({
            fileName: file,
            artistName: artistName,
            songName: songName,
            spotifyURI: spotifyURI
        });
    }
});

fs.writeFileSync('songlist.js', `const songlist = ${JSON.stringify(songlist, null, 4)}`);