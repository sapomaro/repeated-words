"use strict";

window.onload = function(event) {
	
	var getRepetitions = LangToolsApp.repeatedWordsModule.getRepetitions;
	
	var inputFieldset = document.getElementById('input-block');
	var inputTextarea = document.getElementById('input-edit');
	var inputViewarea = document.getElementById('input-view');
	var inputCheckButton = document.getElementById('input-check');
	var inputCheckButton2 = document.getElementById('input-check2');
	
	inputTextarea.inputAutoResize = function() {
		this.style.overflowY = 'hidden';
		this.style.marginTop = this.scrollHeight + 'px'; 
		this.style.minHeight = 0;
		this.style.minHeight = this.scrollHeight + 'px'; 
		this.style.marginTop = 0;
	};
	
	var inputUpdateFunc = function() {
		inputViewarea.innerHTML = inputTextarea.value;
		inputFieldset.style.height = inputTextarea.scrollHeight;
		inputTextarea.inputAutoResize();
	};
	
	inputUpdateFunc();
	inputTextarea.addEventListener('input', inputUpdateFunc);
	inputTextarea.addEventListener('keyup', inputUpdateFunc);
	
	inputCheckButton.onclick = function() {
		var text = inputTextarea.value;
		var repetitions = getRepetitions(text, 30);
		text = text.replace(/([А-ЯЁа-яёA-Za-z]+)/g, "<span>$1</span>");
		inputViewarea.innerHTML = text;

		var nodeList = document.querySelectorAll('#input-view > span');
		for(var i in repetitions) {
			if (nodeList[repetitions[i]]) {
				nodeList[repetitions[i]].className = "input-highlight";
			}
		}
	};
	
	inputCheckButton2.onclick = inputCheckButton.onclick;
	
};
