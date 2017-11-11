$(document).ready(function() {
	$('.detailsButton').click(function(e) {
		$(e.target).parent().siblings('hr, .gamePerf, .indivPerf').toggleClass('hidden');
		$(e.target).text()==='Show details' ? $(e.target).text('Hide details') : $(e.target).text('Show details');
	});
});

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-37123346-5', 'auto');
ga('send', 'pageview');