		/**
		choicefilter.js is a zero dependency javascript library, which creates chained dependency 
		among select dropdown lists, checkboxes and radio buttons in a simple way.

		MIT License

		Copyright (c) 2020 Rexhep Shijaku

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
		
		**/

		var ChoiceFilter = function(parent, child, options) {

				this.settings = {};

				this.attributes = {

		            elemId: "data-chf-id",
		            elemFilters:"data-chf-filters",
		            elemWrapper:"data-chf-wrapper",

		            elemDependsOn:"data-chf-dpnds2",
		            elemIndependent:"data-chf-indpndt",
		            elemPresentOnEveryParent:"data-chf-prst-prt",
		        
		            elemValueHolder:"data-chf-val",
		            elemListValueHolder:"data-chf-vlhld",
		            elemValueDelimiter:"data-chf-dlmtr",
		            elemSelectAfterFilter:"data-chf-pst-filt", // only if value was not able to be preserved
		            elemHolderControls:"data-chf-cntrls",
		            elemIgnoreValue:"data-chf-ingr-vl" 
			    };

			    this.defaults = {

			    	resetPrevious: true, // todo (resets all) not fully implemented
			    	autoFilterOnInit : true, // when initialized fire onchange event
		         	valueDelimiter: ",", 
		            wrapperSelector: null,
		            dataOnly: false, // only data will be updated
		            
		            independentChoices: [], // choices which are in this array will never be filtered by parent 
			    	showAllChildChoicesWhen : [], // choices which are in this array will show all child choices
		            autoSelectedChoicesAfterFilter : [], // choices which are in this array will 
		            presentOnEveryParent : [], // 

		            forceResetAllChain : false, // todo dont preserve value

		            parentControlsVisibilityOf : null, // when parent has some value, it will show some element specified by this selector
		            ignoreParentValues : [] // when these values are selected, filter between parent-child will do nothing
			    };

			    this.settings = this.extend(this.settings, this.defaults);	
			    this.settings = this.extend(this.settings, options);	

			    this.data = this.mapData(this.settings.data);

			    this.settings.independentChoices = this.parseValueToArray(this.settings.independentChoices);
			    this.settings.presentOnEveryParent = this.parseValueToArray(this.settings.presentOnEveryParent);
			    this.settings.autoSelectedChoicesAfterFilter = this.parseValueToArray(this.settings.autoSelectedChoicesAfterFilter);
			    this.settings.showAllChildChoicesWhen = this.parseValueToArray(this.settings.showAllChildChoicesWhen);
			    this.settings.ignoreParentValues = this.parseValueToArray(this.settings.ignoreParentValues); // even vals in here are checked noth heppns

			    this.parent = parent instanceof HTMLElement ? [parent] : parent; // treat everything as array
			    this.child = child instanceof HTMLElement ? [child] : child; // treat everything as array

			    this.parentType = this.parent[0].type;
			    this.childType = this.child[0].type;
			}

			ChoiceFilter.prototype.init = function() {

				switch (this.parentType) { 
	                case "select-one":
	                case "select-multiple":
	    				this.initParentSelect();
	                    break;
	                case "radio":
	                case "checkbox":  	
	                	this.initParentInput();
	                break;
	       		 }

				switch (this.childType) { 
	                case "select-one" :
	                case "select-multiple" :
	    				this.initChildSelect();
	                    break;
	                case "radio":
	                case "checkbox":  	
	                	this.initChildInputItems();
	                break;
	       		 }

	       		 if(this.settings.autoFilterOnInit)
	       		 {
	       		 	var event = document.createEvent("Event");
					event.initEvent("change", false, true); 
					this.parent[0].dispatchEvent(event);
	       		 }
	       		 	
			}

			Object.prototype.filtchoices = function(child, options) {

				var chf = new ChoiceFilter(this, child, options);
				chf.init();
				return child;
			}

			//initializing dropdown (select)
			ChoiceFilter.prototype.initParentSelect = function() {

				var elem = this.parent[0]; // <select> s first node

				var was_inited = elem.hasAttribute(this.attributes.elemId); // is it someone elses child
				if(!was_inited)
				{
					elem.setAttribute(this.attributes.elemId, this.generateId());
					this.addChangeListener(elem); // parent always will filter some child elem as a result it will have its listener
				}

				var opts = elem.querySelectorAll("option");
				for(var i=0; i<opts.length; i++)
				{	
					if(this.settings.resetPrevious)
						this.dropParentItemProps(opts[i]);
					this.setParentItemProps(opts[i]);
				}

			}

			ChoiceFilter.prototype.initChildSelect = function() {

				var elem = this.child[0]; // <select> s first node

				var chfid;

				//todo what if user ads checkbox at firstx!
				var was_inited = elem.hasAttribute(this.attributes.elemId); // is someone elses child or parent
				if(!was_inited)
				{
					chfid = this.generateId();
					elem.setAttribute(this.attributes.elemId, chfid);

					this.addChangeListener(elem); // add listener only if it was never initiated
				}
				else
				{
					chfid = elem.getAttribute(this.attributes.elemId);
					this.disconnectPreviousParent(chfid); //if exists
				}

				var opts = elem.querySelectorAll("option");
				for(var i=0; i<opts.length; i++)
				{	
					if(this.settings.resetPrevious)
						this.dropChildItemProps(opts[i]);
					this.setChildItemProps(opts[i]);
				}

				for(var i=0; i<this.parent.length; i++) // assing to its parent the id of current elem becuase it filters this elem
					this.parent[i].setAttribute(this.attributes.elemFilters, chfid);

				this.setHolderAttributes(elem);
			}

			ChoiceFilter.prototype.disconnectPreviousParent = function(elemId)
			{
				var parents = document.querySelectorAll(this.getAttrEq(this.attributes.elemFilters, elemId));
				for(var i=0; i<parents.length; i++)
					parents[i].removeAttribute(this.attributes.elemFilters);
			}

			//initializing checkboxes and radios
			ChoiceFilter.prototype.initParentInput = function() {

				var chfid;
				var elem = this.parent[0]; 

				// if 0?
				var was_inited = elem.hasAttribute(this.attributes.elemId);
				if(!was_inited)
					chfid = this.generateId();
				else
					chfid = elem.getAttribute(this.attributes.elemId);
				
				// multi inits??
				for(var i = 0; i < this.parent.length; i++)
				{
					//todo stop adding many times
					if(!this.parent[i].hasAttribute(this.attributes.elemFilters))
						this.addChangeListener(this.parent[i]);
					this.parent[i].setAttribute(this.attributes.elemId, chfid);

					if(this.settings.resetPrevious)
						this.dropParentItemProps(this.parent[i]);
					this.setParentItemProps(this.parent[i]);
				}

				this.generateElemListValueHolder(elem, chfid);
			}

			ChoiceFilter.prototype.initChildInputItems = function(){

				var chfid;
				var elem = this.child[0];

				var was_inited = elem.hasAttribute(this.attributes.elemId);

				if(!was_inited)
					chfid = this.generateId();
				else
				{
					chfid = elem.getAttribute(this.attributes.elemId);
					this.disconnectPreviousParent(chfid);
				}

				for(var i=0; i<this.child.length; i++)
				{
					this.child[i].setAttribute(this.attributes.elemId, chfid); // this will connect to their parents
					this.setChildItemProps(this.child[i]);
				}

				for(var i=0; i<this.parent.length; i++)
					this.parent[i].setAttribute(this.attributes.elemFilters, chfid); // this will connect to their childs

				var itemListValHolder = this.generateElemListValueHolder(this.child[0], chfid);
				this.setHolderAttributes(itemListValHolder[0]);
			}

			ChoiceFilter.prototype.setParentItemProps = function(item) {
					
				var itemVal = item.getAttribute("value");
				this.setBinaryAttr(item, this.settings.ignoreParentValues, itemVal, this.attributes.elemIgnoreValue);
			}

			ChoiceFilter.prototype.setChildItemProps = function(item) {
					
				var itemVal = item.getAttribute("value");
			

				this.setBinaryAttr(item, this.settings.independentChoices, itemVal, this.attributes.elemIndependent);
				this.setBinaryAttr(item, this.settings.presentOnEveryParent, itemVal, this.attributes.elemPresentOnEveryParent);
				this.setBinaryAttr(item, this.settings.autoSelectedChoicesAfterFilter, itemVal, this.attributes.elemSelectAfterFilter);

				if(this.data.hasOwnProperty(itemVal))
					this.data[itemVal] = this.data[itemVal].concat(this.settings.showAllChildChoicesWhen);
				else
					this.data[itemVal] = this.settings.showAllChildChoicesWhen;

				if(this.data.hasOwnProperty(itemVal) && this.data[itemVal].length > 0)
					item.setAttribute(this.attributes.elemDependsOn, this.data[itemVal]);
			}

			ChoiceFilter.prototype.dropParentItemProps = function(item) {

				item.removeAttribute(this.attributes.elemIgnoreValue); 
			}

			ChoiceFilter.prototype.dropChildItemProps = function(item) {

				item.removeAttribute(this.attributes.elemDependsOn); 
				item.removeAttribute(this.attributes.elemIndependent); 
				item.removeAttribute(this.attributes.elemPresentOnEveryParent); 
				item.removeAttribute(this.attributes.elemSelectAfterFilter); 
			}

			ChoiceFilter.prototype.setHolderAttributes = function(item) {
				
				if(this.settings.dataOnly !== true)
				{
					item.removeAttribute(this.attributes.elemWrapper); 
					if(this.settings.wrapperSelector != this.defaults.wrapperSelector)
						item.setAttribute(this.attributes.elemWrapper, this.settings.wrapperSelector);

					item.removeAttribute(this.attributes.elemValueDelimiter); 
					if(this.settings.valueDelimiter != this.defaults.valueDelimiter)
						item.setAttribute(this.attributes.elemValueDelimiter, this.settings.valueDelimiter);

					item.removeAttribute(this.attributes.elemHolderControls); 
					if(this.settings.parentControlsVisibilityOf != this.defaults.parentControlsVisibilityOf)
						item.setAttribute(this.attributes.elemHolderControls, this.settings.parentControlsVisibilityOf);
				}
			}

			ChoiceFilter.prototype.mapData = function(data) {

				var mapped = [];
				for(parent_val in data) 
		    		if(data.hasOwnProperty(parent_val))
		    			for(var i=0; i<data[parent_val].length; i++)
		    				{
		    					if(mapped.hasOwnProperty(data[parent_val][i]))
		    						mapped[data[parent_val][i]].push(parent_val);
		    					else
		    						mapped[data[parent_val][i]] = [parent_val];
		    				}
				return mapped;
			}

			ChoiceFilter.prototype.generateId = function() {
				
				if ( typeof ChoiceFilter.chfid == 'undefined' )
				        ChoiceFilter.chfid = 0;
				ChoiceFilter.chfid++;
				return ChoiceFilter.chfid;
			}
			
			ChoiceFilter.prototype.generateElemListValueHolder = function(elem,chfid) {
				
				var holder = elem.parentNode.querySelectorAll("input" + this.getAttrEq(this.attributes.elemListValueHolder, chfid)); //td
				if(holder.length === 0)
				{
					holder = document.createElement('input');
					holder.style.display = 'none';
					holder.setAttribute("type","text");
					holder.setAttribute("disabled","disabled");
					holder.setAttribute(this.attributes.elemListValueHolder, chfid);
					elem.parentNode.insertBefore(holder, elem);
				}
				return (holder instanceof HTMLElement ? [holder] : holder);
			}

			ChoiceFilter.prototype.addChangeListener = function(elem) {
				
				var self = this;
				var listener = function(el){ 
				    self.valueHandler(this);
				  	self.filter(this);
				  	el.preventDefault(); 
			   	};
				elem.addEventListener('change', listener , false);
			}

			// on change zone
			ChoiceFilter.prototype.filter = function (elem) {

				if(this.hasDependent(elem))
	        	{
	             	var dependent = this.getDependent(elem);
	             	switch (dependent.type)  //target type
	             	{
		                case "select-one":
		                case "select-multiple":
							 this.filterSelectItems(dependent, elem);
		                    break;
		                case "radio":
		                case "checkbox":  	
		                   	this.filterInputItems(dependent, elem);
		                    break;
	           		 }
	           		 this.filter(dependent);
	        	}
			}
			
			ChoiceFilter.prototype.filterSelectItems = function(elem, parent) {

				 var parent_val = this.getValueType(parent);
				 var holderProps = this.getHolderProps(elem);
				 this.controledElems(holderProps, parent_val);

				 var opts = elem.querySelectorAll('option');
				 var nextVal = '';
				 var resetVal = true;
				 for(var i=0; i<opts.length; i++)
				 {
			 		var itemInfo = this.getStyle(opts[i], parent_val, holderProps.delimiter);
			 		opts[i].style.display = itemInfo.style;
			 		opts[i].disabled = itemInfo.disabled;

			 		if(holderProps.hasWrapper)
			 		{
			 			this.closest(opts[i], holderProps.wrapper).style.display = itemInfo.style;
				 		//opts[i].closest(holderProps.wrapper).style.display = itemInfo.style;
			 		}

			 		if(itemInfo.isNotActive)
				 		opts[i].selected = false;
				 	else if(elem.value == opts[i].value) // when the element is active and is the same with current value of its holder then it should be stay selected
				 		resetVal = false;

				 	if(nextVal == '' && itemInfo.style == '' && this.attrEnabled(opts[i], this.attributes.elemSelectAfterFilter))
	 					nextVal = opts[i].getAttribute("value"); 
				 }

				 if(resetVal)
				 	elem.value = nextVal; 
			}

			ChoiceFilter.prototype.filterInputItems = function(elem, parent) {

				 var parent_val = this.getValueType(parent);

				 var this_id = elem.getAttribute(this.attributes.elemId); 
				
		    	 var elems = document.querySelectorAll("input" + this.getAttrEq(this.attributes.elemId, this_id)); // all with same id
				
				 var elem_helper = elems[0].parentNode.querySelectorAll("input"+this.getAttrEq(this.attributes.elemListValueHolder, this_id));
		
	 			 var holderProps = this.getHolderProps(elem_helper[0]);

	 			 this.controledElems(holderProps, parent_val);

				 for(var i=0; i<elems.length; i++)
				 {
				 	var itemInfo = this.getStyle(elems[i], parent_val, holderProps.delimiter);

					if(elems[i].hasAttribute("id"))
					{
						var lab = document.querySelectorAll('label[for="'+elems[i].getAttribute("id")+'"]'); //todo how should be arrned to not use doc
						if(lab.length>0)
							lab[0].style.display = itemInfo.style;
					}
			
					elems[i].style.display = itemInfo.style;

					if(itemInfo.isNotActive)
				 		elems[i].checked = false;
				 	else if(this.attrEnabled(elems[i], this.attributes.elemSelectAfterFilter))
				 		elems[i].checked = true;

				 	if(holderProps.hasWrapper)
				 	{
				 		this.closest(elems[i], holderProps.wrapper).style.display = itemInfo.style;
				 		// elems[i].closest(holderProps.wrapper).style.display = itemInfo.style;
				 	}
				}

				elem_helper[0].setAttribute(this.attributes.elemValueHolder,""); //  promis in parent check if found
			}


			ChoiceFilter.prototype.getHolderProps = function(elem){

				 var hasWrapper = elem.hasAttribute(this.attributes.elemWrapper);
				 var wrapper = elem.getAttribute(this.attributes.elemWrapper);
				 var delimiter = elem.hasAttribute(this.attributes.elemValueDelimiter) ? elem.getAttribute(this.attributes.elemValueDelimiter) : this.defaults.valueDelimiter;
				 var controlElem = elem.hasAttribute(this.attributes.elemHolderControls) ? elem.getAttribute(this.attributes.elemHolderControls) : this.defaults.parentControlsVisibilityOf;
				 return { hasWrapper:hasWrapper,wrapper:wrapper,delimiter:delimiter,controlElem : controlElem }; //valAfterFilt:valAfterFilt
			}

			ChoiceFilter.prototype.hasDependent = function(elem) {

				return elem.hasAttribute(this.attributes.elemFilters);
			}

			ChoiceFilter.prototype.getDependent = function(elem) {

				var child = elem.getAttribute(this.attributes.elemFilters);
			    return document.querySelectorAll(this.getAttrEq(this.attributes.elemId, child))[0];
			}

			// tracks the actual value of all selected item/items in radio/checkboxes 
			ChoiceFilter.prototype.valueHandler = function(elem) {

				switch (elem.type) 
				{ 
	                case "radio":
	                case "checkbox":  	
						var value = [];	
						var id = elem.getAttribute(this.attributes.elemId); 
						var elems = document.querySelectorAll("input"+this.getAttrEq(this.attributes.elemId, id));  
						for(var i=0; i<elems.length; i++)
	       					if(elems[i].checked)
	       						value.push(elems[i].getAttribute("value"));

	           			elems[0].parentNode.querySelectorAll("input"+this.getAttrEq(this.attributes.elemListValueHolder, id))[0].setAttribute(this.attributes.elemValueHolder,value.join());//  promis in parent check if found
	                break;
	           	}
			}

			ChoiceFilter.prototype.getValueType = function(elem) {

				var values = [];
				switch (elem.type) { 
		                case "select-one":
		                case "select-multiple":
							 var options = elem && elem.options;
							 var opt;
							 for (var i=0, iLen=options.length; i<iLen; i++) {
							    opt = options[i];
							    if (opt.selected && !this.attrEnabled(opt, this.attributes.elemIgnoreValue))
							      values.push(opt.value);
							 }  
		                case "radio":
		                case "checkbox":  
		                	var id = elem.getAttribute(this.attributes.elemId);
			    			var elems = document.querySelectorAll(this.getAttrEq(this.attributes.elemId, id));
	                		for(var i=0; i<elems.length; i++)
           					{
           						if(elems[i].checked && !this.attrEnabled(elems[i], this.attributes.elemIgnoreValue))
           							values.push(elems[i].getAttribute("value"));
           					}
		                break;
	           	}
	            return values;
			};
			
			ChoiceFilter.prototype.getStyle = function(elem, parent_val, delimiter) {

				//isNotActive means if it was enabled than hide
				var style = '';
				var disabled = true;
				var isNotActive = false;
				
		 		if( this.attrEnabled(elem, this.attributes.elemIndependent)
		 			||
		 			(parent_val.length > 0 && this.attrEnabled(elem, this.attributes.elemPresentOnEveryParent)))
		 			return { style:style, isNotActive:isNotActive };

		 		style = 'none';
		 		isNotActive = true;

			 	if(elem.hasAttribute(this.attributes.elemDependsOn))
			 	{
			 		var dependent_from_arr = elem.getAttribute(this.attributes.elemDependsOn);
			 		dependent_from_arr = dependent_from_arr.split(delimiter);
				 	for(var j=0; j < dependent_from_arr.length; j++)
					{
						//if(parent_val.includes(dependent_from_arr[j]))
						if(parent_val.indexOf(dependent_from_arr[j]) > -1)
						{
							style = '';
							isNotActive = false;
							disabled = false;
							break;
						}
					}
			 	}
				return { style:style, isNotActive:isNotActive, disabled : disabled };
			}

			ChoiceFilter.prototype.extend= function extend(to, from) {
				
			    for(var key in from)
			        if(from.hasOwnProperty(key))
			            	to[key] = from[key];
			    return to;
			}

			ChoiceFilter.prototype.attrEnabled = function(elem,attr) {
				return parseInt(elem.getAttribute(attr)) === 1
			}

			ChoiceFilter.prototype.setBinaryAttr = function(elem, array, value, attr) {
				
				if(this.settings.dataOnly && array.length === 0) // when data added but the given option was not provided, dont touch parent/child attributes
					return;

				if(array.indexOf(value) > -1)
					elem.setAttribute(attr, 1);
				else
					elem.setAttribute(attr, 0);
			}

			ChoiceFilter.prototype.parseValueToArray  = function(value) {

				if (!(value instanceof Array))
			    		value = [value]; // if a single value sent convert it to 

			    if (value.length > 0)
			    	value = value.join().split(',');  // convert to strings 

			    return value;
			}

			ChoiceFilter.prototype.controledElems = function(holderProps, parent_val)
			{	
				if(holderProps.controlElem !== this.defaults.parentControlsVisibilityOf)
	 			 {
	 			 	var style = (parent_val.length === 0) ? 'none' : '';
	 			 	var toChange =  document.querySelectorAll(holderProps.controlElem);
	 			 	for(var i =0; i<toChange.length;i++)
	 			 			toChange[i].style.display = style;
	 			 }
			}

			ChoiceFilter.prototype.getAttrEq = function(attr, val)
			{	
				return "["+attr + "='"+val+"']";
		    }

		    // added for compatability
		    // should be removed asap  closest will be supportede by ie

		    ChoiceFilter.prototype.closest = function(elem, selector)
		    {
		    	var ep = Element.prototype;
				ep.matches = ep.matches || ep.webkitMatchesSelector || ep.msMatchesSelector || ep.mozMatchesSelector;
				while (elem !== document.body) 
				{
			        elem = elem.parentElement;
			        if (elem.matches(selector)) return elem;
				}
		    }
		   