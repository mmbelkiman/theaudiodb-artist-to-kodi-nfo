# theaudiodb-artist-to-kodi-nfo

📦 A simple Node.js script to fetch artist data from [TheAudioDB](https://www.theaudiodb.com) and generate `.nfo` files compatible with Kodi.

This program does not have a graphical interface; it runs exclusively in the command line.
You must have Node.js properly installed and configured in your environment to execute it.
It should work on any operating system, as long as you run it locally.

---

## 📖 About

Given a root folder, the system will treat its subfolders as individual artist folders.

Example:

```
/music/Abba/
/music/Nirvana/
```

```
/music/
├── Abba/
│   └── (will create artist.nfo here)
├── Nirvana/
│   └── (will create artist.nfo here)
```

You should provide the path to the root folder (e.g. `/music`), and the script will process each subfolder individually.

After that, the system will prompt you to manually enter the artist ID for each folder.  
This program is **not fully automated** — it’s designed to be a **manual tool**.  
If you're looking to process **many artists at once**, this tool may not be the ideal choice.

---

## ✨ How It Works

- Prompts for TheAudioDB artist ID manually.
- Option to process only folders without existing `artist.nfo` files.
- Waits 3 seconds before each request to avoid overloading TheAudioDB.
- Generates clean `.nfo` files compatible with Kodi.
- Interactive terminal with overwrite protection for existing files.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone 
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the script

```bash
npm start
```

---

## 🔍 How to Get the Artist ID

1. Go to [TheAudioDB](https://www.theaudiodb.com/) website
2. Use the search bar to find the artist you’re looking for.
3. Click on the correct artist from the search results.
4. Look at the URL — it will look like this:
    https://www.theaudiodb.com/artist/123456-ArtistName
5. You only need the numeric ID at the end of the URL (in this example, 123456).

## 🛠 Built With

- Node.js
- TypeScript (not fully typed)
- Native modules: `fs`, `readline`, and `fetch`

---

## 🙏 Usage Notice

⚠️ **Please use TheAudioDB's free tier responsibly.**  
If possible, support the project by subscribing to their [Premium version](https://www.theaudiodb.com/api_guide.php).  
There are more efficient scraping and automation options available through their Premium API.

---
