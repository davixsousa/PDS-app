import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// In-memory cache for Bible translations
const bibleCache: Record<string, any[]> = {};

async function getBibleData(version: string): Promise<any[]> {
  const v = version.toUpperCase();
  const cacheKey = (v === 'NTLH' || v === 'NTHL') ? 'NTLH' : 'NVI';
  if (bibleCache[cacheKey]) {
    return bibleCache[cacheKey];
  }

  let url = '';
  if (cacheKey === 'NTLH') {
    url = `https://cdn.jsdelivr.net/gh/mdeandrad/biblia-ntlh-json@master/ntlh.json`;
  } else {
    url = `https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/pt_nvi.json`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch Bible translation (${cacheKey}) from CDN: ${res.statusText}`);
    }
    const data = (await res.json()) as any[];
    bibleCache[cacheKey] = data;
    return data;
  } catch (error) {
    console.error(`Error loading Bible ${cacheKey}:`, error);
    return [];
  }
}

// Normalize helper to match book names robustly
function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route to fetch Bible chapters traditionally without AI
  app.get("/api/bible", async (req, res) => {
    const { book, chapter, version } = req.query;
    
    if (!book || !chapter || !version) {
      return res.status(400).json({ error: "Missing required parameters (book, chapter, version)." });
    }

    const requestedBookName = book as string;
    const requestedChapterNum = parseInt(chapter as string, 10);
    const requestedVersion = version as string;

    try {
      const bibleData = await getBibleData(requestedVersion);
      if (!bibleData || bibleData.length === 0) {
        throw new Error("Bible data not available");
      }

      // Find the book by matching normalized names
      const normalizedRequested = normalizeString(requestedBookName);
      const bookObj = bibleData.find(b => {
        return normalizeString(b.name) === normalizedRequested || normalizeString(b.abbrev) === normalizedRequested;
      });

      if (!bookObj) {
        console.warn(`Book not found: ${requestedBookName}`);
        return res.json({ verses: [] });
      }

      const chapterIndex = requestedChapterNum - 1;
      if (!bookObj.chapters || !bookObj.chapters[chapterIndex]) {
        console.warn(`Chapter not found: ${requestedChapterNum} in book ${requestedBookName}`);
        return res.json({ verses: [] });
      }

      const rawVerses: string[] = bookObj.chapters[chapterIndex];
      const verses = rawVerses.map((text, idx) => ({
        number: idx + 1,
        text: text.trim()
      }));

      res.json({ verses });
    } catch (error: any) {
      console.error("Erro ao buscar versículos:", error);
      res.status(500).json({ error: "Erro ao carregar versículos da Bíblia." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
