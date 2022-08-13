

window.onload = function(event) {
	"use strict";
	
	var wordMatrix = LangToolsApp.RepeatedWordsModule.wordMatrix;
	
	var wordFormsHandler = LangToolsApp.RusWordFormsModule.wordFormsHandler;
	
	var loadIndicator = document.getElementById('load-indicator');
	var inputFieldset = document.getElementById('input-block');
	var inputTextarea = document.getElementById('input-edit');
	var inputViewarea = document.getElementById('input-view');
	var inputCheckButton = document.getElementById('input-check');
	var inputDistanceField = document.getElementById('input-distance');
	//var inputCheckButton2 = document.getElementById('input-check2');
	
	inputTextarea.inputAutoResize = function() {
		this.style.overflowY = 'hidden';
		this.style.marginTop = this.scrollHeight + 'px'; 
		this.style.minHeight = 0;
		this.style.minHeight = this.scrollHeight + 'px'; 
		this.style.marginTop = 0;
	};
	
	var inputUpdateHandler = function() {
		inputViewarea.innerHTML = inputTextarea.value;
		inputFieldset.style.height = inputTextarea.scrollHeight;
		inputTextarea.inputAutoResize();
	};
	
	var inputLinesHandler = function() {
		inputTextarea.value = inputTextarea.value.replace(/\n+/g, "\n\n");
	};
	
	
	inputUpdateHandler();
	inputTextarea.addEventListener('input', inputUpdateHandler);
	inputTextarea.addEventListener('keyup', inputUpdateHandler);
	
	inputTextarea.addEventListener('paste', function() {
		setTimeout(function() {
			inputLinesHandler();
			inputUpdateHandler();
		}, 1);
	});
	
	inputCheckButton.onclick = function() {
		
		/*
		var progress = 1;
		loadIndicator.style.width = '0';
		var loadInterval = setInterval(function () {
			loadIndicator.style.width = (++progress) + '%';
		}, 10);
		*/
		
		inputCheckButton.disabled = true;
		inputDistanceField.disabled = true;
		
		inputLinesHandler();
		
		setTimeout(function() {
			var text = inputTextarea.value;
			var distance = parseInt(inputDistanceField.value);
			wordMatrix.build(text, wordFormsHandler);
			
			var repetitions = wordMatrix.getRepetitions(distance);
			
			text = text.replace(/([А-ЯЁа-яёA-Za-z]+)/g, "<span>$1</span>");
			inputViewarea.innerHTML = text;

			var nodeList = document.querySelectorAll('#input-view > span');
			for(var i in repetitions) {
				if (nodeList[repetitions[i]]) {
					nodeList[repetitions[i]].className = "input-highlight";
				}
			}
			inputCheckButton.disabled = false;
			inputDistanceField.disabled = false;
			
			//clearInterval(loadInterval);
			
		}, 1);
		
	};
	
	//inputCheckButton2.onclick = inputCheckButton.onclick;
	
};
