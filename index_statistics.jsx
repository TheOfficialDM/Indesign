


(function () {
	if (app.documents.length > 0) {
		if (app.documents[0].indexes.length === 0) {
			alert ('The document has no index', 'Index statistics', );
			exit();
		}
		stats();
	}


	function stats() {
		
		var levels = [0,0,0,0];
		var unused = 0;
		var pRefs = 0;
		var xRefs = 0;
		var unusedNames = [];
		var referencedTopics = {};
		

		function printUnusedTopics() {
			var f = File ('~/Desktop/UnusedTopics.txt');
			f.encoding = 'UTF-8';
			f.open('w');
			f.write (unusedNames.join('\r'));
			f.close();
			f.execute();
		}


		function showStats() {
			var s = 'Level 1 topics: ' + levels[0];
			s += '\rLevel 2 topics: ' + levels[1];
			s += '\rLevel 3 topics: ' + levels[2];
			s += '\rLevel 4 topics: ' + levels[3];
			s += '\r\rUnused topics: ' + unused;
			s += '\r\rPage references: ' + pRefs;
			s += '\rCross-references: ' + xRefs;
			s += '\r\r---------------------------\r\r';
			s += '\rPrint unused topics?';
			if (confirm (s, false, 'Index statistics')) {
				printUnusedTopics();
			}
		}


		function getReferencedTopics (topics) {
			var j;
			var o = {};
			for (var i = topics.length-1; i >= 0; i--) {
				for (j = topics[i].crossReferences.length-1; j >= 0; j--) {
					o[topics[i].crossReferences[j].referencedTopic.name] = true;
				}
			}
			return o;
		}


		function usedTopic (topic) {
			return topic.pageReferences.length > 0 || topic.crossReferences.length > 0 || topic.topics.length > 0 || referencedTopics[topic.name];
		}


		function traverseTopics (topics, level, path) {
			for (var i = 0; i < topics.length; i++) {
				if (usedTopic (topics[i])) {
					levels[level]++;
					if (topics[i].pageReferences.length > 0) {
						pRefs++;
					}
					if (topics[i].crossReferences.length > 0) {
						xRefs++;
					}
					if (topics[i].topics.length > 0) {
						traverseTopics (topics[i].topics.everyItem().getElements(), level+1, path + '/' + topics[i].name)
					}
				}  else {
					unusedNames.push ((path + '/' + topics[i].name).replace(/^\//,''));
					unused++;
				}
			}
		}

		referencedTopics = getReferencedTopics (app.documents[0].indexes[0].allTopics);
		traverseTopics (app.documents[0].indexes[0].topics.everyItem().getElements(), 0, '');
		showStats();
	}
}());