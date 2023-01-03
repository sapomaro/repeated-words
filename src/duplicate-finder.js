window.DuplicateWordsApp.DuplicatesFinderModule = function(wordFormsHandler) {
  "use strict";

  var wordMatrix = {};

  wordMatrix.parseInputText = function(text) { // преобразует текст в упорядоченный массив
    return text.replace('ё', 'е')
      .split(/[^А-ЯЁа-яёA-Za-z]+/)
      .filter(String);
  };

  wordMatrix.build = function(text) {
    // создаёт матрицу возможных словоформ (слово целиком, корень слова, слово без приставки, слово без суффикса)
    var wordsArray = this.parseInputText(text);
    var word = '';
    var wordForms = [];
    this.matrix = {};

    for (var pos = 0; pos < wordsArray.length; ++pos) {
      pos = parseInt(pos);
      word = wordsArray[pos].toLowerCase();

      if (!word) { continue; }
      if (word.length < 2) { continue; }

      wordForms = wordFormsHandler(word); // word, wordRoot, wordRootSuffixed, wordRootPrefixed

      for (var f = 0; f < wordForms.length; ++f) {
        if (f > 0 && word === wordForms[f]) { continue; }

        if ('undefined' === typeof this.matrix[wordForms[f]]) {
          this.matrix[wordForms[f]] = [pos];

        } else if (this.matrix[wordForms[f]].indexOf(pos) === -1) {
          this.matrix[wordForms[f]].push(pos);
        }
      }
    }

    this.compareEach();
  };

  wordMatrix.compareEach = function() {
    // проходит по всей матрице словоформ (для слов длиной не менее 7 букв)
    // для применения дополнительных алгоритмов сравнения
    // раньше было 6 букв, но возникли коллизии (проверка-проведение)
    for (var word in this.matrix) {
      if (word.length < 7) { continue; }
      if (this.matrix.hasOwnProperty(word) === false) { continue; }
      for (var word2 in this.matrix) {
        if (word2.length < 7) { continue; }
        if (this.matrix.hasOwnProperty(word2) === false) { continue; }
        if (this.matrix[word] === this.matrix[word2]) { continue; }

        this.compareLastLetter(word, word2);
      }
    }
  };
  wordMatrix.compareLastLetter = function(word, word2) {
    if (word.length === word2.length 
      && word.slice(0, word.length - 1) === word2.slice(0, word2.length - 1)) {
      // поиск совпадений слов, у которых отличается только одна буква в конце
      var wordsMapChunk = this.matrix[word].concat(this.matrix[word2]);
      for (var pos = 0; pos < wordsMapChunk.length; ++pos) {
        wordsMapChunk[pos] = parseInt(wordsMapChunk[pos]);
        if (this.matrix[word].indexOf(wordsMapChunk[pos]) === -1) {
          this.matrix[word].push(wordsMapChunk[pos]);
        }
        if (this.matrix[word2].indexOf(wordsMapChunk[pos]) === -1) {
          this.matrix[word2].push(wordsMapChunk[pos]);
        }
      }
    }
  };

  wordMatrix.getRepetitions = function(searchDistance) {
    // поиск совпадений на заданном расстоянии
    if (!searchDistance) { searchDistance = 50; }
    var repetitions = [];
    var pairs = [];

    for (var word in this.matrix) {
      if (this.matrix.hasOwnProperty(word) === false) { continue; }
      if (this.matrix[word].length < 2) { continue; } // пролистываем словоформы, у которых нет совпадений
      var wordPos = this.matrix[word].sort(function(a, b) { return a - b; });
      for (var i = 1; i < wordPos.length; ++i) {
        var wordsDistance = wordPos[i] - wordPos[i - 1];
        if (wordsDistance > 0 && wordsDistance < searchDistance) {
          if (pairs.indexOf(wordPos[i - 1]) === -1) {
            pairs.push(wordPos[i - 1]);
          }
          pairs.push(wordPos[i]);
        }
        else if (pairs.length > 1) {
          repetitions.push(pairs); 
          pairs = [];
        }
      }
      if (pairs.length > 1) {
        repetitions.push(pairs); 
        pairs = [];
      }
    }

    return wordMatrix.reduceRepetitions(repetitions, searchDistance);
  };

  wordMatrix.reduceRepetitions = function(repetitions, searchDistance) {
    // соединяет повторы в цепочки, чтобы они отображались одним цветом
    repetitions = repetitions.sort(function(a, b) { return a[0] - b[0]; });
    for (var r = 0; r < repetitions.length; ++r) {
      if (repetitions[r].length === 0) { continue; }
      for (var rr = r + 1; rr < repetitions.length; ++rr) {
        if ((repetitions[rr][0] - repetitions[r][repetitions[r].length - 1]) > searchDistance) {
          break; // не листает дальше заданного расстояния между словами
        }
        var intersections = repetitions[r].filter(function(item) {
          return (repetitions[rr].indexOf(item) !== -1); // сравнение двух цепочек
        }); 
        if (intersections.length > 0) {
          repetitions[r] = repetitions[r].concat(repetitions[rr].filter(function(item) {
            return (repetitions[r].indexOf(item) < 0);
          })).sort(function(a, b) { return a - b; });
          repetitions[rr] = [];
        }
      }
    }
    return repetitions;
  };

  return wordMatrix;
};
