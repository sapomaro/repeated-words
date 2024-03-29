window.addEventListener('load', function() {
  "use strict";

  var dict = DuplicateWordsApp.DictionaryModule('ru');
  var wordFormsHandler = DuplicateWordsApp.WordFormsModule(dict);
  var wordMatrix = DuplicateWordsApp.DuplicatesFinderModule(wordFormsHandler);

  var ui = document.forms.repetitions; // text, distance, clear, up, summary
  ui.mock = document.querySelector('#mock');
  ui.indicator = document.querySelector('#indicator');
  ui.distance.value = 70; // расстояние между словами по умолчанию для поиска повторов
  ui.styles = document.querySelector('style');

  ui.viewUpdate = function(event) {
    if (!event || event.type !== 'resize') {
      ui.text.update();
      ui.summary.update();
      ui.clear.update();
      ui.styles.innerHTML = '';
    }
    ui.autoResize(ui.text);
    ui.style.height = ui.text.scrollHeight;
  };

  ui.toggleState = function(state) {
    if (state === 'loading') {
      ui.submit.disabled = true;
      ui.distance.disabled = true;
      ui.clear.disabled = true;
    }
    else if (state === 'idle') {
      ui.submit.disabled = false;
      ui.distance.disabled = false;
      ui.clear.disabled = false;
    }
    ui.indicator.update(state);
  };

  ui.indicator.update = function(state) {
    if (ui.indicator.dataset && ui.indicator.dataset[state + 'Value']) {
      ui.indicator.innerHTML = ui.indicator.dataset[state + 'Value'];
    }
  };

  ui.summary.update = function(stat) {
    var summary = '';
    if (!stat) {
      summary += ''+
        'Цепочки повторов: -\n\n'+ 
        'Повторов всего: -\n\n'+ 
        'Время обработки: -\n';
    }
    else {
      summary += ''+
        'Цепочки повторов: ' + stat.chains +'\n\n'+ 
        'Повторов всего: ' + stat.duplicates +'\n\n'+ 
        'Время обработки: ' + stat.time + 'мс\n';
    }
    ui.summary.value = summary;
    ui.autoResize(ui.summary);
  };

  ui.text.update = function() {
    if (ui.text.value === '') {
      if (ui.text.dataset && ui.text.dataset.placeholder) {
        ui.mock.innerHTML = ui.text.dataset.placeholder;
      }
    }
    else {
      ui.mock.innerHTML = ui.text.value;
    }
  };
  ui.autoResize = function(elem) {
    elem.style.overflowY = 'hidden';
    elem.style.marginTop = elem.scrollHeight + 'px'; 
    elem.style.minHeight = 0;
    elem.style.minHeight = elem.scrollHeight + 'px'; 
    elem.style.marginTop = 0;
  };
  ui.text.format = function() {
    this.value = this.value
      .replace(/\u0301/g, '') // удаляет ударение
      .replace(/\n+/g, '\n\n');
  };

  ui.text.addEventListener('input', ui.viewUpdate);
  //ui.text.addEventListener('keyup', ui.viewUpdate);
  ui.text.addEventListener('mouseup', function() {
    var text = ui.text.value;
    if (text !== '' && typeof ui.text.selectionStart !== 'undefined') {
      var wordsArray = wordMatrix.parseInputText(text.slice(0, ui.text.selectionStart));
      var wordPos = wordsArray.length - 1;
      var nodeList = ui.mock.querySelectorAll('span');
      var node;
      if (node = nodeList.item(wordPos)) {
        if (ui.styles && node.className && window.getComputedStyle) {
          var chainClass = node.className.match(/chain_[0-9_]+/); // класс цепочки повторов
          var color = window.getComputedStyle(node).getPropertyValue('color');
          color = color.replace(/rgb\(([0-9, ]+)\)/, 'rgba($1, 0.3)');
          ui.styles.innerHTML = '.' + chainClass + '{ background:'+ color +'; }';
        }
      }
    }
  });
  ui.text.parentNode.addEventListener('click', function() {
    ui.text.focus();
  });

  ui.submit.addEventListener('click', function(event) {
    event.preventDefault();
    ui.toggleState('loading');
    ui.text.format();
    setTimeout(function() {
      var stat = {
        chains: 0,
        duplicates: 0,
        time: Date.now()
      };
      var text = ui.text.value;
      if (text !== '') {
        var distance = parseInt(ui.distance.value);
        wordMatrix.build(text);
        var duplicatesChains = wordMatrix.getRepetitions(distance);
        var chainHighlightStyle = 0;
        var chainClass = '';
        ui.mock.innerHTML = text.replace(/([А-ЯЁа-яёA-Za-z]+)/g, "<span>$1</span>");
        var nodeList = ui.mock.querySelectorAll('span');
        var node; 
        for(var r = 0; r < duplicatesChains.length; ++r) {
          if (duplicatesChains[r] === null) { continue; }
          ++chainHighlightStyle;
          chainClass = 'chain_' + duplicatesChains[r].join('_'); // класс цепочки повторов
          ++stat.chains;
          for(var p = 0; p < duplicatesChains[r].length; ++p) {
            if (node = nodeList.item(duplicatesChains[r][p])) {
              ++stat.duplicates;
              node.className = 'form-highlight ' + 
                'form-highlight' + (chainHighlightStyle % 10) + ' ' +
                chainClass;
            }
          }
        }
      }
      stat.time = Date.now() - stat.time;
      ui.summary.update(stat);
      ui.toggleState('idle');
    }, 1);
  });

  ui.clear.update = function() {
    var state = 'erase';
    if (ui.text.cachedContents) {
      state = 'restore';
    }
    if (ui.clear.dataset && ui.clear.dataset[state + 'Value']) {
      ui.clear.innerHTML = ui.clear.dataset[state + 'Value'];
    }
  };
  ui.text.addEventListener('input', function() {
    ui.text.cachedContents = '';
    ui.clear.update();
  });
  ui.clear.addEventListener('click', function(event) {
    event.preventDefault();
    if (ui.text.cachedContents) {
      ui.text.value = ui.text.cachedContents;
      ui.text.setSelectionRange(ui.text.cachedSelectionStart, ui.text.cachedSelectionEnd);
      ui.text.cachedContents = '';
    }
    else {
      ui.text.cachedContents = ui.text.value;
      ui.text.cachedSelectionStart = ui.text.selectionStart || 0;
      ui.text.cachedSelectionEnd = ui.text.selectionEnd || 0;
      ui.text.value = '';
    }
    ui.text.focus();
    ui.viewUpdate(event);
  });

  ui.up.addEventListener('click', function(event) {
    event.preventDefault();
    window.scrollTo(0, 0);
  });

  ui.text.addEventListener('paste', function(event) {
    setTimeout(function() {
      ui.text.format();
      ui.viewUpdate(event);
    }, 1);
  });

  var resizeTimer = null;
  window.addEventListener('resize', function(event) {
    if (resizeTimer) { return null; }
    resizeTimer = setTimeout(function() {
      ui.viewUpdate(event);
      resizeTimer = null;
    }, 100);
  });

  ui.viewUpdate();
  ui.toggleState('idle');
});
