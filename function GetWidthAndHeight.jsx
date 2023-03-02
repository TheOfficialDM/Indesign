Main();

function Main() {
	var obj = app.selection[0];
	var W_H = GetWidthAndHeight(obj);
	0
}

function GetWidthAndHeight(obj) {
	var result = null;
	
	if (obj.hasOwnProperty("geometricBounds")) {
		var gb = obj.geometricBounds;
		result = {width: gb[3] - gb[1], height: gb[2] - gb[0]};
	}
	else if (obj.hasOwnProperty("width") && obj.hasOwnProperty("height")) {
		result = {};
		result.width = obj.width;
		result.height = obj.height;
	}
	
	return result;
} 