/* eslint-env es6 */
// https://github.com/wizard04wsu/Class

(function (){
	
	"use strict";
	
	let _initializing = false;
	
	
	/*** helper functions ***/
	
	function defineProperty(object, propertyName, value, isWritable, isEnumerable, isConfigurable){
		Object.defineProperty(object, propertyName, { value:value, writable:isWritable, enumerable:isEnumerable, configurable:isConfigurable });
	}
	function isPrimitive(o){ let t = typeof o; return (t !== "object" && t !== "function" ) || o === null; }
	function warn(msg){ if(window && window.console) (window.console.warn || window.console.log)(msg); }
	
	function classNameIsValid(className){
	//checks if the specified classname is valid (note: this doesn't check for reserved words)
		return className !== (void 0) && /^[a-z_$][a-z0-9_$]*$/i.test(className);
	}
	
	
	/*** shared functions ***/
	
	function _constructorFn(Super){ Super.apply(null, [].slice.call(arguments, 1)); }
	function _emptyFn(){}
	let _classToString = function toString(){ return "function Class() { [custom code] }"; };
	let _instanceToString = function toString(){
		if(classNameIsValid(this.constructor.name)) return "[instance of "+this.constructor.name+"]";
		return "[instance of Class]";
	};
	let _extendToString = function toString(){ return "function extend() { [custom code] }"; };

	//Stores a getter and a setter (at least one, if not both), allowing a subclass' constructorFn to access a variable or function that is inside the new class' constructorFn.
	function addProtectedMember(constructed, protectedObj, name, getter, setter){
		if(constructed) throw new Error("protected members cannot be added outside of the constructor");	//in case the function is referenced elsewhere
		if(name === (void 0) || ""+name === "") throw new TypeError("argument 'name' is required");
		if(getter !== (void 0) && typeof(getter) !== "function") throw new TypeError("argument 'getter' is not a function");
		if(setter !== (void 0) && typeof(setter) !== "function") throw new TypeError("argument 'setter' is not a function");
		if(!getter && !setter) return;

		protectedObj[name] = {get:getter, set:setter};
	}

	//Removes a stored getter & setter, preventing a subclass' constructorFn from accessing the (now private) member.
	function removeProtectedMember(constructed, protectedObj, name){
		if(constructed) throw new Error("protected members cannot be removed outside of the constructor");	//in case the function is referenced elsewhere
		if(name === (void 0) || ""+name === "") throw new TypeError("argument 'name' is required");

		delete protectedObj[name];
	}

	
	/*** base class ***/
	
	//the base Class constructor; it will have two static methods, 'extend' and 'noConflict'
	function Class(){}
	
	defineProperty(Class.prototype, "toString", _instanceToString, true, false, true);
	defineProperty(Class, "toString", _classToString, true, false, true);
	
	
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


		/*** create the new constructor ***/

		let constructorFn = typeof(options.constructorFn) === "function" ? options.constructorFn : _constructorFn;
		let returnFn = typeof(options.returnFn) === "function" ? options.returnFn : _emptyFn;

		let newClass = function Class(){
			
			if(this && this instanceof newClass && (this.constructor === newClass.prototype.constructor || _initializing)){
			//A new instance is being created; initialize it.
			//This condition will be true in these cases:
			//  1) The 'new' operator was used to instantiate this class
			//  2) The 'new' operator was used to instantiate a subclass, and the subclass' constructorFn() calls its first argument (the bound superFn)
			//  3) The 'new' operator was used to instantiate a subclass, and the subclass' constructorFn() includes something like `MySuperClass.call(this)`
			//  4) Possibly if the prototype chain has been screwed with

				let newInstance = this;

				if(newInstance.constructor === newClass.prototype.constructor){
				//this function is the constructor of the new instance (i.e., it's not a parent class' constructor)
					
					defineProperty(newInstance, "constructor", newClass, true, false, true);
				}

				let _protected,
					superFnCalled = false,
					constructed = false;
				let superFn = function Super(){
					
					if(superFnCalled) return;	//don't initialize it more than once
					superFnCalled = true;
					
					//initialize the instance using the parent class
					_protected = newClass.prototype.constructor.apply(newInstance, arguments) || {};
					
					//add the protected getters/setters to superFn
					let name;
					for(name in _protected){
						if(Object.prototype.hasOwnProperty.call(_protected, name)){
							Object.defineProperty(superFn, name, {
								get:(_protected[name].get ? _protected[name].get.bind(newInstance) : void 0),
								set:(_protected[name].set ? _protected[name].set.bind(newInstance) : void 0),
								enumerable:true, configurable:true
							});
						}
					}
					
					defineProperty(superFn, "addProtectedMember", addProtectedMember.bind(null, constructed, _protected), false, false, true);
					defineProperty(superFn, "removeProtectedMember", removeProtectedMember.bind(null, constructed, _protected), false, false, true);
					
				}
		
				let className = newClass.name;	//store the provided class name in case the constructor changes the .name attribute
				
				//construct the new instance
				_initializing = true;
				//constructorFn.bind(newInstance, superFn).apply(null, arguments);
				constructorFn.apply(newInstance, [superFn].concat([].slice.call(arguments)));	//(This method doesn't create another new function every time a constructor is run.)
				_initializing = false;
				
				constructed = true;
				
				if(!superFnCalled) warn(className+" constructor does not include a call to the 'Super' argument");
				
				if(newInstance.constructor === newClass){
				//this function is the constructor of the new instance
					
					//In case the 'Super' argument gets referenced elsewhere, remove these since they're not allowed to be used outside of the constructor anyway.
					delete superFn.addProtectedMember;
					delete superFn.removeProtectedMember;
				}
				else{
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
		defineProperty(newClass, "toString", _classToString, true, false, true);

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
		emptyFn = null;
		emptyFn = null;
		defineProperty(newPrototype, "constructor", this, true, false, true);
		
		//override .toString()
		defineProperty(newPrototype, "toString", _instanceToString, true, false, true);

		defineProperty(newClass, "prototype", newPrototype, false, false, false);
		
		
		/*** add the new & overriding properties to the prototype ***/

		let name;
		for(name in options.extensions){
			if(Object.prototype.hasOwnProperty.call(options.extensions, name)){
				newPrototype[name] = options.extensions[name];
			}
		}
		
		
		return newClass;

	}
	
	defineProperty(extendFn, "toString", _extendToString, true, false, true);
	
	//make extend() a static method of Class
	defineProperty(Class, "extend", extendFn, true, false, true);
	
	
	
	let context = this,
		oldClass = context.Class;
	
	/**
	 * Restores 'Class' to what it was before this script replaced it.
	 * 
	 * @return {function} - The base Class constructor.
	 */
	function noConflict(){
		context.Class = oldClass;
		context = oldClass = null;
		delete Class.noConflict;
		return Class;
	}
	//make noConflict() a static method of Class
	defineProperty(Class, "noConflict", noConflict, true, false, true);
	
	
	
	context.Class = Class;
	
}).call(window);
