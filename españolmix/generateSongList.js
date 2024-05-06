
const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/sophiafoster-dimino/Dropbox/github/hellophia/españolmix/letras'; // Change this to the path of your folder containing the .txt files

fs.readdir(directoryPath, function(err, files) {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    } 

    const txtFiles = files.filter(file => path.extname(file).toLowerCase() === '.txt');
    const songList = txtFiles.map(file => {
        const fileName = file.replace('.txt', '');
        const [bandName, songName] = fileName.split('_').map(word => {
            return word.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        });
        return { fileName, bandName, songName };
    });
    
    const jsCode = `const songList = ${JSON.stringify(songList)};`;

    fs.writeFile('songlist.js', jsCode, function(err) {
        if (err) {
            return console.error('Error writing song list:', err);
        }
        console.log('Song list generated successfully.');
    });
});