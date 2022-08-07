"use strict";


window.LangToolsApp = {}; 

window.LangToolsApp.repeatedWordsModule = (function() { 
	
	var prefixes = 'в-, во-, взо-, вне-, внутри-, возо-, вы-, до-, еже-, за-, зако-,'+
		'изо-, испод-, к-, кое-, ку-, меж-, междо-, между-, на-, над-, надо-, '+
		'наи-, не-, недо-, ни-, низо-, о-, об-, обо-, около-, от-, ото-, па-, '+
		'пере-, по-, под-, подо-, поза-, после-, пра-, пред-, преди-, предо-, про-,'+
		'противо-, разо-, с-, со-, сверх-, среди-, су-, тре-, у-, без-, бес-, вз-,'+
		'вс-, воз-, вос-, из-, ис-, низ-, нис-, обез-, обес-, раз-, рас-, роз-, рос-,'+
		'через-, черес-, чрез-, чрес-, пре-, при-, зло-, взаимо-, псевдо-, анти-, гео-,'+
		'везде-, много-, одно-, неодно-, дву-, двух';
	var suffixes = '-айш-, -е-, -ее-, -ей-, -ейш-, -же-, -ше-, -л-, -ел-, -ти, -ть, -и, -ащ-,'+
		'-ящ-, -вш-, -ш-, -ущ-, -ющ-, -ем-, -им-, -ом-, -нн-, -енн-, -онн-, -т-, -ить, -а-, -я-,'+
		'-учи-, -ючи-, -вши-, -ши-, -ес-, -ен-, -ер-, -й-, -ейш-, -айш-, -к-, -ик-, '+
		'-ек-, -ок-, -чик, -ёк-, -еньк-, -оньк-, -ечк-, -ичк-, -ич-, -очк-, -ашк-, -ашн-, -ишк-, -ашек-'+
		'-ушк-, -юшк-, -ышк-, -ец-, -иц-, -енк-, -инк-, -онк-, -ин-, -ищ-, -ушек, -ышек,'+
		'-ёныш, -еньк-, -оньк-, -ехоньк-, -оханьк-, -ёшеньк-, -ошеньк-, -ущ-, -ющ-, '+
		'-юсеньк-, -енн-, -оват-, -еньк-, -оньк-, -енечко, -онечко, -еват, -оват, -тель, '+
		'-чик, -щик, -ник, -ир, -ниц-, -к-, -иц-, -юх, -ёнок, -ушк-, -ышк-, -ость, -ост-, -як, -ун, -ач, '+
		'-ущ-, -ив-, -ивн-, -чив-, -лив-, -ист-, -ск-, -еск-, -ов-, -ев-, -н-, -евит-, -ин-, -ова-, -ева-, '+
		'-ыва-, -и-, -я-, -е-, -а-, -а, -о, -у, -ийск-, -ств-, -еств, -арн-, -арик, -ац-, -ь'+
		'-лог'; // , -ход
	var endings = '-а, -ам, -ами, -ас, -ах, -ая, -е, -её, -ей, -ем, -еми, -емя,'+
		'-ех, -ею, -ёт, -ёте, -ёх, -ёшь, -и, -ие, -ий, -ия, -им, -ими, -ит,'+
		'-ите, -их, -ишь, -ию, -м, -ми, -мя, -о, -ов, -ого, -ое, -оё,'+
		'-ой, -ом, -ому, -ою, -у, -ум, -умя, -ут, -ух, -ую, -шь, -ый, -ые'+
		'-а, -я, -ы, -и, -ов, -ей, -е, -ам, -ям, -у, -ю,'+ // сущ. и.м.-в.п.
		'-ой, -ёй, -ами, -ями, -ом, -ем, -ём, -ах, -ях,'+ // сущ. т.п.-п.п.
		'-у, -ю, -ешь, -ет, -ем, -ете, -ут, -ют, -ишь, -ит, -им, -ите, -ат, -ят,'+ // гл. 1/2 спряж.
		'-ый, -ий, -ая, -яя, -ое, -ее, -ые, -ие, -ого, -его, -ой, -ей, -ых, -их,'+ // прил. им./род.п.
		'-ому, -ему, -ой, -ей, -ым, -им, -ую, -юю, -ыми, -ими, -ом, -ем'; // прил. дат./вин./твор.п.
	var roots = 'сид, вид, свиде, дел, слов,'+ // проблемные корни, которые могут быть неверно разбиты
		'случ, вопрос, стран, сил, систем, вод, образ, истор, власт, союз, совет,'+
		'войн, стол, столиц, област, стат, закон, развит, средств, процесс,'+
		'услов, начал, свет, пора, связ, улиц, вечер, век, ситуац, планет, полит,'+
		'доступ, преступ, вред, участ, уваж, уступ, газон, мыш, тиш, пут, соверш,'+
		'вер, прав, правл, правил, доход, сторон, втор, остров, проект, недел, крат'+
		'прост, крат, содерж, постав, сведен, суверен, указ'; 
	var immutableWords = 'пока, там, так, как, что, раз, вне, при';
	
	var exceptions = 'из, за, на, не, ни, по, бы, до, для'; // повторы, которые могут не учитываться
	
	var parseMorphemes = function(line) { // преобразует части слов в упорядоченный массив
		return line.replace('ё', 'е')
			.split(/[^А-ЯЁа-яё]+/)
			.sort(function(a, b) { return b.length - a.length; });
	};
	
	
	prefixes = parseMorphemes(prefixes);
	suffixes = parseMorphemes(suffixes);
	endings = parseMorphemes(endings);
	roots = parseMorphemes(roots);
	
	
	var getWordRoot = function(word) { // поиск корня слова
		var wordRoot = word; // корень без аффиксов
		var wordRootPrefixed = word; // корень с приставкой (для расширенного сопоставления)
		var wordRootSuffixed = word; // корень с суффиксом (для расширенного сопоставления)
		var wordRootMatched = false; // наличие проблемного корня
		
		if (immutableWords.indexOf(wordRoot) !== -1) { return [wordRoot, wordRootPrefixed, wordRootSuffixed]; }
		if (roots.indexOf(wordRoot) !== -1) { return [wordRoot, wordRootPrefixed, wordRootSuffixed]; }
		
		for (var r in roots) { // проверка на наличие проблемного корня
			if (word.length < roots[r].length) { continue; }
			if (word.indexOf(roots[r]) !== -1){
				wordRootMatched = roots[r];
				break;
			}
		}
		
		var parseSequence = [[endings, 2], [suffixes, 2], [suffixes, 3], [prefixes, -3]];
		// порядок отсечения аффиксов: тип + количество букв, которые должны остаться у корня
		// (отрицательное значение для приставок)
		
		for (var p in parseSequence) { // отсечение аффиксов от слова
			var affixes = parseSequence[p][0]; 
			var minRootSize = parseSequence[p][1];
			var possibleAffixLength = wordRoot.length - Math.abs(minRootSize);
			var wordChunk = '';
			
			for (var i in affixes) {
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
			if (roots.indexOf(wordRoot) !== -1) { 
				break; 
			}
		}
	
		
		return [wordRoot, wordRootPrefixed, wordRootSuffixed];
	};
	
	
	var parseInputText = function(text) { // преобразует текст в упорядоченный массив
		return text.replace('ё', 'е')
			.split(/[^А-ЯЁа-яёA-Za-z]+/)
			.filter(String);
	};
	
	
	var buildWordsMap = function(wordsArray) {
		var wordsMap = {};
		var word = '';
		var wordRoot = '';
		var wordRootPrefixed = '';
		var wordRootSuffixed = '';
		var wordForms = [];
		
		for(var i in wordsArray) {
			i = parseInt(i);
			word = wordsArray[i].toLowerCase();
			[wordRoot, wordRootPrefixed, wordRootSuffixed] = getWordRoot(word);
			
			if (!word) { continue; }
			if (word.length < 2) { continue; }
			if (exceptions.indexOf(word) !== -1) { continue; }

			wordForms = [word, wordRoot, wordRootSuffixed, wordRootPrefixed];

			for (var f in wordForms) {
				if (f > 0 && word === wordForms[f]) { continue; }
				
				if ('undefined' === typeof wordsMap[wordForms[f]]) {
					wordsMap[wordForms[f]] = [i];

/////////////////////////////////////////////////////////////////////////		
//console.log(word+' '+wordRoot+' '+wordRootSuffixed+' '+wordRootPrefixed);
/////////////////////////////////////////////////////////////////////////
	
				} else if (wordsMap[wordForms[f]].indexOf(i) === -1) {
					wordsMap[wordForms[f]].push(i);
				}

			}
		}
		return wordsMap;
	};
	
	var interlinkWordsMap = function(wordsMap) {
		for (var word in wordsMap) {
			for (var word2 in wordsMap) {
				if (wordsMap[word] === wordsMap[word2]) { continue; }

				if (word.length > 5 && word.length === word2.length) { 
					if (word.slice(0, word.length - 1) === word2.slice(0, word2.length - 1)) {
						// поиск совпадений слов, у которых отличается только одна буква в конце
						var wordsMapChunk = wordsMap[word].concat(wordsMap[word2]);
						for (var pos in wordsMapChunk) {
							wordsMapChunk[pos] = parseInt(wordsMapChunk[pos]);
						
							if (wordsMap[word].indexOf(wordsMapChunk[pos]) === -1) {
								wordsMap[word].push(wordsMapChunk[pos]);
							}
							if (wordsMap[word2].indexOf(wordsMapChunk[pos]) === -1) {
								wordsMap[word2].push(wordsMapChunk[pos]);
							}
						}
					}
				}
			}
		}
		return wordsMap;
	};
	
	var getRepetitions = function(text, searchDistance) {
		
		var wordsMap = buildWordsMap(parseInputText(text));
		wordsMap = interlinkWordsMap(wordsMap);
		
		var repeatedWordsPos = [];
		for (var word in wordsMap) {
			if (wordsMap[word].length < 2) { continue; } // пролистываем слова, у которых нет совпадений
			var wordPos = wordsMap[word].sort(function(a, b) { return a - b; });
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
	
	
	return { getRepetitions };

})();