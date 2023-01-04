window.addEventListener('load', function() {
  "use strict";

  function test(comment, callback) {
    try {
      var timestamp = Date.now();
      callback();
      console.log('✔️ Test passed:', comment, '(' + (Date.now() - timestamp) + 'ms)');
    }
    catch (error) {
      console.warn('❌ Test failed:', comment, '(' + (Date.now() - timestamp) + 'ms)');
      console.debug(error);
    }
  }

  function expect(expectValue) {
    var assert = function(assertion, reversed) {
      return function(assertValue) {
        if ((reversed && assertion(assertValue)) || !assertion(assertValue)) {
          var values = '';
          if (typeof expectValue !== 'undefined' && typeof assertValue !== 'undefined') {
            values = JSON.stringify(expectValue) + ' <> ' + JSON.stringify(assertValue);
          }
          throw new Error(assertion.name +' '+ values); 
        }
      };
    };

    var assertNot = function(assertion) {
      return assert.bind(this, assertion, true);
    };

    var toBe = function(resultValue) { return expectValue === resultValue; };
    var toBeTruthy = function() { return !!expectValue === true; };
    var toBeFalsy = function() { return !expectValue === true; };
    var toEqual = function(resultValue) { return JSON.stringify(expectValue) === JSON.stringify(resultValue); };

    return {
      toBe: assert(toBe),
      toBeTruthy: assert(toBeTruthy),
      toBeFalsy: assert(toBeFalsy),
      toEqual: assert(toEqual),
      not: {
        toBe: assertNot(toBe),
        toBeTruthy: assertNot(toBeTruthy),
        toBeFalsy: assertNot(toBeFalsy),
        toEqual: assertNot(toEqual)
      }
    };
  }

  test('app should test itself', function() {
    expect(true).toBe(true);
    expect(true).toBeTruthy();
    expect(true).not.toBeFalsy();
    expect(true).not.toBe(false);
    expect(false).toBeFalsy();
    expect(false).not.toBeTruthy();

    expect([1, 2, 3]).not.toBe([1, 2, 3]);
    expect([1, 2, 3]).toEqual([1, 2, 3]);
    expect({ test: 123 }).not.toBe({ test: 123 });
    expect({ test: 123 }).toEqual({ test: 123 });
  });

  test('app should load all modules', function() {
    expect(typeof DuplicateWordsApp).toBe('object');
    expect(typeof DuplicateWordsApp.DictionaryModule).toBe('function');
    expect(typeof DuplicateWordsApp.WordFormsModule).toBe('function');
    expect(typeof DuplicateWordsApp.DuplicatesFinderModule).toBe('function');
  });

  var dict, wordFormsHandler, wordMatrix;

  test('dictionary should be set with RU lang', function() {
    dict = DuplicateWordsApp.DictionaryModule('ru');

    expect(typeof dict.exceptions).toBe('string');

    expect(typeof dict.immutableRoots).toBe('string');

    expect(dict.unbreakableRoots instanceof Array).toBe(true);
    expect(dict.unbreakableRoots.length > 100).toBe(true);
    expect(dict.unbreakableRoots[0].length).toBe(3);

    expect(dict.prefixes instanceof Array).toBe(true);
    expect(dict.prefixes.length > 80).toBe(true);
    expect(dict.prefixes[0].length).toBe(1);

    expect(dict.suffixes instanceof Array).toBe(true);
    expect(dict.suffixes.length > 100).toBe(true);
    expect(dict.suffixes[0].length).toBe(1);

    expect(dict.endings instanceof Array).toBe(true);
    expect(dict.endings.length > 100).toBe(true);
    expect(dict.endings[0].length).toBe(1);
  });

  test('word forms module should generate word forms', function() {
    wordFormsHandler = DuplicateWordsApp.WordFormsModule(dict);

    expect(typeof wordFormsHandler).toBe('function');

    // для исключений не должно генерироровать словоформы
    expect(wordFormsHandler('не')).toEqual([]);
    expect(wordFormsHandler('для')).toEqual([]);

    // для неизменяемых слов и слов, которые состоят только из корня, формы должны быть одинаковые
    expect(wordFormsHandler('никто')).toEqual(['никто', 'никто', 'никто', 'никто']);
    expect(wordFormsHandler('доклад')).toEqual(['доклад', 'доклад', 'доклад', 'доклад']);

    // для обычных слов должно выдавать четыре словоформы: исходная, корень, корень с приставкой, корень с одним суффиксом (если их несколько)
    expect(wordFormsHandler('подоходный')).toEqual(['подоходный', 'доход', 'подоход', 'доход']);
    expect(wordFormsHandler('прицелехонький')).toEqual(['прицелехонький', 'цел', 'прицел', 'цел']);
  });

  test('repeated word finder should return repetition chains', function() {
    wordMatrix = DuplicateWordsApp.DuplicatesFinderModule(wordFormsHandler);

    expect(typeof wordMatrix).toBe('object');

    expect(wordMatrix.parseInputText('-Это рандомный текст!!11Всё.')).toEqual(['это', 'рандомный', 'текст', 'все']);

    expect(wordMatrix.build('Текст с повторяющимися повторами повторов в текстовом тексте.'))
      .toEqual({ 'текст': [0, 6, 7], 'повторяющимися': [2], 'повтор': [2, 3, 4], 'повторами': [3], 'повторов': [4], 'текстовом': [6], 'тексте': [7] });

    expect(wordMatrix.getRepetitions(50 /* search distance */)).toEqual([[0, 6, 7], [2, 3, 4]]);

    expect(wordMatrix.getRepetitions(5 /* search distance */)).toEqual([[2, 3, 4], [6, 7]]);
  });

  test('repeated word finder should pass snapshot test', function() {
    var snapshotText = '\
      Лингвистика (от лат. lingua «язык»), языкознание, языковедение — наука, изучающая язык[1]. Это наука о естественном человеческом языке вообще и обо всех языках мира как его индивидуализированных представителях.\
      В широком смысле слова лингвистика подразделяется на научную и практическую. Чаще всего под лингвистикой подразумевается именно научная лингвистика. Лингвистика связана с семиотикой как наукой о знаковых системах.\
      Лингвистикой профессионально занимаются учёные-лингвисты. \
      Предмет лингвистики\
      Лингвистика изучает не только существующие (существовавшие или возможные в будущем) языки, но и человеческий язык вообще. Язык не дан лингвисту в прямом наблюдении; непосредственно наблюдаемы лишь факты речи, или языковые явления, то есть речевые акты носителей живого языка вместе с их результатами (текстами) или языковой материал (ограниченное число письменных текстов на мёртвом языке, которым уже никто не пользуется в качестве основного средства общения).\
      Лингвистика в гносеологическом аспекте\
      Лингвистика включает наблюдение; регистрацию и описание фактов речи; выдвижение гипотез для объяснения этих фактов; формулировку гипотез в виде теорий и моделей, описывающих язык; их экспериментальную проверку и опровержение; прогнозирование речевого поведения. Объяснение фактов бывает внутренним (через языковые же факты) либо внешним (через факты физиологические, психологические, логические или социальные).\
      Кибернетические модели языка проверяются тем, насколько похоже они имитируют человеческую речь; адекватность описаний мёртвых языков проверяется в ходе раскопок, когда археологи обнаруживают новые тексты на древних языках.\
      Субъект и объект лингвистики\
      Как дисциплина, имеющая ряд принципиальных черт гуманитарных наук, лингвистика не всегда отделяет субъект познания (то есть психику лингвиста) от объекта познания (то есть от изучаемого языка), особенно если лингвист изучает свой родной язык. Лингвистами часто становятся люди, совмещающие тонкую языковую интуицию (чутьё языка) с обострённой языковой рефлексией (способностью задумываться над своим языковым чутьём). Опора на рефлексию для получения языковых данных называется интроспекцией.';

    var snapshotResult = [
      [0, 30, 39, 43, 44, 53, 57, 59, 60, 79, 123, 127],
      [],
      [],
      [],
      [4, 9, 15, 20, 70, 74, 76, 89, 97, 104, 112, 149, 163, 177, 189, 201, 231, 238, 245, 248, 251, 257, 264],
      [],
      [7, 11, 33, 42, 49],
      [],
      [8, 61],
      [14, 73],
      [16, 75],
      [19, 37],
      [22, 48],
      [],
      [],
      [],
      [],
      [64, 65],
      [66, 88, 103],
      [],
      [82, 84, 129],
      [],
      [],
      [],
      [86, 133, 140, 159, 165, 169],
      [87, 93, 134, 156, 185],
      [],
      [100, 150],
      [102, 109],
      [132, 148, 187],
      [],
      [],
      [],
      [],
      [],
      [136, 142],
      [138, 158],
      [],
      [],
      [],
      [147, 176],
      [162, 168],
      [],
      [],
      [178, 190],
      [],
      [202, 218],
      [],
      [],
      [],
      [204, 225],
      [205, 214, 223, 234, 239],
      [],
      [],
      [],
      [219, 226],
      [],
      [],
      [220, 227],
      [221, 228, 233],
      [],
      [230, 235],
      [236, 256],
      [],
      [247, 258],
      [252, 261],
      [],
      [],
      []
    ];

    wordMatrix.build(snapshotText);

    expect(wordMatrix.getRepetitions(70 /* search distance */)).toEqual(snapshotResult);
  });
});
