
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function countWords(text) {
  const words = text
    .toLowerCase()
    .match(/\b[\w']+\b/g) || [];
  return words.length;
}

function countCharacters(text) {
  return text.length;
}

function countCharactersWithoutSpaces(text) {
  return text.replace(/\s/g, "").length;
}

function countSentences(text) {
  const sentences = text.match(/[.!?]+/g) || [];
  return sentences.length;
}

function countParagraphs(text) {
  const paragraphs = text
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0);
  return paragraphs.length;
}

function getWordFrequency(text) {
  const words = text
    .toLowerCase()
    .match(/\b[\w']+\b/g) || [];
  const frequency = {};

  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
    }));
}

function getReadabilityScore(text) {
  const words = text.match(/\b[\w']+\b/g) || [];
  const sentences = text.match(/[.!?]+/g) || [];
  const syllableCount = countSyllables(text);

  if (words.length === 0 || sentences.length === 0) {
    return 0;
  }

  const flesch = Math.max(
    0,
    206.835 -
      1.015 * (words.length / sentences.length) -
      84.6 * (syllableCount / words.length),
  );

  return Math.round(flesch * 10) / 10;
}

function countSyllables(text) {
  const words = text
    .toLowerCase()
    .match(/\b[\w']+\b/g) || [];
  let syllableCount = 0;

  words.forEach((word) => {
    syllableCount += countWordSyllables(word);
  });

  return syllableCount;
}

function countWordSyllables(word) {
  word = word.toLowerCase();
  let count = 0;
  let previousWasVowel = false;

  const vowels = "aeiouy";

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }

  if (word.endsWith("e")) {
    count--;
  }

  if (word.endsWith("le")) {
    count++;
  }

  return Math.max(1, count);
}

function analyzeText(text) {
  const stats = {
    wordCount: countWords(text),
    characterCount: countCharacters(text),
    characterCountWithoutSpaces: countCharactersWithoutSpaces(text),
    sentenceCount: countSentences(text),
    paragraphCount: countParagraphs(text),
    averageWordLength: (
      countCharactersWithoutSpaces(text) / countWords(text)
    ).toFixed(2),
    averageWordsPerSentence: (
      countWords(text) / Math.max(1, countSentences(text))
    ).toFixed(2),
    readabilityScore: getReadabilityScore(text),
    topWords: getWordFrequency(text),
  };

  return stats;
}

function formatStats(stats) {
  let output = "\n=== ANÁLISIS DE TEXTO ===\n\n";
  output += `📊 ESTADÍSTICAS BÁSICAS:\n`;
  output += `   Palabras: ${stats.wordCount}\n`;
  output += `   Caracteres: ${stats.characterCount}\n`;
  output += `   Caracteres (sin espacios): ${stats.characterCountWithoutSpaces}\n`;
  output += `   Oraciones: ${stats.sentenceCount}\n`;
  output += `   Párrafos: ${stats.paragraphCount}\n`;
  output += `   Longitud promedio de palabra: ${stats.averageWordLength} caracteres\n`;
  output += `   Palabras promedio por oración: ${stats.averageWordsPerSentence}\n`;
  output += `   Puntuación de legibilidad (Flesch): ${stats.readabilityScore}\n\n`;

  output += `📈 TOP 10 PALABRAS MÁS FRECUENTES:\n`;
  stats.topWords.forEach((item, index) => {
    output += `   ${index + 1}. "${item.word}" - ${item.count} veces\n`;
  });

  return output;
}

async function getAIInsights(text, stats) {
  const prompt = `Analiza el siguiente texto y proporciona insights sobre su contenido, estructura y legibilidad.

Texto:
"${text}"

Estadísticas del análisis:
- Total de palabras: ${stats.wordCount}
- Total de caracteres: ${stats.characterCount}
- Número de oraciones: ${stats.sentenceCount}
- Número de párrafos: ${stats.paragraphCount}
- Puntuación de legibilidad (Flesch): ${stats.readabilityScore}
- Palabras más frecuentes: ${stats