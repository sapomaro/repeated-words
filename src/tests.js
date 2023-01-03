window.addEventListener('load', function() {
  "use strict";

  function test(comment, callback) {
    try {
      callback();
      console.log('✔️ Test passed:', comment);
    }
    catch (error) {
      console.warn('❌ Test failed:', comment);
      console.debug(error);
    }
  }

  function expect(expectValue) {
    var assert = function(assertion, reversed) {
      return function(assertValue) {
        if ((reversed && assertion(assertValue)) || !assertion(assertValue)) {
          var values = '';
          if (typeof expectValue !== 'undefined' && typeof assertValue !== 'undefined') {
            values = expectValue + ' <> ' + assertValue;
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

    return {
      toBe: assert(toBe),
      toBeTruthy: assert(toBeTruthy),
      toBeFalsy: assert(toBeFalsy),
      not: {
        toBe: assertNot(toBe),
        toBeTruthy: assertNot(toBeTruthy),
        toBeFalsy: assertNot(toBeFalsy)
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
  });

  test('app should load all modules', function() {
    expect(typeof DuplicateWordsApp).toBe('object');
    expect(typeof DuplicateWordsApp.DictionaryModule).toBe('function');
    expect(typeof DuplicateWordsApp.WordFormsModule).toBe('function');
    expect(typeof DuplicateWordsApp.DuplicatesFinderModule).toBe('function');
  });

  test('dictionary should be set with RU lang', function() {
    var dict = DuplicateWordsApp.DictionaryModule('ru');

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
});
