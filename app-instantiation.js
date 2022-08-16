window.addEventListener('load', function(event) {
	"use strict";
	
	var wordMatrix = LangToolsApp.RepeatedWordsModule.wordMatrix;
	
	var wordFormsHandler = LangToolsApp.RusWordFormsModule.wordFormsHandler;
	
	var ui = document.forms.repetitions;
	ui.indicator = document.querySelector('#form-indicator');
	
	
	
	ui.viewUpdate = function() {
		if (ui.edit.value === '') {
			ui.view.innerHTML = 'Вставьте сюда текст...';
		}
		else {
			ui.view.innerHTML = ui.edit.value;
		}
		ui.edit.autoResize();
		ui.style.height = ui.edit.scrollHeight;
	};
	ui.toggleButtons = function(state) {
		if (state === 0) {
			ui.indicator.innerHTML = '⌛';
			ui.submit.disabled = true;
			ui.distance.disabled = true;
		}
		else {
			ui.indicator.innerHTML = '⭾';
			ui.submit.disabled = false;
			ui.distance.disabled = false;
		}
	};
	
	ui.edit.autoResize = function() {
		this.style.overflowY = 'hidden';
		this.style.marginTop = this.scrollHeight + 'px'; 
		this.style.minHeight = 0;
		this.style.minHeight = this.scrollHeight + 'px'; 
		this.style.marginTop = 0;
	};
	ui.edit.alignLines = function() {
		this.value = this.value.replace(/\n+/g, "\n\n");
	};

	
	ui.edit.addEventListener('input', ui.viewUpdate);
	ui.edit.addEventListener('keyup', ui.viewUpdate);
	ui.viewUpdate();
	ui.toggleButtons(1);
	

	ui.edit.addEventListener('paste', function() {
		setTimeout(function() {
			ui.edit.alignLines();
			ui.viewUpdate();
		}, 1);
	});
	
	var resizeTimer = null;
	window.addEventListener('resize', function(event) {
		if (resizeTimer) { return null; }
		resizeTimer = setTimeout(function() {
			ui.viewUpdate();
			resizeTimer = null;
		}, 100);
	});
	
	
	ui.submit.addEventListener('click', function(event) {
		event.preventDefault();
		
		ui.toggleButtons(0);
		
		ui.edit.alignLines();
		
		setTimeout(function() {
			var text = ui.edit.value;
			if (text !== '') { 
				var distance = parseInt(ui.distance.value);
				wordMatrix.build(text, wordFormsHandler);
				
				var repetitions = wordMatrix.getRepetitions(distance);
				
				ui.view.innerHTML = text.replace(/([А-ЯЁа-яёA-Za-z]+)/g, "<span>$1</span>");

				var nodeList = ui.view.querySelectorAll('span');
				
				//alert(JSON.stringify(repetitions)); 
				
				var highlightStyle = 0;
				for(var r = 0; r < repetitions.length; ++r) {
					if (repetitions[r].length === 0) { continue; }
					++highlightStyle;
					for(var p = 0; p < repetitions[r].length; ++p) {
						if (nodeList.item(repetitions[r][p])) {
							nodeList.item(repetitions[r][p]).className = "form-view-highlight form-view-highlight" + (highlightStyle % 7);
						}
					}
				}
			}
			
			ui.toggleButtons(1);

			
		}, 1);
		
	});
	
	ui.up.addEventListener('click', function(event) {
		event.preventDefault();
		window.scrollTo(0, 0);
	});
	

	
});
