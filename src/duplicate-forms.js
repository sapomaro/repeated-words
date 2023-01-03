window.DuplicateWordsApp.WordFormsModule = function(dict) {
  "use strict";

  var wordFormsHandler = function(word) {
    if (dict.exceptions.indexOf(word) !== -1) {
      return [];
    }

    var wordRoot = word; // корень без аффиксов
    var wordRootPrefixed = word; // корень с приставкой (для расширенного сопоставления)
    var wordRootSuffixed = word; // корень с суффиксом (для расширенного сопоставления)
    var wordRootMatched = false; // наличие проблемного корня

    if (dict.immutableRoots.indexOf(wordRoot) !== -1 || dict.unbreakableRoots.indexOf(wordRoot) !== -1) { 
      return [word, wordRoot, wordRootPrefixed, wordRootSuffixed]; 
    }

    for (var r = dict.unbreakableRoots.length - 1; r >= 0; --r) { // проверка на наличие проблемного корня
      if (word.length < dict.unbreakableRoots[r].length) { 
        continue; 
      }
      if (word.indexOf(dict.unbreakableRoots[r]) !== -1){
        wordRootMatched = dict.unbreakableRoots[r];
        break;
      }
    }

    // порядок отсечения аффиксов: тип + количество букв, которые должны остаться у корня
    // (отрицательное значение для приставок)
    var parseSequence = [
      [dict.endings, 2],
      [dict.suffixes, 2],
      [dict.suffixes, 3],
      [dict.prefixes, -3]
    ];

    for (var p = 0; p < parseSequence.length; ++p) { // отсечение аффиксов от слова
      var affixes = parseSequence[p][0]; 
      var minRootSize = parseSequence[p][1];
      var possibleAffixLength = wordRoot.length - Math.abs(minRootSize);
      var wordChunk = '';

      for (var i = affixes.length - 1; i >= 0; --i) {
        if (affixes[i].length > possibleAffixLength) {
          continue; 
        }
        if (minRootSize > 0 && affixes[i] === wordRoot.slice(affixes[i].length * -1)) {
          // отсечение суффиксов и окончаний
          wordChunk = wordRoot.slice(0, affixes[i].length * -1); // возвращает корень без аффикса

          if (wordRootMatched && wordChunk.indexOf(wordRootMatched) === -1) { 
            continue; // если часть корня пропадает при отсечении аффикса, то ищется другой
          }

          wordRoot = wordChunk;
          wordRootPrefixed = wordRoot;
          if (p == 1) { wordRootSuffixed = wordRoot; }
          break;
        }
        else if (minRootSize < 0 && affixes[i] === wordRoot.slice(0, affixes[i].length)) {
          // отсечение приставок
          wordChunk = wordRoot.slice(affixes[i].length);
          if (wordRootMatched && wordChunk.indexOf(wordRootMatched) === -1) { 
            continue; // если часть корня пропадает при отсечении аффикса, то ищется другой
          }
          wordRoot = wordChunk;
          wordRootSuffixed = wordRootSuffixed.slice(affixes[i].length);
          break;
        }
      }
      if (dict.unbreakableRoots.indexOf(wordRoot) !== -1) { 
        break; 
      }
    }

//console.log([word, wordRoot, wordRootPrefixed, wordRootSuffixed]); 

    return [word, wordRoot, wordRootPrefixed, wordRootSuffixed];
  };

  return wordFormsHandler;
};
