window.addEventListener('load', function(event) {
  "use strict";

  var dictionary = DuplicateWordsApp.DictionaryModule('ru');
  var wordFormsHandler = DuplicateWordsApp.FormsModule(dictionary);
  var wordMatrix = DuplicateWordsApp.FinderModule(wordFormsHandler);

  var ui = document.forms.repetitions; // text, distance, delete, up
  ui.mock = document.querySelector('#mock');
  ui.indicator = document.querySelector('#indicator');
  ui.distance.value = 70; // расстояние между словами по умолчанию для поиска повторов

  ui.viewUpdate = function(event) {
    if (!event || event.type !== 'resize') {
      ui.text.togglePlaceholder();
    }
    ui.text.autoResize();
    ui.style.height = ui.text.scrollHeight;
  };

  ui.toggleState = function(state) {
    if (state === 'loading') {
      ui.submit.disabled = true;
      ui.distance.disabled = true;
      ui.delete.disabled = true;
    }
    else if (state === 'idle') {
      ui.submit.disabled = false;
      ui.distance.disabled = false;
      ui.delete.disabled = false;
    }
    if (ui.indicator.dataset && ui.indicator.dataset[state + 'Value']) {
      ui.indicator.innerHTML = ui.indicator.dataset[state + 'Value'];
    }
  };

  ui.text.togglePlaceholder = function() {
    if (ui.text.value === '') {
      if (ui.text.dataset && ui.text.dataset.placeholder) {
        ui.mock.innerHTML = ui.text.dataset.placeholder;
      }
    }
    else {
      ui.mock.innerHTML = ui.text.value;
    }
  };
  ui.text.autoResize = function() {
    this.style.overflowY = 'hidden';
    this.style.marginTop = this.scrollHeight + 'px'; 
    this.style.minHeight = 0;
    this.style.minHeight = this.scrollHeight + 'px'; 
    this.style.marginTop = 0;
  };
  ui.text.padLines = function() {
    this.value = this.value.replace(/\n+/g, "\n\n");
  };

  ui.submit.addEventListener('click', function(event) {
    event.preventDefault();
    ui.toggleState('loading');
    ui.text.padLines();
    setTimeout(function() {
      var text = ui.text.value;
      if (text !== '') { 
        var distance = parseInt(ui.distance.value);
        var exceptions = 'из, за, на, не, ни, по, бы, до, для, под'; // повторы, которые могут не учитываться
        wordMatrix.build(text, exceptions);
        var repetitions = wordMatrix.getRepetitions(distance);
        ui.mock.innerHTML = text.replace(/([А-ЯЁа-яёA-Za-z]+)/g, "<span>$1</span>");
        var nodeList = ui.mock.querySelectorAll('span');
        var highlightStyle = 0;
        var chainId = '';
        for(var r = 0; r < repetitions.length; ++r) {
          if (repetitions[r].length === 0) { continue; }
          ++highlightStyle;
          chainId = 'chain_' + repetitions[r].join('_'); // цепочка повторов
          for(var p = 0; p < repetitions[r].length; ++p) {
            if (nodeList.item(repetitions[r][p])) {
              nodeList.item(repetitions[r][p]).className = 'form-highlight ' + 
                'form-highlight' + (highlightStyle % 10) + ' ' +
                chainId;
            }
          }
        }
      }
      ui.toggleState('idle');
    }, 1);
    
  });

  ui.delete.addEventListener('click', function(event) {
    event.preventDefault();
    ui.text.value = '';
    ui.text.focus();
    ui.viewUpdate(event);
  });

  ui.up.addEventListener('click', function(event) {
    event.preventDefault();
    window.scrollTo(0, 0);
  });

  ui.text.addEventListener('paste', function(event) {
    setTimeout(function() {
      ui.text.padLines();
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

  ui.text.addEventListener('input', ui.viewUpdate);
  //ui.text.addEventListener('keyup', ui.viewUpdate);

  ui.viewUpdate();
  ui.toggleState('idle');
});
