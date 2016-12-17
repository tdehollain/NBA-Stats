$(document).ready(function() {
	$('.plusButton').click(function(e) {
		$(e.target).parent().parent().siblings('hr, .gamePerf, .indivPerf').toggleClass('hidden');
		// $(e.target).text()==='+' ? $(e.target).text('x') : $(e.target).text('+');
	});
});