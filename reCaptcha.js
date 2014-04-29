
/**
 * Captcha plugin to generate captcha 
 */
$(function(){
	
	var Captcha = function (element, options) {
	    this.init('captcha', element, options)
	};
		
	Captcha.prototype = {
	    constructor: Captcha,
	    init: function (type, element, options) {		    	
	    	this.type = type;
	    	this.$element = $(element);
	    	this.options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options);	    	
	    	this._create();	    	
	    },
	    
	    _create : function(){
	    	var $this = this;
	    	Recaptcha.create(this.options.publicKey,this.options.widgetId,{
	    		      theme: "custom",
	    		      custom_theme_widget: this.options.widgetId,
	    		      callback: function(){  
	    		    	  $this.$element.trigger('captcha.shown');
	    		      }
	    	});	
	    },
	    
	    reload :function(){
	    	Recaptcha.reload()	
	    },
	    
	    getChallenge : function(){
	    	return RecaptchaState.challenge;  
	    }, 
	    
	    getText : function(){
	    	return this.$element.find('.input-recaptcha').val();	    	
	    }	    	    
	};
	
	
	var old = $.fn.captcha
	
	$.fn.captcha = function(option){
		
		var that = $(this);
		require(['captcha'],function(){			
			
			return that.each(function () {
			      var $this = $(this)
			        , data = $this.data('captcha')
			        , options = typeof option == 'object' && option			        
			      if (!data) $this.data('captcha', (data = new Captcha(this, options)))
			      if (typeof option == 'string') data[option]()
			    })
			
		});
		
		return $(this);
	};
	
	$.fn.captcha.Constructor = Captcha;
	$.fn.captcha.defaults = {
			widgetId : "recaptcha_widget",
			publicKey : "6LeNGNwSAAAAAMJ2XQpWSKdVy9MdZqQf4LsSZlBP", // google recaptcha public key			
	};
	
	$.fn.captcha.noConflict = function () {
	    $.fn.captcha = old
	    return this
	}
	
	
});

