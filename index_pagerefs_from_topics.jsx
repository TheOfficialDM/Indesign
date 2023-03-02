//DESCRIPTION: Create page references for existing topics
// Peter Kahrel

(function () {
	
	var terminals_only = false;

//~ 	function progress_bar (max, title) {
//~ 		app.scriptPreferences.enableRedraw = true;
//~ 		var w = new Window ('palette', title);
//~ 		w.pbar = w.add ('progressbar', undefined, 1, max);
//~ 		w.pbar.preferredSize = [300,20];
//~ 		return w;
//~ 	}

	function terminalCheck (topic) {
		return (topic.topics.length === 0 && terminals_only) || !terminals_only;
	}

	function addPageRef (topic, found_item) {
		var ip = found_item.insertionPoints[0].index;
		var topic_text = found_item.contents;
		// If the topic is a cross-reference, an empty string is returned
		// Do terminal nodes only (i.e. those without (sub)topics
		if (topic !== "" && terminalCheck(topic)) {
			var p_ref = topic.pageReferences.add (found_item.insertionPoints[0], PageReferenceType.CURRENT_PAGE);
			// Tables mess up the placement of page references
			if (Math.abs(p_ref.sourceText.index - ip) > 0){
				try {
					found_item.parentStory.characters[p_ref.sourceText.index].move (LocationOptions.after, found_item.insertionPoints[0]);
				} catch (_) {
				// . . .
				}
			}
		}
		// return p_ref;
	}

	function pagerefs_from_topics (doc){
		var j, found_topics;
		var doc_topics = doc.indexes[0].allTopics;
		//var progress_window = progress_bar (doc_topics.length, 'Mark topics');
		//progress_window.show();
		for (var i = 0; i < doc_topics.length; i++){
			//progress_window.pbar.value = i+1;
			//app.findGrepPreferences.findWhat = '\\b'+doc_topics[i].name+'\\b';
			app.findGrepPreferences.findWhat = '\\b'+doc_topics[i].name.replace (/,.+/,'')+'\\b';
			found_topics = doc.findGrep (true);
			for (j = 0; j < found_topics.length; j++){
				try {
					//doc_topics[i].pageReferences.add (found_topics[j], PageReferenceType.currentPage)
					addPageRef (doc_topics[i], found_topics[j]);
				} catch (_){
					// . . .
				};
			}
		}
		doc.indexes[0].update (); // update the preview
		//try{progress_window.close()}catch(_){}
	}
	
	if (app.documents.length > 0 && app.documents[0].indexes.length > 0) {
		app.findGrepPreferences = null;
		pagerefs_from_topics (app.documents[0]);
	}

}());