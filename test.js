//This still works in IE 11.

(function (){
	
	"use strict";
	
	var context = this,
		oldClass = context.Class,
		extendFn,
		_initializing = false;
	
	/*** helper functions ***/
	
	function defineProperty(object, propertyName, value, isWritable, isEnumerable, isConfigurable){
		Object.defineProperty(object, propertyName, { value:value, writable:!!isWritable, enumerable:!!isEnumerable, configurable:!!isConfigurable });
	}
	function isPrimitive(o){ var t; return o===t || o===null || (t = typeof o)==="number" || t==="string" || t==="boolean"; }
	
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
	 * @param {function} [options.constructorFn] - Initializes new instances of the class. A function is passed as the first argument, used to initialize the instance using the parent class' constructor; be sure to call it inside constructorFn (before using `this`).
	 * @param {function} [options.returnFn] - Returns a value when the constructor is called without using the 'new' keyword.
	 * @param {object} [options.extensions] - Additional and overriding properties and methods for the prototype of the class.
	 * @return {function} - The new class.
	 */
	extendFn = function extend(options){
		
		var constructorFn, returnFn, newClass, emptyFn, newPrototype;

		function classNameIsValid(className){
		//checks if the specified classname is valid (note: this doesn't check for reserved words)
			return className !== (void 0) && /^[a-z_$][a-z0-9_$]*$/i.test(className);
		}
		
		if(options === void 0) options = {};
		else if(isPrimitive(options)) throw new TypeError("argument 'options' is not an object");


		/*** create the new constructor ***/

		constructorFn = typeof(options.constructorFn) === "function" ? options.constructorFn : function (Super){ Super.apply(null, [].slice.call(arguments, 1)); };
		returnFn = typeof(options.returnFn) === "function" ? options.returnFn : function (){};

		newClass = function Class(){
			
			var newInstance, thisIsTheNewInstanceConstructor, superFn, _protected, _protectedOnParentClass;
			
			if(this && this instanceof newClass && (this.constructor === newClass.prototype.constructor || _initializing)){
			//A new instance is being created; initialize it.
			//This condition will be true in these cases:
			//  1) The 'new' operator was used to instantiate this class
			//  2) The 'new' operator was used to instantiate a subclass, and the subclass' constructorFn() calls its first argument (the bound superFn)
			//  3) The 'new' operator was used to instantiate a subclass, and the subclass' constructorFn() includes something like `MySuperClass.call(this)`
			//  4) Possibly if the prototype chain has been screwed with

				newInstance = this;
				
				if(newInstance.constructor === newClass.prototype.constructor){
				//this function is the constructor of the new instance (i.e., it's not a parent class' constructor)
					
					thisIsTheNewInstanceConstructor = true;
					defineProperty(newInstance, "constructor", newClass, true, false, true);
				}

				superFn = function (){
					
					_protectedOnParentClass = newClass.prototype.constructor.apply(newInstance, arguments);
					
					//add accessors to the parent class' protected members
					for(name in _protectedOnParentClass){
						if(Object.prototype.hasOwnProperty.call(_protectedOnParentClass, name)){
							Object.defineProperty(superFn, name, { get:_protectedOnParentClass[name].get, set:_protectedOnParentClass[name].set, enumerable:true, configurable:true });
						}
					}
					
					/**
//					 * Stores a getter and (optionally) a setter, allowing a subclass' constructorFn to access a variable or function that is inside this class' constructorFn.
					 * This does *not* add a protected member to the parent class. (Having this as a method of superFn is probablyconfusing. TODO: make it less confusing)
					 *
					 * @param {string} name
					 * @param {function} getter
					 * @param {function} [setter]
					 */
					Object.defineProperty(superFn, "addProtectedMember", {
						 value: function addProtectedMember(name, getter, setter){
							if(name === (void 0) || ""+name === "") throw new TypeError("argument 'name' is required");
							if(typeof(getter) !== "function") throw new TypeError("argument 'getter' is not a function");
							if(getter !== (void 0) && typeof(setter) !== "function") throw new TypeError("argument 'setter' is not a function");
							
							_protected[name] = {get:getter, set:setter};
						},
						writable:false, enumerable:false, configurable:true
					});
					
				}
		
				_protected = {};
				
				_initializing = true;
				constructorFn.apply(newInstance, [superFn].concat([].slice.call(arguments)));
				_initializing = false;
				
				if(!thisIsTheNewInstanceConstructor){
				//this function is the constructor of a super-class
					return _protected;
				}
				
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
		emptyFn = function (){};
		emptyFn.prototype = this.prototype;
		newPrototype = new emptyFn();
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
	 * Restores 'Class' to what it was before this script replaced it, optionally providing a new context
	 * 
	 * @param {object} [newContext] - If provided, adds 'Class' to that object.
	 * @return {function} - The base Class constructor.
	 */
	function noConflict(newContext){
		if(context){
			context.Class = oldClass;
		}
		
		if(newContext){
			oldClass = newContext.Class;
			newContext.Class = this;
		}
		
		context = newContext;
		
		return this;
	}
	//make noConflict() a static method of Class
	defineProperty(Class, "noConflict", noConflict, true, false, true);
	
	
	
	context.Class = Class;
	
}).call(this);



















var Rectangle = Class.extend({
	className:"Rectangle",
	constructorFn:function (Super, width, height){
		var prot = 1;
		Super();
		this.width = Math.abs(width||0);
		this.height = Math.abs(height||0);
		Object.defineProperty(this, "area", { get:function (){ return this.width * this.height; }, enumerable:true, configurable:true });
		this.getProt = function (){ return prot; };
		this.setProt = function (v){ return prot=v; };
		Super.addProtectedMember("prot", function(){return prot}, function(v){prot=v});
//		console.log(Object.getOwnPropertyDescriptors(Super));
//		console.log(Object.getOwnPropertyDescriptors(this));
	},
	returnFn:function (width, height){
		console.log("returnFn");
		return Math.abs((width||0) * (height||0));
	},
	extensions:{
		foo:"I am a rectangle."
	}
});


var Square = Rectangle.extend({
	className:"Square",
	constructorFn:function (Super, width){
		Super(width, width);
		Object.defineProperty(this, "height", { get:function (){ return this.width; }, set:function (val){ return (this.width = Math.abs(val)); }, enumerable:true, configurable:true });
		//this.prot = Super.prot;
		Object.defineProperty(this, "prot", { get:function (){ return Super.prot; }, set:function (v){ return Super.prot = v; }, enumerable:true, configurable:true });
//		console.log(Object.getOwnPropertyDescriptors(Super));
//		console.log(Object.getOwnPropertyDescriptors(this));
	},
	returnFn:function (width){
		return Math.pow(width||0, 2);
	},
	extensions:{
		foo:"I am a rectangle and a square."
	}
});


var a = console.assert;



var r = new Rectangle(2, 4);


var s = new Square(3);


a(s.toString() === "[instance of Square]", s.toString());
a(s.area === 9, s.area);
s.height = 4;
a(s.area === 16, s.area);
a(s.foo === "I am a rectangle and a square.", s.foo);
a(s.prot === 1, s.prot);
s.prot = 2;
a(s.prot === 2, s.prot);
a(s.getProt(), 2);



Object.defineProperty(s.constructor, "name", {value:"Test", writable:false, enumerable:false, configurable:true});
a(s.toString() === "[instance of Test]", s.toString());

Object.defineProperty(s.constructor, "name", {value:"in-val-id", writable:false, enumerable:false, configurable:true});
a(s.toString() === "[instance of Class]", s.toString());

