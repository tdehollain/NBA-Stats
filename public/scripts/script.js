$(document).ready(function() {
	$('.plusButton').click(function(e) {
		$(e.target).parent().parent().next('.gamePerf').toggleClass('hidden');
		// $(e.target).text()==="+" ? $(e.target).text('-') : $(e.target).text('+');
	});
});