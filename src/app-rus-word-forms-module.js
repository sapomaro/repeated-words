
window.LangToolsApp.RusWordFormsModule = (function() {
	"use strict";
	
	var parseMorphemes = function(line) { // преобразует части слов в упорядоченный массив
		return line.replace('ё', 'е')
			.split(/[^А-ЯЁа-яё]+/)
			.sort(function(a, b) { return a.length - b.length; });
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
		'-от-, -лог, '+
		'-чн- ' // upd 2022-09-12
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
		'ваш, век, вер, вес, вид, вод, вред, вечер, власт, вопрос, войн, втор, '+
		'восто, возраж, '+
		'газон, дел, доход, доступ, долж, закон, заслон, запад, истор, '+
		'крат, крыл, мыш, начал, начин, недел, наш, '+
		'област, образ, остров, отраж, обреч, '+
		'пут, пора, получ, полн, прав, правл, правил, проект, прост, постав, '+
		'процесс, преступ, планет, полит, послед, продолж, предел, повестк, '+
		'провер, '+
		'рад, развит, разработ, '+
		'сид, свиде, след, слов, случ, стран, сил, систем, средств, стол, столиц, сведен, '+ 
		'сторон, связ, ситуац, союз, совет, стат, суверен, содерж, соверш, свет, слон,'+
		'тиш, тест, точк, '+
		'удел, устав, услов, участ, уваж, уступ, улиц, указ, формул'
	); 
	
	/*	спорные случаи: 
			последний - последствия
			снег - снежный
			тема - темный
			Нью-Дели - делить
	*/
	
	var immutableRoots = 'никто, пока, ради, там, так, как, кто, что, раз, вне, при';
	
	
	var wordFormsHandler = function(word) {
		var wordRoot = word; // корень без аффиксов
		var wordRootPrefixed = word; // корень с приставкой (для расширенного сопоставления)
		var wordRootSuffixed = word; // корень с суффиксом (для расширенного сопоставления)
		var wordRootMatched = false; // наличие проблемного корня
		
		if (immutableRoots.indexOf(wordRoot) !== -1 || unbreakableRoots.indexOf(wordRoot) !== -1) { 
			return [word, wordRoot, wordRootPrefixed, wordRootSuffixed]; 
		}
		
		
		for (var r = unbreakableRoots.length - 1; r >= 0; --r) { // проверка на наличие проблемного корня
			if (word.length < unbreakableRoots[r].length) { 
				continue; 
			}
			if (word.indexOf(unbreakableRoots[r]) !== -1){
				wordRootMatched = unbreakableRoots[r];
				break;
			}
		}
	
//alert(wordRootMatched);
		
		var parseSequence = [[endings, 2], [suffixes, 2], [suffixes, 3], [prefixes, -3]];
		// порядок отсечения аффиксов: тип + количество букв, которые должны остаться у корня
		// (отрицательное значение для приставок)

		for (var p = 0; p < parseSequence.length; ++p) { // отсечение аффиксов от слова

			var affixes = parseSequence[p][0]; 
			var minRootSize = parseSequence[p][1];
			var possibleAffixLength = wordRoot.length - Math.abs(minRootSize);
			var wordChunk = '';
			
			for (var i = affixes.length - 1; i >= 0; --i) {
				if (affixes[i].length > possibleAffixLength) {
					continue; 
				}
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
					wordChunk = wordRoot.slice(affixes[i].length);
					if (wordRootMatched && wordChunk.indexOf(wordRootMatched) === -1) { 
						continue; // если часть корня пропадает при отсечении аффикса, то ищется другой
					}
					wordRoot = wordChunk;
					wordRootSuffixed = wordRootSuffixed.slice(affixes[i].length);
					break;
				}
			}
			if (unbreakableRoots.indexOf(wordRoot) !== -1) { 
				break; 
			}
		}
		
console.log([word, wordRoot, wordRootPrefixed, wordRootSuffixed]); 

		return [word, wordRoot, wordRootPrefixed, wordRootSuffixed];
	};
	
	
	
	
	return { wordFormsHandler: wordFormsHandler };
})();



