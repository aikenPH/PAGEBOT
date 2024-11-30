const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const token = fs.readFileSync('token.txt', 'utf8');
let cachedChapters = []; // Stores the chapters after a search

// Function to search for a manga by title
const searchMangaByTitle = async (title) => {
  try {
    const response = await axios.get('https://api.mangadex.org/manga', {
      params: { title, limit: 5 },
    });
    return response.data.data.map((manga) => ({
      id: manga.id,
      title: manga.attributes.title.en || 'No title',
    }));
  } catch (error) {
    console.error('Error while searching for manga:', error.message);
    throw new Error('Could not find manga matching this title.');
  }
};

// Function to get manga chapters
const getMangaChapters = async (mangaId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
      params: { limit: 5, translatedLanguage: ['en'] },
    });
    return response.data.data.map((chapter) => ({
      id: chapter.id,
      title: chapter.attributes.title || 'No title',
      chapterNumber: chapter.attributes.chapter || 'Unknown',
    }));
  } catch (error) {
    console.error('Error while fetching chapters:', error.message);
    throw new Error('Could not retrieve manga chapters.');
  }
};

// Function to get chapter images' URLs
const getMangaChapterImages = async (chapterId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = response.data;

    return chapter.data.map((fileName) => `${baseUrl}/data/${chapter.hash}/${fileName}`);
  } catch (error) {
    console.error('Error while retrieving chapter images:', error.message);
    throw new Error('Could not retrieve chapter images.');
  }
};

module.exports = {
  name: 'manga',
  description: 'Search and read manga',
  author: 'Jay Mar',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (args.length === 0) {
      await sendMessage(
        senderId,
        { text: 'Usage: `!manga <title>` to search for a manga or `!manga read <chapter number>` to read a chapter.' },
        pageAccessToken
      );
      return;
    }

    const command = args[0].toLowerCase();

    if (command === 'read') {
      const chapterIndex = parseInt(args[1], 10) - 1;

      if (isNaN(chapterIndex) || chapterIndex < 0 || chapterIndex >= cachedChapters.length) {
        await sendMessage(
          senderId,
          { text: 'Please enter a valid chapter number from the listed chapters.' },
          pageAccessToken
        );
        return;
      }

      const chapterId = cachedChapters[chapterIndex].id;

      try {
        const imageUrls = await getMangaChapterImages(chapterId);

        for (const url of imageUrls) {
          try {
            console.log(`Sending image: ${url}`);
            await sendMessage(
              senderId,
              {
                attachment: {
                  type: 'image',
                  payload: { url },
                },
              },
              pageAccessToken
            );
          } catch (error) {
            console.error(`Error sending image (${url}):`, error.message);
          }
        }

        await sendMessage(
          senderId,
          { text: 'Chapter sent successfully!' },
          pageAccessToken
        );
      } catch (error) {
        console.error('Error in the manga read command:', error.message);
        await sendMessage(
          senderId,
          { text: 'An error occurred while fetching the chapter.' },
          pageAccessToken
        );
      }
    } else {
      // Search for a manga by title and list its chapters
      const title = args.join(' ');

      try {
        const mangas = await searchMangaByTitle(title);

        if (mangas.length === 0) {
          await sendMessage(
            senderId,
            { text: `No manga found for the title "${title}".` },
            pageAccessToken
          );
          return;
        }

        const manga = mangas[0]; // Take the first result
        const chapters = await getMangaChapters(manga.id);

        cachedChapters = chapters; // Store the chapters in cache

        const chapterList = chapters
          .map((ch, index) => `${index + 1}. Chapter ${ch.chapterNumber} - ${ch.title}`)
          .join('\n');

        await sendMessage(
          senderId,
          { text: `Manga found: ${manga.title}\n\nAvailable chapters:\n${chapterList}\n\nSend \`!manga read <number>\` to read a chapter.` },
          pageAccessToken
        );
      } catch (error) {
        console.error('Error in the manga command:', error.message);
        await sendMessage(
          senderId,
          { text: 'Could not retrieve chapters for this manga.' },
          pageAccessToken
        );
      }
    }
  },
};
        
