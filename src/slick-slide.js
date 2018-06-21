import $ from 'jquery';
import 'slick-carousel';

$(document).ready(function(){
		$('.customer-logos').slick({
				slidesToShow: 5,
				slidesToScroll: 1,
				autoplay: true,
				autoplaySpeed: 1000,
				arrows: false,
				dots: false,
				pauseOnHover: false,
				responsive: [{
					  breakpoint: 768,
					  settings: {
						    slidesToShow: 3
					  }
				}, {
					  breakpoint: 520,
					  settings: {
						    slidesToShow: 2
					  }
				}]
		});
});
