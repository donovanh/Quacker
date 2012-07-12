(function(){

	//Backbone.emulateJSON = true;

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
			myMessage = {
				'mytext': $('#mytext').val(),
	      'from': $('input[name=from]').val(),
				'to': $('input[name=to]').val()
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
						$('#toTranslate input[type=submit]').val('Translate').attr('disabled',false);
					}
				}
			);
			e.preventDefault();
		},
		render: function() {
			var templateHTML = _.template($('#messageTemplate').html(), {mytext: this.model.get("content")});
			$(this.el).append(templateHTML);
    }
	});
	
	// Initialise new message
	var myMessage = new myText();
	var messageView = new myTextInputView({model: myMessage});
	
	// Initialise ducky
	if ($('html').hasClass('borderradius') && $('html').hasClass('csstransitions')) {
		var tempContainer = $('<div id="duckfoo" style="display:none"></div>')
		tempContainer.append(_.template($('#duckTemplate').html()));
		$('.footer').append(tempContainer);
		$('#duckfoo').fadeIn();
	}
	
}());

/* Functions */

function sendTweet(e) {
	var translatedText = {translatedText: $('#translatedText').text().trim()};
	$.post(
		'/tweet',
		translatedText,
		function(data, status) {
			if (status == 'success') {
				showSuccess();
			} else {
				// Error - tweet didn't post
				
			}
		}
	);
}

function showTranslatedText(translatedText) {
	var templateHTML = _.template($('#translationTemplate').html(), {translatedText: translatedText});
	$('#translation-holder').append(templateHTML);
	// Listener for tweet-this button
	$('#tweet-this.logged-in').click(sendTweet);
}

function showSuccess() {
	var templateHTML = _.template($('#successTemplate').html());
	$('#success-holder').hide().append(templateHTML);
	$('#success-holder').fadeIn('fast');
}