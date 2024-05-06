
const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/sophiafoster-dimino/Dropbox/github/hellophia/españolmix/letras'; // Change this to the path of your folder containing the .txt files

fs.readdir(directoryPath, function(err, files) {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    } 
	
	const txtFiles = files.filter(file => path.extname(file).toLowerCase() === '.txt');
	    const songlist = txtFiles.map(file => {
	        const filePath = path.join(directoryPath, file);
	        const fileContent = fs.readFileSync(filePath, 'utf8');
	        const [bandName, songName] = fileContent.split('\n').map(line => line.trim());
	        return { fileName: file, bandName, songName };
	    });
    
    const jsCode = `const songlist = ${JSON.stringify(songlist)};`;

    fs.writeFile('songlist.js', jsCode, function(err) {
        if (err) {
            return console.error('Error writing song list:', err);
        }
        console.log('Song list generated successfully.');
    });
});