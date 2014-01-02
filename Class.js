//Class.extend([options])	//create a new class that inherits from this class
//`options` argument (optional) must be an object. Possible options:
//	className:		string used in .toString() for the prototype and instances of the new class
//					if not specified, it will be the same as the super-class
//	init:			function used to initialize a new instance of the class
//	extensions:		object containing additional/overriding properties and methods for the prototype of the new class
//	ret:			function used to return a value when Class() is called without the `new` keyword
//	returnInstance:	if `true` and the `ret` option is not specified, a new instance will be returned when Class() is called without the `new` operator
//					 (as if the `new` operator _had_ been used)
//
//Class.noConflict([newContext])	//restore `Class` to what it was before this script replaced it, optionally providing a new context

(function (){
	
	"use strict";
	
	var context = this,
		oldClass = context.Class,
		_initializing = false;
	
	function Class(){}
	
	Class.prototype.toString = function toString(){ return "[object Class]"; };
	Class.toString = function toString(){ return "function Class() { [custom code] }"; };
	
	//method for creating a new class that inherits from this class
	//`options` argument (optional) must be an object. Possible options:
	//	className:		string used in .toString() for the prototype and instances of the new class
	//					if not specified, it will be the same as the super-class
	//	init:			function used to initialize a new instance of the class
	//	extensions:		object containing additional/overriding properties and methods for the prototype of the new class
	//	ret:			function used to return a value when Class() is called without the `new` keyword
	//	returnInstance:	if `true` and the `ret` option is not specified, a new instance will be returned when Class() is called without the `new` operator
	//					 (as if the `new` operator _had_ been used)
	Class.extend = function extend(options){
		var emptyFn, newPrototype, className, name, initFn, retFn;
		
		options = options || {};
		
		/*** create the new prototype ***/
		
		//an uninitialized instance of the super-class will be the prototype of the sub-class
		//to create an instance without initializing it, we'll use an empty function as the constructor
		emptyFn = function (){};
		emptyFn.prototype = this.prototype;
		newPrototype = new emptyFn();
		newPrototype.constructor = this;
		
		className = options.className;
		if(className){
			newPrototype.toString = function toString(){ return "[object "+className+"]"; };	//override .toString()
		}
		
		/*** add the new/overriding methods & properties to the prototype ***/
		
		if(options.extensions){
			for(name in options.extensions){
				if(Object.prototype.hasOwnProperty.call(options.extensions, name)){
					newPrototype[name] = options.extensions[name];
				}
			}
		}
		//note: the properties and methods of these extensions can still be modified if the extensions are referenced elsewhere
		
		/*** create the new class ***/
		
		if(typeof(options.init) === "function"){
			initFn = options.init;	//reference the function locally so it can't be replaced
									//(although its properties and methods can still be modified if the function is referenced elsewhere)
		}
		
		if(typeof(options.ret) === "function"){
			retFn = options.ret;	//reference the function locally so it can't be replaced
									//(although its properties and methods can still be modified if the function is referenced elsewhere)
		}
		else if(options.returnInstance === true){
			retFn = function (){
				var args, i, argList;
				
				//return an instance of the class (as if the `new` operator _had_ been used)
				try{
					//this will only work if the browser supports binding natively
					//a workaround using apply() will not suffice since apply() is not a constructor
					return new (Function.prototype.bind.apply(this, [null].concat(Array.prototype.slice.call(arguments))))();
				}catch(e){
					//use eval() instead
					args = Array.prototype.slice.call(arguments);
					if(args.length){
						argList = "args[0]";
						for(i=1; i<args.length; i++){
							argList += ",args["+i+"]";
						}
						return eval("new this("+argList+")");
					}
					else{
						return eval("new this()");
					}
				}
			};
		}
		
		function Class(){
			if(this && this instanceof Class && (this.constructor === Class.prototype.constructor || _initializing)){	//a new instance is being created; initialize it
												//this condition will be true in these cases:
												//  1) the `new` operator was used to instantiate this class
												//  2) the `new` operator was used to instantiate a subclass, and the subclass's init() function
												//     includes something like `MySuperClass.call(this)`
												//  3) possibly if the prototype chain has been screwed with
				
				if(this.constructor === Class.prototype.constructor){	//this function is the constructor of the new instance (not of a super-class)
					this.constructor = Class;
				}
				
				if(initFn){
					_initializing = true;
					initFn.apply(this, arguments);
					_initializing = false;
				}
				
			}
			else{	//the `new` operator was not used; it was just called as a function
				
				if(retFn){	//a return function was provided or a new instance should be returned
					return retFn.apply(Class, arguments);
				}
				//else return `undefined`
				
			}
		}
		Class.prototype = newPrototype;
		Class.toString = function toString(){ return "function Class() { [custom code] }"; };
		
		Class.extend = this.extend;	//make extend() a method of the new class
		
		return Class;
	};
	
	Class.noConflict = function noConflict(newContext){
		if(context){
			context.Class = oldClass;
		}
		
		if(newContext){
			oldClass = newContext.Class;
			newContext.Class = this;
		}
		
		context = newContext;
		
		return this;
	};
	
	context.Class = Class;
	
}).call(this);
