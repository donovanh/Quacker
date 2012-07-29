var doLanguageListToggle = true;
	
(function(){

	// Global listeners
	// Listener for tweet-this button
	$('body').on('click', '#tweet-this.logged-in', sendTweet);
	$('body').on('click', '#tweet-this.not-logged-in', logInWithTwitter);
	$('body').on('click', '#cancel', backToEditor);
	
	$('body').on('focus', '#form-holder.dimmed #mytext', backToEditor);
	$('body').on('hover', '.from-to ul', toggleLanguageList);
	$('body').on('click', '.from-to li', toggleLanguageSelected);
	
	// Backbone basic structure
	/**
	 * Model: myText
	 *    		content - contains a string
	 */
	var myText = Backbone.Model.extend({ 
		defaults: { content: 'this is my text'},
		url: '/translate'
	});
	
	// My Text Input form view
	myTextInputView = Backbone.View.extend({  
	  el: $('#form-holder'),
		initialize: function(){
      _.bindAll(this, 'render');
       this.render();
    },
		events:{
			'submit #toTranslate': 'getTranslation'
		},
		getTranslation: function(e) {
			e.preventDefault();
			if ($('#mytext').val() == '')
				return;
			var translateFrom = $('.from li.selected').attr('data-val');
			var translateTo = $('.to li.selected').attr('data-val');
			myMessage = {
				'mytext': $('#mytext').val(),
	      'from': translateFrom,
				'to': translateTo
			};
			// Set loading text
			$('#toTranslate input[type=submit]').val('Translating...').attr('disabled',true);
			$.post(
				'/translate',
				myMessage,
				function(data, status) {
					if (status == 'success') {
						showTranslatedText(data.translated);
						$('#toTranslate input[type=submit]').val('Translate').attr('disabled',false);
					} else {
						// Error - probably Microsoft's fault - somebody tell Steve
						// Show error message
						$('#toTranslate input[type=submit]').val('Translate').attr('disabled',false);
					}
				}
			);
		},
		render: function() {
			var tempHTML = $('<div id="textform" style="display:none"></div>');
			tempHTML.append(_.template($('#messageTemplate').html(), {mytext: this.model.get("content")}));
			$(this.el).append(tempHTML);
			$('#textform').fadeIn();
    }
	});
	
	// Initialise new message
	var myMessage = new myText();
	var messageView = new myTextInputView({model: myMessage});
	
	// Initialise ducky
	if ($('html').hasClass('borderradius') && $('html').hasClass('csstransitions')) {
		var tempContainer = $('<div id="duckfoo" style="display:none"></div>')
		tempContainer.append(_.template($('#duckTemplate').html()));
		$('.duck-holder').append(tempContainer);
		$('#duckfoo').fadeIn();
	}
	
}());

/* Functions */

function sendTweet(e) {
	if ($('#tweet-this').hasClass('disabled')) return;
	var translatedText = {translatedText: $('#translatedText').text().trim()};
	$('#tweet-this').text('Sending...').addClass('disabled');
	$.post(
		'/tweet',
		translatedText,
		function(data, status) {
			if (status == 'success') {
				showSuccess();
			} else {
				// Error - tweet didn't post
				$('#tweet-this').text('Oops. Try again!').removeClass('disabled');
			}
		}
	);
}

function logInWithTwitter() {
	document.location.href='/sign_in';
}

function backToEditor(e) {
	$('#translation-holder').slideUp();
	$('#form-holder').removeClass('dimmed');
}

function showTranslatedText(translatedText) {
	var templateHTML = _.template($('#translationTemplate').html(), {translatedText: translatedText});
	$('#translation-holder').text('').hide().append(templateHTML).slideDown('fast');
	$('#form-holder').addClass('dimmed');
}

function showSuccess() {
	var templateHTML = _.template($('#successTemplate').html());
	$('#success-holder').hide().append(templateHTML);
	$('#success-holder').slideDown('fast');
	$('#form-holder, #translation-holder').fadeOut('fast');
}

function toggleLanguageList(e) {
	if (doLanguageListToggle)
		$(e.target).parent().find('li').not('li.selected').stop().slideToggle();
	else
		doLanguageListToggle = true;
}

function toggleLanguageSelected(e) {
	console.log($(e.target));
	$(e.target).parent().find('li.selected').removeClass('selected');
	$(e.target).addClass('selected');
	$(e.target).parent().find('li').hide();
	$(e.target).parent().find('li.selected').fadeIn();
	doLanguageListToggle = false;
}

