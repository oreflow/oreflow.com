var NOWords=10;

self.addEventListener("message", function(e) {
    NOWords = e.data;
}, false);

function moveObjects() {
	for(var i = 0; i < NOWords; i++)
	{
		this.postMessage('#word' + i);
	}
	setTimeout("moveObjects()",50);
}
moveObjects();