//This still works in IE 11.

(function (){
	
	"use strict";
	
	let context = this,
		oldClass = context.Class,
		_initializing = false;
	
	/*** helper functions ***/
	
	function defineProperty(object, propertyName, value, isWritable, isEnumerable, isConfigurable){
		Object.defineProperty(object, propertyName, { value:value, writable:!!isWritable, enumerable:!!isEnumerable, configurable:!!isConfigurable });
	}
	function isPrimitive(o){ var t; return o===t || o===null || (t = typeof o)==="number" || t==="string" || t==="boolean"; }
	function warn(msg){
		if(window.console){
			if(typeof window.console.warn === "function") window.console.warn(msg);
			else if(typeof window.console.log === "function") window.console.log(msg);
		}
	}
	
	/*** base class ***/
	
	//the base Class constructor; it will have two static methods, 'extend' and 'noConflict'
	function Class(){}
	
	defineProperty(Class.prototype, "toString", function toString(){ return "[instance of Class]"; }, true, false, true);
	defineProperty(Class, "toString", function toString(){ return "function Class() { [custom code] }"; }, true, false, true);
	
	
	/**
	 * Creates a new class that inherits from the parent class.
	 * 
	 * @param {object} [options]
	 * @param {string} [options.className] - Used as .name for the class function and in .toString() for instances of the class.
	 * @param {function} [options.constructorFn] - Initializes new instances of the class. A function is passed as the first argument, used to initialize the instance using the parent class' constructor; be sure to call it inside constructorFn (before using `this` or protected members).
	 * @param {function} [options.returnFn] - Returns a value when the constructor is called without using the 'new' keyword.
	 * @param {object} [options.extensions] - Additional and overriding properties and methods for the prototype of the class.
	 * @return {function} - The new class.
	 */
	let extendFn = function extend(options){
		
		if(options === void 0) options = {};
		else if(isPrimitive(options)) throw new TypeError("argument 'options' is not an object");


		function classNameIsValid(className){
		//checks if the specified classname is valid (note: this doesn't check for reserved words)
			return className !== (void 0) && /^[a-z_$][a-z0-9_$]*$/i.test(className);
		}
		
		/*** create the new constructor ***/

		let constructorFn = typeof(options.constructorFn) === "function" ? options.constructorFn : function (Super){ Super.apply(null, [].slice.call(arguments, 1)); };
		let returnFn = typeof(options.returnFn) === "function" ? options.returnFn : function (){};

		let newClass = function Class(){
			
			if(this && this instanceof newClass && (this.constructor === newClass.prototype.constructor || _initializing)){
			//A new instance is being created; initialize it.
			//This condition will be true in these cases:
			//  1) The 'new' operator was used to instantiate this class
			//  2) The 'new' operator was used to instantiate a subclass, and the subclass' constructorFn() calls its first argument (the bound superFn)
			//  3) The 'new' operator was used to instantiate a subclass, and the subclass' constructorFn() includes something like `MySuperClass.call(this)`
			//  4) Possibly if the prototype chain has been screwed with

				let newInstance = this,
					className = newClass.name,
					_protected,
					superFn,
					superFnCalled;

				if(newInstance.constructor === newClass.prototype.constructor){
				//this function is the constructor of the new instance (i.e., it's not a parent class' constructor)
					
					defineProperty(newInstance, "constructor", newClass, true, false, true);
				}

				superFn = function (){
					
					if(superFnCalled) return;	//don't initialize it more than once
					superFnCalled = true;
					
					_protected = newClass.prototype.constructor.apply(newInstance, arguments) || {};
					
					//add the protected getters/setters to superFn
					for(name in _protected){
						if(Object.prototype.hasOwnProperty.call(_protected, name)){
							Object.defineProperty(superFn, name, {
								get:(_protected[name].get ? _protected[name].get.bind(newInstance) : void 0),
								set:(_protected[name].set ? _protected[name].set.bind(newInstance) : void 0),
								enumerable:true, configurable:true
							});
						}
					}
					
					/**
					 * Stores a getter and a setter (at least one, if not both), allowing a subclass' constructorFn to access a variable or function that is inside this class' constructorFn.
					 *
					 * @param {string} name
					 * @param {function} [getter]
					 * @param {function} [setter]
					 */
					Object.defineProperty(superFn, "addProtectedMember", {
						 value: function addProtectedMember(name, getter, setter){
							if(name === (void 0) || ""+name === "") throw new TypeError("argument 'name' is required");
							if(getter !== (void 0) && typeof(getter) !== "function") throw new TypeError("argument 'getter' is not a function");
							if(setter !== (void 0) && typeof(setter) !== "function") throw new TypeError("argument 'setter' is not a function");
							if(!getter && !setter) return;
							
							_protected[name] = {get:getter, set:setter};
						},
						writable:false, enumerable:false, configurable:true
					});
					
					/**
					 * Removes a stored getter & setter, preventing a subclass' constructorFn from accessing the (now private) member.
					 *
					 * @param {string} name
					 */
					Object.defineProperty(superFn, "removeProtectedMember", {
						 value: function addProtectedMember(name){
							if(name === (void 0) || ""+name === "") throw new TypeError("argument 'name' is required");
							
							delete _protected[name];
						},
						writable:false, enumerable:false, configurable:true
					});
					
				}
		
				_initializing = true;
				//constructorFn.apply(newInstance, [superFn].concat([].slice.call(arguments)));
				constructorFn.bind(newInstance, superFn).apply(null, arguments);
				_initializing = false;
				
				if(!superFnCalled) warn(className+" constructor does not include a call to the 'Super' argument");
				
				if(newInstance.constructor !== newClass){
				//this function is the constructor of a super-class
					
					return _protected;
				}
				//else return this
				
			}
			else{
			//the 'new' operator was not used; it was just called as a function

				return returnFn.apply(null, arguments);

			}
			
		}
		
		//override .name
		defineProperty(newClass, "name", 
			classNameIsValid(options.className) ? options.className : classNameIsValid(this.name) ? this.name /*parent class' name*/ : "Class", 
			false, false, true);
		
		//override .toString()
		defineProperty(newClass, "toString", function toString(){ return "function Class() { [custom code] }"; }, true, false, true);

		if(this.extend === extendFn){
		//the 'extend' method of the parent class was not modified
			
			//make extend() a static method of the new class
			defineProperty(newClass, "extend", extendFn, true, false, true);
		}

		
		/*** create the new prototype ***/

		//An uninitialized instance of the parent class will be the prototype of the new class.
		//To create an instance without initializing it, we'll temporarily use an empty function as the constructor.
		let emptyFn = function (){};
		emptyFn.prototype = this.prototype;
		let newPrototype = new emptyFn();
		defineProperty(newPrototype, "constructor", this, true, false, true);
		
		//override .toString()
		defineProperty(newPrototype, "toString", 
			function toString(){
				if(this.constructor.name !== (void 0) && /^[a-z_$][a-z0-9_$]*$/i.test(this.constructor.name)){
					return "[instance of "+this.constructor.name+"]";
				}
				return "[instance of Class]";
			}, 
			true, false, true);

		defineProperty(newClass, "prototype", newPrototype, false, false, false);
		
		
		/*** add the new & overriding properties to the prototype ***/

		for(name in options.extensions){
			if(Object.prototype.hasOwnProperty.call(options.extensions, name)){
				newPrototype[name] = options.extensions[name];
			}
		}
		
		
		return newClass;

	}
	
	defineProperty(extendFn, "toString", function toString(){ return "function extend() { [custom code] }"; }, true, false, true);
	
	//make extend() a static method of Class
	defineProperty(Class, "extend", extendFn, true, false, true);
	
	
	
	/**
	 * Restores 'Class' to what it was before this script replaced it.
	 * 
	 * @return {function} - The base Class constructor.
	 */
	function noConflict(){
		
		if(context) context.Class = oldClass;
		context = null;
		
		return Class;
		
	}
	//make noConflict() a static method of Class
	defineProperty(Class, "noConflict", noConflict, true, false, true);
	
	
	
	context.Class = Class;
	
}).call(window);
