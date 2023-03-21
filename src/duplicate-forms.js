window.DuplicateWordsApp.WordFormsModule = function(dict) {
  "use strict";

  // выводит проблемные корни
  var getUnbreakableRoots = function(word) {
    var unbreakableWordRoots = [];
    var unbreakableRootMaxLength = 0;

    for (var r = dict.unbreakableRoots.length - 1; r >= 0; --r) {
      if (word.length < dict.unbreakableRoots[r].length) { 
        continue;
      }
      if (word.indexOf(dict.unbreakableRoots[r]) !== -1) {
        if (unbreakableRootMaxLength < dict.unbreakableRoots[r].length) {
          unbreakableRootMaxLength = dict.unbreakableRoots[r].length;
        }
        unbreakableWordRoots.push(dict.unbreakableRoots[r]);
      }
    }

    for (var r = unbreakableWordRoots.length - 1; r >= 0; --r) {
      if (unbreakableWordRoots[r].length < unbreakableRootMaxLength) {
        unbreakableWordRoots.splice(r, 1);
      }
    }

    return unbreakableWordRoots;
  };

  var hasUnbreakableRoots = function(wordChunk, unbreakableWordRoots) {
    for (var i = 0; i < unbreakableWordRoots.length; ++i) {
      if (wordChunk.indexOf(unbreakableWordRoots[i]) !== -1) {
        return true;
      }
    }
    return false;
  };

  var getAlternateRoot = function(wordRoot) {
    if (wordRoot.slice(-1) === 'ж') {
      return wordRoot.slice(0, -1) + 'г';
    }
    return null;
  };

  var wordFormsHandler = function(word) {
    if (dict.exceptions.indexOf(word) !== -1) {
      return [];
    }
    if (dict.immutableRoots.indexOf(word) !== -1 || dict.unbreakableRoots.indexOf(word) !== -1) { 
      return [word]; 
    }

    var wordForms = [word];
    var wordRoot = word; // корень без аффиксов
    var suffixedWordRoot = word; // корень с суффиксом (для расширенного сопоставления)
    var unbreakableWordRoots = getUnbreakableRoots(word); // список содержащихся проблемных корней

    // порядок отсечения аффиксов: тип + количество букв, которые должны остаться у корня
    // (отрицательное значение для приставок)
    var parseSequence = [
      [dict.endings, 2],
      [dict.suffixes, 2],
      [dict.suffixes, 3],
      [dict.prefixes, -3]
    ];

    // если слово длинное, нужно дополнительное отсечение суффиксов
    if (word.length > 12) {
      parseSequence.splice(2, 0, [dict.suffixes, 3]);
    }

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

          if (unbreakableWordRoots.length > 0 && !hasUnbreakableRoots(wordChunk, unbreakableWordRoots)) { 
            continue; // если часть корня пропадает при отсечении аффикса, то ищется другой
          }
          wordForms.push(wordChunk);
          wordRoot = wordChunk;
          if (p == 1) { suffixedWordRoot = wordRoot; }
          break;
        }
        else if (minRootSize < 0 && affixes[i] === wordRoot.slice(0, affixes[i].length)) {
          // отсечение приставок
          wordChunk = wordRoot.slice(affixes[i].length);
          if (unbreakableWordRoots.length > 0 && !hasUnbreakableRoots(wordChunk, unbreakableWordRoots)) { 
            continue; // если часть корня пропадает при отсечении аффикса, то ищется другой
          }
          wordForms.push(wordChunk);
          wordRoot = wordChunk;
          suffixedWordRoot = suffixedWordRoot.slice(affixes[i].length);
          wordForms.push(suffixedWordRoot);
          break;
        }
      }

      if (dict.unbreakableRoots.indexOf(wordRoot) !== -1) {
        break; 
      }
    }

    // для корней с чередующимися согласными
    var alternateWordRoot = getAlternateRoot(wordRoot);
    if (alternateWordRoot) {
      wordForms.push(alternateWordRoot);
    }

//console.log(wordForms);
    return wordForms;
  };

  return wordFormsHandler;
};
