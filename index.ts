import fs from 'fs/promises';
import readline from 'readline';

function askUser(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function readAllSubfolders(dirPath: string, withoutArtistNFO = false): Promise<string[]> {
    try {
        const entries = await fs.readdir(dirPath, {withFileTypes: true});
        const folders = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);

        if (!withoutArtistNFO) {
            return folders;
        }

        const filteredFolders: string[] = [];
        for (const folder of folders) {
            const filePath = `${dirPath}/${folder}/artist.nfo`;
            try {
                await fs.access(filePath);
            } catch {
                filteredFolders.push(folder);
            }
        }

        return filteredFolders;
    } catch (error) {
        console.error(`Error reading directory: ${dirPath}`, error);
        return [];
    }
}

async function artistFileExists(folder: string): Promise<boolean> {
    const filePath = `${folder}/artist.nfo`;
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function createArtistFile(folder: string, artistData: any): Promise<void> {
    const filePath = `${folder}/artist.nfo`;

    const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<artist>
    <name>${artistData.strArtist || ''}</name>
    <sortname>${artistData.strSortName || ''}</sortname>
    <type>${artistData.strArtistType || ''}</type>
    <gender>${artistData.strGender || ''}</gender>
    <disambiguation>${artistData.strBiographyEN?.split('.')[0] || ''}</disambiguation>
    <genre>${artistData.strGenre || ''}</genre>
    <style>${artistData.strStyle || ''}</style>
    <mood>${artistData.strMood || ''}</mood>
    <yearsactive>${artistData.intFormedYear || ''}–${artistData.intDiedYear || artistData.intDisbanded || ''}</yearsactive>
    <born>${artistData.intBornYear || ''}</born>
    <formed>${artistData.intFormedYear || ''}</formed>
    <biography>${artistData.strBiographyEN || ''}</biography>
    <died>${artistData.intDiedYear || ''}</died>
    <disbanded>${artistData.intDisbanded || ''}</disbanded>
</artist>`;

    await fs.writeFile(filePath, xmlContent, 'utf-8');
    console.log(`✅ artist.nfo file created at: ${filePath}`);
}

async function fetchTheAudioDb(artistId: string, folderPath: string, artistFolderName: string): Promise<void> {
    const url = `https://www.theaudiodb.com/api/v1/json/2/artist.php?i=${artistId}`;

    try {
        console.log("⏳ Loading data from TheAudioDB...");
        await new Promise(resolve => setTimeout(resolve, 3000));

        const response = await fetch(url);
        const data = await response.json();

        const artist = data.artists?.[0];
        if (!artist) {
            console.warn('⚠️ No artist found with this ID.');
            return;
        }

        const artistName = artist.strArtist;
        console.log(`🎵 Found artist: ${artistName}`);

        const answer = await askUser(`Do you want to create/update artist.nfo for this artist? (y/n): `);
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('❌ Operation cancelled by user.');
            return;
        }

        const artistFolderPath = `${folderPath}/${artistFolderName}`;
        const fileExists = await artistFileExists(artistFolderPath);

        if (fileExists) {
            console.warn('⚠️ artist.nfo file already exists.');
            const existing = await fs.readFile(`${artistFolderPath}/artist.nfo`, 'utf-8');
            console.log('===========================\nExisting file:\n');
            console.log(existing);
            console.log('===========================');

            const overwrite = await askUser('Do you want to overwrite it? (y/n): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('⏩ Keeping existing file. Moving to next artist.');
                return;
            }
        }

        await createArtistFile(artistFolderPath, artist);

    } catch (error) {
        console.error('Error fetching data from TheAudioDB:', error);
    }
}

// RUN THE APP
(async () => {
    console.log(`📢 Welcome!

This program fetches artist data from TheAudioDB based on artist ID and creates a .nfo file following Kodi standards.

Given a root folder, the system will look at its subfolders as artist folders.

For example:
    /music/Abba/
    /music/Nirvana/

You should provide the path to the root folder (e.g. "/music"), and the script will process each subfolder.

⚠️ Please use TheAudioDB's free tier responsibly. If possible, support the TheAudioDB by subscribing to their Premium version.
`);

    const folderPath = await askUser('Enter the full path of the artist folders directory: ');

    const filterAnswer = await askUser('Do you want to skip folders that already have artist.nfo? (y/n): ');
    const withoutArtistNFO = filterAnswer.toLowerCase() === 'y' || filterAnswer.toLowerCase() === 'yes';

    console.log("🔎 Please wait, reading the sub-folders...");
    const artistFolders = await readAllSubfolders(folderPath, withoutArtistNFO);

    console.log('📁 Found folders:', artistFolders);
    console.log('🎯 Total folders to process:', artistFolders.length);

    for (const folderName of artistFolders) {
        const artistId = await askUser(`Enter TheAudioDB ID for artist "${folderName}": `);
        if (!artistId) {
            console.warn('⚠️ No ID entered. Skipping artist.');
            continue;
        }

        await fetchTheAudioDb(artistId, folderPath, folderName);
    }
})();
