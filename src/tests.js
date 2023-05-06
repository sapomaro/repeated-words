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

    // для неизменяемых слов и слов, которые состоят только из корня, форма должна быть одна
    expect(wordFormsHandler('никто')).toEqual(['никто']);
    expect(wordFormsHandler('доклад')).toEqual(['доклад']);

    // для обычных слов должно выдавать несколько словоформ: исходная, корень, корень с приставкой, корень с суффиксами (если их несколько)
    expect(wordFormsHandler('подоходный')).toEqual(['подоходный', 'подоходн', 'подоход', 'доход', 'доход']);
    expect(wordFormsHandler('прицелехонький')).toEqual(['прицелехонький', 'прицелехоньк', 'прицел', 'цел', 'цел']);
  });

  test('repeated word finder should parse text', function() {
    wordMatrix = DuplicateWordsApp.DuplicatesFinderModule(wordFormsHandler);

    expect(typeof wordMatrix).toBe('object');

    expect(wordMatrix.parseInputText('-Это рандомный текст!!11Всё.'))
      .toEqual(['это', 'рандомный', 'текст', 'все']);
  });

  test('repeated word finder should return repetition chains', function() {
    /*                  0   1       2            3        4     5     6       7    */
    wordMatrix.build('Текст с повторяющимися повторами повторов в текстовом тексте.');

    expect(wordMatrix.getRepetitions(50 /* search distance */)).toEqual([[0, 6, 7], [2, 3, 4]]);

    expect(wordMatrix.getRepetitions(5 /* search distance */)).toEqual([[2, 3, 4], [6, 7]]);
  });

  test('repeated word finder should return correct repetition chains in difficult cases', function() {
    /*                 0    1      2       3     4      5        6    */
    wordMatrix.build('вид видный видеть видение идея идейный идеология');

    expect(wordMatrix.getRepetitions(50 /* search distance */)).toEqual([[0, 1, 2, 3], [4, 5, 6]]);
  });

  test('repeated word finder should detect words with consonant alternation', function() {
    /*                   0     1        2           3      */
    wordMatrix.build('снежный снег опровергать опровержение');

    expect(wordMatrix.getRepetitions(50)).toEqual([[0, 1], [2, 3], null]);
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
      [0,30,39,43,44,53,57,59,60,79,123,127],
      null,
      null,
      null,
      null,
      [4,9,15,20,70,74,76,89,97,104,112,149,163,177,189,201,231,238,245,248,251,257,264],
      null,
      [7,11,33,42,49],
      null,
      null,
      [8,61],
      null,
      [14,73],
      null,
      [16,75],
      [19,37],
      [22,48],
      null,
      null,
      null,
      null,
      null,
      [64,65],
      [66,88,103],
      null,
      [82,84,129],
      null,
      null,
      null,
      [86,133,140,159,165,169],
      null,
      [87,93,134,156,185],
      null,
      null,
      null,
      [100,150],
      [102,109],
      [132,148,187],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [136,142],
      [138,158],
      null,
      null,
      null,
      null,
      [147,176],
      [152,178,190],
      null,
      null,
      [162,168],
      null,
      null,
      [202,218],
      null,
      null,
      null,
      null,
      [204,225],
      [205,214,223,234,239],
      null,
      null,
      null,
      null,
      [219,226],
      null,
      null,
      null,
      [220,227],
      [221,228],
      null,
      [230,235],
      null,
      null,
      null,
      [236,256],
      [247,258],
      null,
      [252,261],
      null,
      null,
      null
    ];

    wordMatrix.build(snapshotText);

    expect(wordMatrix.getRepetitions(70 /* search distance */)).toEqual(snapshotResult);
  });

  var ui;

  test('ui elements should be set', function() {
    ui = document.forms.repetitions; // text, distance, clear, up, summary
    ui.mock = document.querySelector('#mock');
    ui.indicator = document.querySelector('#indicator');
    ui.styles = document.querySelector('style');

    expect(ui).toBeTruthy();
    expect(ui.text).toBeTruthy();
    expect(ui.submit).toBeTruthy();
    expect(ui.distance).toBeTruthy();
    expect(ui.clear).toBeTruthy();
    expect(ui.up).toBeTruthy();
    expect(ui.summary).toBeTruthy();
    expect(ui.mock).toBeTruthy();
    expect(ui.indicator).toBeTruthy();
    expect(ui.styles).toBeTruthy();
  });

  test('ui elements should respond', function() {
    var event = new CustomEvent('click');
    var currentValue = ui.text.value;
    var testValue = 'тест тест';

    ui.text.value = testValue;
    ui.clear.dispatchEvent(event);
    expect(ui.text.value).toBe('');

    ui.clear.dispatchEvent(event);
    expect(ui.text.value).toBe(testValue);

    ui.text.value = currentValue;
    ui.text.update();
  });
});
