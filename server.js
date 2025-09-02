const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import our filters
const {
  trigramFilter,
  dominantCharacterFilter,
  characterRepetitionFilter,
  wordToCharacterRatioFilter,
  dominantWordFilter,
  wordRepetitionFilter,
  purePunctuationFilter
} = require('./src/filters.js');

const PORT = process.env.PORT || 3000;

// Pre-initialize filters array to avoid repeated object creation
const FILTERS = [
  { name: 'Trigram Filter', func: trigramFilter },
  { name: 'Dominant Character Filter', func: dominantCharacterFilter },
  { name: 'Character Repetition Filter', func: characterRepetitionFilter },
  { name: 'Word to Character Ratio Filter', func: wordToCharacterRatioFilter },
  { name: 'Dominant Word Filter', func: dominantWordFilter },
  { name: 'Word Repetition Filter', func: wordRepetitionFilter },
  { name: 'Pure Punctuation Filter', func: purePunctuationFilter }
];

function testText(text) {
  const flaggedBy = [];
  
  for (const filter of FILTERS) {
    try {
      if (filter.func(text)) {
        let details = '';
        
        // Add specific details for certain filters
        switch (filter.name) {
          case 'Dominant Character Filter':
            const charCount = {};
            const totalChars = text.replace(/\s/g, '').length;
            for (const char of text.replace(/\s/g, '')) {
              charCount[char] = (charCount[char] || 0) + 1;
            }
            const maxCount = Math.max(...Object.values(charCount));
            const dominantChar = Object.keys(charCount).find(char => charCount[char] === maxCount);
            const percentage = (maxCount / totalChars) * 100;
            details = `'${dominantChar}' appears ${percentage.toFixed(1)}% of the time`;
            break;
            
          case 'Character Repetition Filter':
            let maxConsecutive = 1;
            let currentConsecutive = 1;
            let repeatedChar = text[0];
            for (let i = 1; i < text.length; i++) {
              if (text[i] === text[i-1]) {
                currentConsecutive++;
                if (currentConsecutive > maxConsecutive) {
                  maxConsecutive = currentConsecutive;
                  repeatedChar = text[i];
                }
              } else {
                currentConsecutive = 1;
              }
            }
            details = `'${repeatedChar}' repeated ${maxConsecutive} times consecutively`;
            break;
            
          case 'Word to Character Ratio Filter':
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            const avgWordLength = text.length / words.length;
            details = `Average word length: ${avgWordLength.toFixed(1)} characters`;
            break;
            
          case 'Word Repetition Filter':
            const wordArray = text.trim().split(/[\s.,!?;:"'()\[\]{}\-]+/).filter(word => word.length > 0);
            const lowerCaseWords = wordArray.map(word => word.toLowerCase());
            let maxConsecutiveCount = 1;
            let currentCount = 1;
            let currentWord = lowerCaseWords[0];
            let maxRepeatedWord = currentWord;
            
            for (let i = 1; i < lowerCaseWords.length; i++) {
              if (lowerCaseWords[i] === currentWord) {
                currentCount++;
                if (currentCount > maxConsecutiveCount) {
                  maxConsecutiveCount = currentCount;
                  maxRepeatedWord = currentWord;
                }
              } else {
                currentWord = lowerCaseWords[i];
                currentCount = 1;
              }
            }
            
            const repeatedWordCount = lowerCaseWords.filter(word => word === maxRepeatedWord).length;
            const percentageOfText = (repeatedWordCount / lowerCaseWords.length) * 100;
            details = `'${maxRepeatedWord}' repeated ${maxConsecutiveCount} times (${percentageOfText.toFixed(1)}% of text)`;
            break;
        }
        
        flaggedBy.push({
          name: filter.name,
          details: details
        });
      }
    } catch (error) {
      console.error(`Error in ${filter.name}:`, error);
    }
  }
  
  return {
    isNonsense: flaggedBy.length > 0,
    flaggedBy: flaggedBy
  };
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (ext) {
      case '.js':
        contentType = 'application/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
    }
    
    // Add caching headers for static files
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (pathname === '/' || pathname === '/index.html') {
    serveFile(path.join(__dirname, 'index.html'), res);
  } else if (pathname === '/api/test') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { text } = JSON.parse(body);
          const result = testText(text);
          
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache' // Don't cache API responses
          });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } else {
      res.writeHead(405);
      res.end('Method not allowed');
    }
  } else if (pathname === '/api/test-bulk') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { texts } = JSON.parse(body);
          
          if (!Array.isArray(texts)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Expected array of texts' }));
            return;
          }
          
          // Process all texts in parallel
          const results = texts.map(textObj => {
            try {
              const result = testText(textObj.text);
              return {
                text: textObj.text,
                rowNumber: textObj.rowNumber,
                isNonsense: result.isNonsense,
                flaggedBy: result.flaggedBy,
                error: null
              };
            } catch (error) {
              return {
                text: textObj.text,
                rowNumber: textObj.rowNumber,
                isNonsense: false,
                flaggedBy: [],
                error: 'Failed to test text'
              };
            }
          });
          
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          });
          res.end(JSON.stringify({ results }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } else {
      res.writeHead(405);
      res.end('Method not allowed');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Open your browser and navigate to the URL above to use the terminal interface.');
});
