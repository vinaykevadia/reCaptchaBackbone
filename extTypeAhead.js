
/**
 * Extend typeahead with tokenahead to get the autocomplete like facebook
 * 
 */

!function($) {

	"use strict"; // jshint ;_;

	/*
	 * TOKENAHEAD PUBLIC CLASS DEFINITION ==================================
	 */

	var Tokenahead = function(element, options) {
		this.$wrapper = $(element);
		
		
		this.$measurer = $('.measurer', this.$wrapper);
		this.$tokens = $('.tokens', this.$wrapper);
		this.$originalInput = $('input', this.$wrapper);
		this.$clonedInput = $('input', this.$wrapper).clone().appendTo(this.$wrapper).val('');
		this.$originalInput.hide();
		this.selTemplate = options.selTemplate || this.selTemplate;
		
		// call typeahead constructure
		$.fn.typeahead.Constructor.call(this, this.$clonedInput, options);
		// extend options 
		this.options = $.extend({}, $.fn.tokenahead.defaults, options);
		
		
		if(this.options.canAddNew){
			this.$addNewBtn = $("<a class='btn add-new sp-lite-icon' ><i class='icon-plus'></i></a>");
			this.$wrapper.append(this.$addNewBtn);
			this.$addNewBtn.hide();
			var $this = this;
			this.$addNewBtn.click(function(){
				$this.select();
			})
			
		}
		
		
		if(!this.$wrapper.find("[name="+this.$originalInput.attr('name')+"_count]")[0]){
			this.$countInp = $("<input type='hidden' name='"+this.$originalInput.attr('name')+"_count' />");
			this.$wrapper.append(this.$countInp);
		}else{
			this.$countInp = this.$wrapper.find("[name="+this.$originalInput.attr('name')+"_count]");
		}
		
		// on change event 
		var $this = this;
		this.$countInp.on("change",function(){
			// change event
			$this.$element.trigger("tagahead.change",$this);
		});
		
		
		
		// add default items if defined 
		if(this.defaultItems){
			for(var i in this.defaultItems)
				this.addToken(this.defaultItems[i]);
		}
		
		// hide input if non editable 
		if(this.editable == false){
			this.$wrapper.addClass("editable-false")
			this.$clonedInput.hide();
			this.$originalInput.hide();
		}
		
		
	}

	Tokenahead.prototype = $.extend({}, $.fn.typeahead.Constructor.prototype, {

		constructor : Tokenahead,
		
		updater : function(item) {
			if(!$.isEmptyObject(item))
				this.addToken(item);
			return '';
		},
		
		// event on remove token 
		onRemovedToken : function(){
			if(this.options.maxSelectedTags == 1)
				this.$element.show();
			
			var cnt = Number(this.$countInp.val()) - 1;
			this.$countInp.val(cnt ? cnt : "").trigger('change');			
		},
		
		addToken : function(item) {
			var that = this;
			
			// check if string
			if(typeof item == "string"){
				item = $.parseJSON(item);
			}
			
			if(this.selTemplate){
				var tmpl = _.template(this.selTemplate);
				var selHTML = tmpl(item);
			}else{
				var selHTML = item[this.displayField];
			}
			
			
			// create token
			var token = $(this.options.token), text = $('<span class="txt-cont"></span>').html(selHTML).appendTo(token);
			
			// set data value into the dom
			token.data('value', item);
			token.appendTo(this.$tokens);
			var tokenValue = $("span", this.$tokens).not(".close").map(
					function() {
						return $(this).text();
					}).get();
			this.$originalInput.val(tokenValue);
			
			$(token).on("click", function(e){				
				that.$element.trigger("tagahead.tag.onclick", e)
			});
						
			// unselect menu item once it is added into the slection(tag) box
			this.$menu.find('>li').removeClass("active");
		
			
			// increse counter 
			this.$countInp.val(Number(this.$countInp.val()) + 1).trigger('change');
			
		},
		
		listen : function() {
			var that = this;
			if (that.$element.val() || that.$tokens.children().length != 0) {
				that.$element.attr("placeholder", "");
				that.$element.css("width", "30");
			}
			$.fn.typeahead.Constructor.prototype.listen.call(this);

			this.$wrapper.on('click', 'a', function(e) {
				e.stopPropagation();
			}).on(
					'click',
					'.close',
					function(e) {
						$(this).parent().remove();
						that.onRemovedToken();
						
						var tokenValue = $("span", that.$tokens).not(".close")
								.map(function() {
									return $(this).text();
								}).get();
						that.$originalInput.val(tokenValue);
						that.$element.focus();
					}).on('click', function() {
				that.$element.focus();
				
			})

			this.$element.on('focus', function(e) {
				
				if(that.options.canAddNew)
					that.$addNewBtn.show();
				
				if(that.editable == true)
					that.$wrapper.addClass('focus');
				
				that.$element.attr("placeholder", "");
				if (!that.$element.val()){
					
					// added by vinay 
					if(that.options.menuUrl){
						that.fillDefaultMenu();
					}
					
					return that.isEmpty = true;
				}	
			}).on('blur', function(e) {
				
				that.$wrapper.removeClass('focus');
				if(that.placeHolder){
					that.$element.attr("placeholder", that.placeHolder);
				}
				
			}).on('keyup', function(e) {
						var tokens, value;

						if ((e.keyCode == 188 || e.keyCode == 13)
								&& that.$element.val() != ','
								&& (value = that.$element.val())) { // enter
							// with no
							// menu and
							// val
							that.$element.val('').change();
							
							/*
							if (value.charAt(value.length - 1) === ",") {
								// add custom value on ','
								that.addToken({displayField : value.substring(0,value.length - 1)});
							} else {
								// add custom value on enter
								that.addToken({displayField : value})
							}
							*/
							
							return that.$element.focus();
						}

						if (e.keyCode != 8 || that.$element.val()){
							return that.isEmpty = false;// backspace
						}
						
							
						if (!that.isEmpty){
							// added by vinay 
							if(that.options.menuUrl){
								that.fillDefaultMenu();
							}
							return that.isEmpty = true;
						}
						
						tokens = $('a', that.$tokens);
						
						if (tokens.length){
							that.onRemovedToken();
							return tokens.last().remove();
						}		
						
						var tokenValue = $("span", that.$tokens).not(".close")
								.map(function() {
									return $(this).text();
								}).get();
						that.$originalInput.val(tokenValue);
					}).on('keypress keydown paste', function(e) {
						if (e.keyCode == 13) {
							e.preventDefault();
						}
						var value = that.$element.val();
						that.$measurer.text(value);
						that.$element.css('width', that.$measurer.width() + 30);
					})
		}

	})

	/*
	 * TOKENAHEAD PLUGIN DEFINITION ============================
	 */

	$.fn.tokenahead = function(option) {
		return this
				.each(function() {
					var $this = $(this), data = $this.data('tokenahead'), options = typeof option == 'object'
							&& option
					if (!data)
						$this.data('tokenahead', (data = new Tokenahead(this,
								options)));
					if (typeof option == 'string')
						data[option]();
				})
	}

	$.fn.tokenahead.Constructor = Tokenahead

	$.fn.tokenahead.defaults = $.extend($.fn.typeahead.defaults, {
		token : '<a class="tag"><span class="close">&times;</span></a>',
		defaultItems : false, // add default items
		editable : true
	})

}(window.jQuery)








/**********************************************************************************
 *  Tag Ahead
 * 
 */

!function($) {

	"use strict";

	/*
	 * Tagahead plugin class defination  ==================================
	 */

	var Tagahead = function(element, options) {
						
		// search from local object
		if(options.source){
			options = $.extend({}, options, {
				source : options.source
			});						
			
		// search through ajax request 	
		}else if(options.searchUrl){
			
			options = $.extend({}, options, {
				// Ajax loading
				ajax : {
					url : options.searchUrl,
					timeout : 500,
					triggerLength : 1,
					method : "get",
					loadingClass : "loading-circle",
					preDispatch : function(query) {

						// showLoadingMask(true);
						if(options.otherParam){
							return {
								q : query,
								params : options.otherParam
							}
						}else{
							return {
								q : query
							}
						}
						
					},
					preProcess : function(data) {
						data = $.parseJSON(data);

						// showLoadingMask(false);
						if (data.success === false) {
							// Hide the list, there was some error
							return false;
						}
						// We good!
						return data;
					}
				} 

			});
			
		}
		
		// Call tokenahead constructure
		$.fn.tokenahead.Constructor.call(this, element, options);		
		var options = $.extend({}, options, {
			menuTemplate : "<div><%=name %></div>",
			selTemplate : "<div><%=name %></div>"
		});
		// Extend options
		this.options = $.extend({}, $.fn.tagahead.defaults, options);		
		
	}

	Tagahead.prototype = $.extend({}, $.fn.tokenahead.Constructor.prototype, {
		constructor : Tagahead,
		
		// get selected elements(full object) (api)
		getSelected : function(){
			var sel = [];
			this.$wrapper.find('.tokens').children().each(function(){
				sel.push($(this).data('value'));
			});
			return sel;
		},
		
		// get selected tag names only (api)
		getSelectedTags : function(){
			var sel = [];
			this.$wrapper.find('.tokens').children().each(function(){
				sel.push($(this).data('value')["name"]);
			});
			return sel;
		},
		
		// remove tags externally (api)
		removeAllTags : function(){
			this.$tokens.html("");
			this.$countInp.val("").trigger("change");
			
		},
		
		// add new tag externally (api)
		addTag : function(item){
			
			if(this._validation(item[this.options.displayField])){
				this.addToken(item);
			}	
		},
		
		// added by vinay (overrided)
		select : function() {
			
			var val = this.$menu.find('.active').data('value')
			if(this.options.canAddNew && !val){
				var val = {};
				var value = this.$element.val().trim();
				if(value){
					val[this.options.displayField] = value;
				}
			}
			
			if(val && val[this.options.displayField] && val[this.options.displayField].trim()){
				
				if(!this._validation(val[this.options.displayField]))
					return this.hide();
				
				// on valid value 
				this.$element.val('');
				if(this.options.maxSelectedTags == 1){
					this.$element.hide();
					if(this.$addNewBtn)this.$addNewBtn.hide();	
				}
				this.$element.val(this.updater(val)).change()
			}
			
			
			return this.hide()
		},
		
		// tag value validation 
		_validation: function(value){
			if(this.options.preventDuplicate){
				var tags = this.getSelectedTags();
				for(var i in tags){
					if(tags[i].toLowerCase().trim() == value.toLowerCase().trim()){
						this.$element.trigger("tagahead.error", this.options.inplabel+" is allready exists.");
						return false;
					}
				}
			}
			
			// check max numbers of tags selection
			if(this.options.maxSelectedTags){
				var tags = this.getSelectedTags();				
				if(tags.length >= this.options.maxSelectedTags){					
					this.$element.trigger("tagahead.error", "You can not select more than "+this.options.maxSelectedTags+ " "+this.options.inplabel+"(s)." );
					return false;
				}	
			}
			
			
			// validate tag max length.
			if(this.options.maxTagLength){
				if(value.length > this.options.maxTagLength){
					this.$element.trigger("tagahead.error", this.options.inplabel+" must be at most "+this.options.maxTagLength+" characters");
					return false;
				}
			}
			
			// validate min tag length.
			if(this.options.minTagLength){
				if(value.length < this.options.minTagLength){
					this.$element.trigger("tagahead.error", this.options.inplabel+" must be at least "+this.options.minTagLength+" characters");
					return false;
				}
			}
			
			// validate tag pattern
			if(this.options.tagPattern){
				if(!value.match(this.options.tagPattern)){
					this.$element.trigger("tagahead.error", this.options.inplabel+" is invalid");
					return false;	
				}
			}
			
			return true;
		},
		
		// local matcher 
		matcher : function(item) {
			return ~item.toLowerCase().indexOf(this.query.toLowerCase().trim());
		},
		
	})
 
	/*
	 * Tagahead plugin defination  ============================
	 */
	$.fn.tagahead = function(option) {
		return this.each(function() {
			var $this = $(this), data = $this.data('tagahead'), options = typeof option == 'object'
					&& option
			if (!data)
				$this.data('tagahead', (data = new Tagahead(this,
						options)));
			if (typeof option == 'string')
				data[option]();
		});
	}

	$.fn.tagahead.Constructor = Tagahead;
	
	$.fn.tagahead.defaults = $.extend({}, $.fn.tokenahead.defaults, {
		canAddNew : false, // can add new external tags [true/false]
		preventDuplicate : false,
		
		tagPattern : /^[a-zA-Z0-9@$#\&\t\s\-\_]+$/, 
		inplabel : 'tag',
		maxTagLength : 75,
		minTagLength : 3,
		maxSelectedTags : false // false, 1,2,5... 
	})

}(window.jQuery)



/**********************************************************************************
 *  Combo Ahead
 * 
 */

!function($) {

	"use strict";

	/*
	 * Comboahead plugin class defination  ==================================
	 */
	var Comboahead = function(element, options) {
		
		// Call parent constructure
		$.fn.tagahead.Constructor.call(this, element, options);
		
		// add comboahead class to the wrapper
		this.$wrapper.addClass("comboahead");
		
		// Extend options 
		this.options = $.extend({}, $.fn.comboahead.defaults, options);
		
	}

	Comboahead.prototype = $.extend({}, $.fn.tagahead.Constructor.prototype, {
		constructor : Comboahead		
	});
 
	/*
	 * Comboahead plugin defination  ============================
	 */
	$.fn.comboahead = function(option) {
		return this.each(function() {
			var $this = $(this), data = $this.data('comboahead'), options = typeof option == 'object'
					&& option
			if (!data)
				$this.data('comboahead', (data = new Comboahead(this,
						options)));
			if (typeof option == 'string')
				data[option]();
		});
	}

	$.fn.comboahead.Constructor = Comboahead;
	
	$.fn.comboahead.defaults = $.extend({}, $.fn.tagahead.defaults, {
		canAddNew : false, // can add new external tags [true/false]
		preventDuplicate : false,
		
		//tagPattern : /^[a-zA-Z0-9@$#\&\t\s\-\_]+$/, 
		maxTagLength : 75,
		minTagLength : 3,
		maxSelectedTags : 1,
		token : '<a class="tag combo"><span class="close">&times;</span></a>',
	})
	

}(window.jQuery)

