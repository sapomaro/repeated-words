
window.LangToolsApp = {}; 

window.LangToolsApp.RusWordFormsModule = (function() {
	"use strict";
	
	var parseMorphemes = function(line) { // преобразует части слов в упорядоченный массив
		return line.replace('ё', 'е')
			.split(/[^А-ЯЁа-яё]+/)
			.sort(function(a, b) { return b.length - a.length; });
	};

	var prefixes = parseMorphemes(
		'в-, во-, взо-, вне-, внутри-, возо-, вы-, до-, еже-, за-, зако-,'+
		'изо-, испод-, к-, кое-, ку-, меж-, междо-, между-, на-, над-, надо-, '+
		'наи-, не-, недо-, ни-, низо-, о-, об-, обо-, около-, от-, ото-, па-, '+
		'пере-, по-, под-, подо-, поза-, после-, пра-, пред-, преди-, предо-, про-,'+
		'противо-, разо-, с-, со-, сверх-, среди-, су-, тре-, у-, без-, бес-, вз-,'+
		'вс-, воз-, вос-, из-, ис-, низ-, нис-, обез-, обес-, раз-, рас-, роз-, рос-,'+
		'через-, черес-, чрез-, чрес-, пре-, при-, зло-, взаимо-, псевдо-, анти-, гео-,'+
		'везде-, много-, одно-, неодно-, дву-, двух'
	);
	var suffixes = parseMorphemes( 
		'-айш-, -е-, -ее-, -ей-, -ейш-, -же-, -ше-, -л-, -ел-, -ти, -ть, -и, -ащ-,'+
		'-ящ-, -вш-, -ш-, -ущ-, -ющ-, -ем-, -им-, -ом-, -нн-, -енн-, -онн-, -т-, -ить, -а-, -я-,'+
		'-учи-, -ючи-, -вши-, -ши-, -ес-, -ен-, -ер-, -й-, -ейш-, -айш-, -к-, -ик-, '+
		'-ек-, -ок-, -чик, -ёк-, -еньк-, -оньк-, -ечк-, -ичк-, -ич-, -очк-, -ашк-, -ашн-, -ишк-, -ашек-'+
		'-ушк-, -юшк-, -ышк-, -ец-, -иц-, -енк-, -инк-, -онк-, -ин-, -ищ-, -ушек, -ышек,'+
		'-ёныш, -еньк-, -оньк-, -ехоньк-, -оханьк-, -ёшеньк-, -ошеньк-, -ущ-, -ющ-, '+
		'-юсеньк-, -енн-, -оват-, -еньк-, -оньк-, -енечко, -онечко, -еват, -оват, -тель, '+
		'-чик, -щик, -ник, -ир, -ниц-, -к-, -иц-, -юх, -ёнок, -ушк-, -ышк-, -ость, -ост-, -як, -ун, -ач, '+
		'-ущ-, -ив-, -ивн-, -чив-, -лив-, -ист-, -ск-, -еск-, -ов-, -ев-, -н-, -евит-, -ин-, -ова-, -ева-, '+
		'-ыва-, -и-, -я-, -е-, -а-, -а, -о, -у, -ийск-, -ств-, -еств, -арн-, -арик, -ац-, -ь'+
		'-лог'
	); // , -ход
	var endings = parseMorphemes( 
		'-а, -ам, -ами, -ас, -ах, -ая, -е, -её, -ей, -ем, -еми, -емя,'+
		'-ех, -ею, -ёт, -ёте, -ёх, -ёшь, -и, -ие, -ий, -ия, -им, -ими, -ит,'+
		'-ите, -их, -ишь, -ию, -м, -ми, -мя, -о, -ов, -ого, -ое, -оё,'+
		'-ой, -ом, -ому, -ою, -у, -ум, -умя, -ут, -ух, -ую, -шь, -ый, -ые'+
		'-а, -я, -ы, -и, -ов, -ей, -е, -ам, -ям, -у, -ю,'+ // сущ. и.м.-в.п.
		'-ой, -ёй, -ами, -ями, -ом, -ем, -ём, -ах, -ях,'+ // сущ. т.п.-п.п.
		'-у, -ю, -ешь, -ет, -ем, -ете, -ут, -ют, -ишь, -ит, -им, -ите, -ат, -ят,'+ // гл. 1/2 спряж.
		'-ый, -ий, -ая, -яя, -ое, -ее, -ые, -ие, -ого, -его, -ой, -ей, -ых, -их,'+ // прил. им./род.п.
		'-ому, -ему, -ой, -ей, -ым, -им, -ую, -юю, -ыми, -ими, -ом, -ем' // прил. дат./вин./твор.п.
	); 
	var unbreakableRoots = parseMorphemes( // проблемные корни, которые могут быть неверно разбиты
		'вид, вред, вер, вечер, власт, век, вод, вопрос, войн, втор, '+
		'газон, дел, доход, доступ, закон, запад, истор, '+
		'крат, крыл, мыш, начал, начин, недел, '+
		'област, образ, остров, '+
		'пут, пора, получ, полн, прав, правл, правил, проект, прост, постав, '+
		'процесс, преступ, планет, полит, послед, продолж, долж, '+
		'развит, '+
		'сид, свиде, след, слов, случ, стран, сил, систем, средств, стол, столиц, сведен, '+ 
		'сторон, связ, ситуац, союз, совет, стат, суверен, содерж, соверш, свет, '+
		'тиш, '+
		'услов, участ, уваж, уступ, улиц, указ, формул'
	); 
	
	// спорные случаи: последний - последствия
	
	var immutableRoots = 'пока, там, так, как, что, раз, вне, при';
	
	var wordFormsHandler = function(word) {
		var wordRoot = word; // корень без аффиксов
		var wordRootPrefixed = word; // корень с приставкой (для расширенного сопоставления)
		var wordRootSuffixed = word; // корень с суффиксом (для расширенного сопоставления)
		var wordRootMatched = false; // наличие проблемного корня
		
		if (immutableRoots.indexOf(wordRoot) !== -1 || unbreakableRoots.indexOf(wordRoot) !== -1) { 
			return [word, wordRoot, wordRootPrefixed, wordRootSuffixed]; 
		}
		
		for (var r = 0; r < unbreakableRoots.length; ++r) { // проверка на наличие проблемного корня
			if (word.length < unbreakableRoots[r].length) { continue; }
			if (word.indexOf(unbreakableRoots[r]) !== -1){
				wordRootMatched = unbreakableRoots[r];
				break;
			}
		}
		
		var parseSequence = [[endings, 2], [suffixes, 2], [suffixes, 3], [prefixes, -3]];
		// порядок отсечения аффиксов: тип + количество букв, которые должны остаться у корня
		// (отрицательное значение для приставок)

		for (var p = 0; p < parseSequence.length; ++p) { // отсечение аффиксов от слова

			var affixes = parseSequence[p][0]; 
			var minRootSize = parseSequence[p][1];
			var possibleAffixLength = wordRoot.length - Math.abs(minRootSize);
			var wordChunk = '';
			
			for (var i = 0; i < affixes.length; ++i) {
				if (affixes[i].length > possibleAffixLength) { continue; }
				if (minRootSize > 0 && affixes[i] === wordRoot.slice(affixes[i].length * -1)) {
					// отсечение суффиксов и окончаний
					wordChunk = wordRoot.slice(0, affixes[i].length * -1); // возвращает корень без аффикса
					if (wordRootMatched && wordChunk.indexOf(wordRootMatched) === -1) { 
						continue; // если часть корня пропадает при отсечении аффикса, то ищется другой
					}
					wordRoot = wordChunk;
					wordRootPrefixed = wordRoot;
					if (p == 1) { wordRootSuffixed = wordRoot; }
					break;
				}
				else if (minRootSize < 0 && affixes[i] === wordRoot.slice(0, affixes[i].length)) {
					// отсечение приставок
					wordRoot = wordRoot.slice(affixes[i].length);
					wordRootSuffixed = wordRootSuffixed.slice(affixes[i].length);
					break;
				}
			}
			if (unbreakableRoots.indexOf(wordRoot) !== -1) { 
				break; 
			}
		}
		return [word, wordRoot, wordRootPrefixed, wordRootSuffixed];
	};
	
	
	return { wordFormsHandler: wordFormsHandler };
})();


window.LangToolsApp.RepeatedWordsModule = (function() { 
	"use strict";
	
	var exceptions = 'из, за, на, не, ни, по, бы, до, для, под'; // повторы, которые могут не учитываться
	
	var wordMatrix = {};
	
	wordMatrix.parseInputText = function(text) { // преобразует текст в упорядоченный массив
		return text.replace('ё', 'е')
			.split(/[^А-ЯЁа-яёA-Za-z]+/)
			.filter(String);
	};
		
	wordMatrix.build = function(text, wordFormsHandler) {
		var wordsArray = this.parseInputText(text);
		var word = '';
		var wordForms = [];
		
		this.matrix = {};
		
		for (var pos = 0; pos < wordsArray.length; ++pos) { 
			pos = parseInt(pos);
			word = wordsArray[pos].toLowerCase();
			
			if (!word) { continue; }
			if (word.length < 2) { continue; }
			if (exceptions.indexOf(word) !== -1) { continue; }			
			
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
		
		this.interlink();
	};
	
	
	wordMatrix.interlink = function() {
		for (var word in this.matrix) {
			if (word.length < 6) { continue; }
			if (this.matrix.hasOwnProperty(word) === false) { continue; }
			for (var word2 in this.matrix) {
				if (word2.length < 6) { continue; }
				if (this.matrix.hasOwnProperty(word2) === false) { continue; }
				if (this.matrix[word] === this.matrix[word2]) { continue; }
				
				if (word.length === word2.length) { 
					if (word.slice(0, word.length - 1) === word2.slice(0, word2.length - 1)) {
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
				}
			}
		}
	};
	
	
	wordMatrix.getRepetitions = function(searchDistance) {
		if (!searchDistance) { searchDistance = 50; }
		
		var repeatedWordsPos = [];
		for (var word in this.matrix) {
			if (this.matrix.hasOwnProperty(word) === false) { continue; }
			if (this.matrix[word].length < 2) { continue; } // пролистываем словоформы, у которых нет совпадений
			
			var wordPos = this.matrix[word].sort(function(a, b) { return a - b; });

			for (var i = 1; i < wordPos.length; ++i) {
				var wordsDistance = wordPos[i] - wordPos[i - 1];
				// поиск совпадений на заданном расстоянии
				if (wordsDistance > 0 && wordsDistance < searchDistance) { 
					if (repeatedWordsPos.indexOf(wordPos[i - 1]) === -1) {
						repeatedWordsPos.push(wordPos[i - 1]);
					}
					repeatedWordsPos.push(wordPos[i]);
				}
			}
		}
		return repeatedWordsPos;
		
	};
	
	return { wordMatrix: wordMatrix };
	
})();
