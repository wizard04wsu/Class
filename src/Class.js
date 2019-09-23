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
	function warn(msg){ if(console) (console.warn || console.log)(msg); }
	
	function classNameIsValid(className){
	//checks if the specified classname is valid (note: this doesn't check for reserved words)
		return className !== (void 0) && /^[a-z_$][a-z0-9_$]*$/i.test(className);
	}
	
	
	/*** shared functions ***/
	
	function _constructorFn(Super){ Super.apply(null, [].slice.call(arguments, 1)); }
	function _emptyFn(){}
	let _classToString = function toString(){ return "function Class() { [custom code] }"; };
	let _instanceToString = function toString(){
		return "[instance of "+(classNameIsValid(this.constructor.name) ? this.constructor.name : "Class")+"]";
	};
	let _extendToString = function toString(){ return "function extend() { [custom code] }"; };

	//Stores a getter and/or setter, or removes them. The getter/setter allows a subclass' constructorFn to access a variable or function that is inside the new class' constructorFn.
	function _defineProtectedMember(protectedObj, name, options){
		if(!_initializing) throw new Error("protected members cannot be added or removed outside of the constructor");	//in case the function is referenced elsewhere
		if(name === (void 0) || ""+name === "") throw new TypeError("argument 'name' is required");
		
		options = new Object(options);
		if(options.get !== (void 0) && typeof(options.get) !== "function") throw new TypeError("option 'get' is not a function");
		if(options.set !== (void 0) && typeof(options.set) !== "function") throw new TypeError("option 'set' is not a function");
		if(!options.get && !options.set){
			delete protectedObj[name];
		}
		else{
			protectedObj[name] = { get: options.get, set: options.set };
		}
	}

	
	/*** base class ***/
	
	//the base Class constructor; it will have two static methods, 'extend' and 'noConflict'
	let _baseClass = function Class(){}
	
	defineProperty(_baseClass.prototype, "toString", _instanceToString, true, false, true);
	defineProperty(_baseClass, "toString", _classToString, true, false, true);
	
	
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
	let _extendFn = function extend(options){
		
		if(options === void 0) options = {};
		else if(isPrimitive(options)) throw new TypeError("argument 'options' is not an object");


		/*** create the new constructor ***/

		let $constructorFn = typeof(options.constructorFn) === "function" ? options.constructorFn : _constructorFn;
		let $returnFn = typeof(options.returnFn) === "function" ? options.returnFn : _emptyFn;
		let $warnedAboutSuper = false;

		let newClass = function Class(){
			
			if(this && this instanceof newClass && (this.constructor === newClass.prototype.constructor || _initializing)){
			//A new instance is being created; initialize it.
			//This condition will be true in these cases:
			//  1) The 'new' operator was used to instantiate this class
			//  2) The 'new' operator was used to instantiate a subclass, and the subclass' $constructorFn() calls its first argument (the bound superFn)
			//  3) The 'new' operator was used to instantiate a subclass, and the subclass' $constructorFn() includes something like `MySuperClass.call(this)`
			//  4) Possibly if the prototype chain has been manipulated

				let newInstance = this;

				if(newInstance.constructor === newClass.prototype.constructor){
				//this function is the constructor of the new instance (i.e., it's not a parent class' constructor)
					
					defineProperty(newInstance, "constructor", newClass, true, false, true);
				}

				let protectedMembers,
					superFnCalled = false;
				let superFn = function Super(){
					
					if(superFnCalled) return;	//don't initialize it more than once
					superFnCalled = true;
					
					//initialize the instance using the parent class
					protectedMembers = newClass.prototype.constructor.apply(newInstance, arguments) || {};
					
					//add the protected getters/setters to superFn
					for(let name in protectedMembers){
						if(Object.prototype.hasOwnProperty.call(protectedMembers, name)){
							Object.defineProperty(superFn, name, {
								get:(protectedMembers[name].get ? protectedMembers[name].get.bind(newInstance) : void 0),
								set:(protectedMembers[name].set ? protectedMembers[name].set.bind(newInstance) : void 0),
								enumerable:true, configurable:true
							});
						}
					}
					
					defineProperty(superFn, "defineProtectedMember", _defineProtectedMember.bind(null, protectedMembers), false, false, true);
					
				}
		
				let className = newClass.name;	//store the provided class name in case the constructor changes the .name attribute
				
				//construct the new instance
				_initializing = true;
				//$constructorFn.bind(newInstance, superFn).apply(null, arguments);
				$constructorFn.apply(newInstance, [superFn].concat([].slice.call(arguments)));	//(This way it doesn't create another new function every time a constructor is run.)
				
				if(!superFnCalled && !$warnedAboutSuper){
					warn(className+" constructor does not call Super()");
					$warnedAboutSuper = true;	//prevent multiple warnings about the same issue
				}
				
				if(newInstance.constructor === newClass){
				//this function is the constructor of the new instance
					
					_initializing = false;
					
					//In case the 'Super' argument gets referenced elsewhere, remove this since it's not allowed to be used outside of the constructor anyway.
					delete superFn.defineProtectedMember;
				}
				else{
				//this function is the constructor of a super-class
					
					return protectedMembers;
				}
				//else return this
				
			}
			else{
			//the 'new' operator was not used; it was just called as a function

				return $returnFn.apply(null, arguments);

			}
			
		}
		
		//override .name
		defineProperty(newClass, "name", 
			classNameIsValid(options.className) ? options.className : classNameIsValid(this.name) ? this.name /*parent class' name*/ : "Class", 
			false, false, true);
		
		//override .toString()
		defineProperty(newClass, "toString", _classToString, true, false, true);

		if(this.extend === _extendFn){
		//the 'extend' method of the parent class was not modified
			
			//make extend() a static method of the new class
			defineProperty(newClass, "extend", _extendFn, true, false, true);
		}

		
		/*** create the new prototype ***/

		//An uninitialized instance of the parent class will be the prototype of the new class.
		//To create an instance without initializing it, we'll temporarily use an empty function as the constructor.
		let emptyFn = function (){};
		emptyFn.prototype = this.prototype;
		let newPrototype = new emptyFn();
		emptyFn = null;
		defineProperty(newPrototype, "constructor", this, true, false, true);
		
		//override .toString()
		defineProperty(newPrototype, "toString", _instanceToString, true, false, true);

		defineProperty(newClass, "prototype", newPrototype, false, false, false);
		
		
		/*** add the new & overriding properties to the prototype ***/

		for(let name in options.extensions){
			if(Object.prototype.hasOwnProperty.call(options.extensions, name)){
				newPrototype[name] = options.extensions[name];
			}
		}
		
		
		return newClass;

	}
	
	defineProperty(_extendFn, "toString", _extendToString, true, false, true);
	
	//make extend() a static method of Class
	defineProperty(_baseClass, "extend", _extendFn, true, false, true);
	
	
	
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
		delete _baseClass.noConflict;
		return _baseClass;
	}
	//make noConflict() a static method of Class
	defineProperty(_baseClass, "noConflict", noConflict, true, false, true);
	
	
	
	context.Class = _baseClass;
	
}).call(this);
