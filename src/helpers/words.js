let blockedWordsRegex;

async function initializeBlockedWords() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/zacanger/profane-words/refs/heads/master/words.json");
    const blockedWords = await response.json();
    blockedWordsRegex = new RegExp(`\\b(${blockedWords.join("|")})\\b`, "gi");
    console.log("Blocked words list initialized.");
  } catch (error) {
    console.error("Failed to load blocked words list:", error);
  }
}

// Call this function when the application starts
initializeBlockedWords();

function replaceBlockedWords(text) {
  return text.replace(blockedWordsRegex, (match) => '*'.repeat(match.length));
}


export { replaceBlockedWords };