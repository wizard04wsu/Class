// https://github.com/wizard04wsu/Class

/** @module Class */

export { BaseClass as default };


//for a Class instance property, an object with the instance's protected members
const protectedMembersSymbol = Symbol("protected members");

//state: when true, indicates that an instance of a class is being constructed and that there are still super class constructors that need to be invoked using $super
let _invokingSuperConstructor = false;


/**
 * @alias module:Class-Class
 * @abstract
 * @class
 */
const BaseClass = function Class(){
	
	if(!new.target && !_invokingSuperConstructor){
		//the 'new' keyword was not used
		
		throw new TypeError(`class constructor 'Class' cannot be invoked without 'new'`);
	}
	
	_invokingSuperConstructor = false;
	defineNonEnumerableProperty(this, protectedMembersSymbol, {}, true);
	
}

//*** for the prototype ***

//rename it so Object.prototype.toString() will use the base class's name
defineNonEnumerableProperty(BaseClass.prototype, Symbol.toStringTag, "Class", true);

//*** for the constructor ***

//make extend() a static member of the base class
defineNonEnumerableProperty(BaseClass, "extend", extend);


/**
 * Creates a child class.
 * @static
 * @param {initializer} init - Handler to initialize a new instance of the child class. The name of the function is used as the name of the class.
 * @param {function} [call] - Handler for when the class is called without using the `new` keyword. Default behavior is to throw a TypeError.
 * @return {Class} - The new child class.
 * @throws {TypeError} - 'extend' method requires that 'this' be a Class constructor
 * @throws {TypeError} - 'init' is not a function
 * @throws {TypeError} - 'init' must be a named function
 * @throws {TypeError} - 'call' is not a function
 */
function extend(init, call){
	/**
	 * @typedef {function} initializer
	 * @param {function} $super - The parent class's constructor, bound as the first argument. It is to be used like the `super` keyword. It *must* be called exactly once during the execution of the initializer, before any use of the `this` keyword.
	 * @param {...*} args
	 * @returns {object} - An object providing access to protected members.
	 */
	
	if(typeof this !== "function" || !(this === BaseClass || this.prototype instanceof BaseClass))
		throw new TypeError("'extend' method requires that 'this' be a Class constructor");
	if(typeof init !== "function")
		throw new TypeError("'init' is not a function");
	if(!init.name)
		throw new TypeError("'init' must be a named function");
	if(arguments.length > 1 && typeof call !== "function")
		throw new TypeError("'call' is not a function");
	
	const ParentClass = this;
	const className = init.name;
	
	/**
	 * The constructor for the new class.
	 * @class
	 * @augments ParentClass
	 * @private
	 * @throws {ReferenceError} - unexpected use of 'new' keyword
	 * @throws {ReferenceError} - super constructor may be called only once during execution of derived constructor
	 * @throws {ReferenceError} - invalid delete involving super constructor
	 * @throws {ReferenceError} - must call super constructor before accessing 'this'
	 * @throws {ReferenceError} - must call super constructor before returning from derived constructor
	 * @throws {ReferenceError} - class constructor cannot be invoked without 'new'
	 */
	function ChildClass(...argumentsList){
		
		if(!new.target && !_invokingSuperConstructor){
			//the 'new' keyword was not used
			
			//if a 'call' function was passed to 'extend', return its result
			if(call)
				return call(...argumentsList);
			
			throw new TypeError(`class constructor '${className}' cannot be invoked without 'new'`);
		}
		
		const newInstance = this;
		
		_invokingSuperConstructor = false;
		let _$superCalled = false;
		const $super = new Proxy(ParentClass, {
			construct(target, argumentsList, newTarget){
				//target = ParentClass
				//newTarget = $super
				
				//disallow use of the 'new' keyword when calling '$super'
				throw new ReferenceError("unexpected use of 'new' keyword");
			},
			apply(target, thisArg, argumentsList){
				//target = ParentClass
				
				if(_$superCalled)
					throw new ReferenceError("super constructor may be called only once during execution of derived constructor");
				_$superCalled = true;
				
				_invokingSuperConstructor = true;
				target.apply(newInstance, argumentsList);
				
				return newInstance[protectedMembersSymbol];
			},
			deleteProperty(target, property){
				//target = ParentClass
				
				//disallow deletion of static members of a parent class
				throw new ReferenceError("invalid delete involving super constructor");
			}
		});
		
		//I don't believe there's a way to trap access to `this` itself, but we can at least trap access to its properties:
		function proxyThisMethod(methodName, argumentsList){
			if(!_$superCalled)
				throw new ReferenceError("must call super constructor before accessing 'this'");
			return Reflect[methodName](...argumentsList);
		}
		let proxyForKeywordThis = new Proxy(newInstance, {
			defineProperty(){           return proxyThisMethod("defineProperty", arguments); },
			deleteProperty(){           return proxyThisMethod("deleteProperty", arguments); },
			get(){                      return proxyThisMethod("get", arguments); },
			getOwnPropertyDescriptor(){ return proxyThisMethod("getOwnPropertyDescriptor", arguments); },
			getPrototypeOf(){           return proxyThisMethod("getPrototypeOf", arguments); },
			has(){                      return proxyThisMethod("has", arguments); },
			isExtensible(){             return proxyThisMethod("isExtensible", arguments); },
			ownKeys(){                  return proxyThisMethod("ownKeys", arguments); },
			preventExtensions(){        return proxyThisMethod("preventExtensions", arguments); },
			set(){                      return proxyThisMethod("set", arguments); },
			setPrototypeOf(){           return proxyThisMethod("setPrototypeOf", arguments); }
		});
		
		init.apply(proxyForKeywordThis, [$super, ...argumentsList]);
		
		if(!_$superCalled) throw new ReferenceError("must call super constructor before returning from derived constructor");
		
		return newInstance;
	}
	
	//*** for the prototype ***
	
	//create the prototype (an instance of the parent class)
	ChildClass.prototype = Object.create(ParentClass.prototype);
	//rename it so Object.prototype.toString() will use the new class's name
	defineNonEnumerableProperty(ChildClass.prototype, Symbol.toStringTag, className, true);
	//set its constructor to be that of the new class
	defineNonEnumerableProperty(ChildClass.prototype, "constructor", ChildClass);
	
	//*** for the constructor ***
	
	//rename it to be that of the initializer
	defineNonEnumerableProperty(ChildClass, "name", className, true);
	//override .toString() to only output the initializer function
	defineNonEnumerableProperty(ChildClass, "toString", function toString(){ return init.toString(); });
	
	//make extend() a static method of the new class
	defineNonEnumerableProperty(ChildClass, "extend", extend);
	
	return ChildClass;
}



/* helper functions */

function defineNonEnumerableProperty(object, property, value, readonly){
	Object.defineProperty(object, property, {
		writable: !readonly, enumerable: false, configurable: true,
		value: value
	});
}
