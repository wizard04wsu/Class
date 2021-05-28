// https://github.com/wizard04wsu/Class

/** @module Class */

export { BaseClass as default };


//key of a property of Class instances; the property is an object with the instance's protected members
const protectedMembers = Symbol("protected members");

//state: true iif an instance of a class is being constructed
let _instanceIsUnderConstruction = false;


/**
 * @alias module:Class-Class
 * @abstract
 * @class
 */
const BaseClass = function Class(){
	Object.defineProperty(this, protectedMembers, {
		writable: false, enumerable: false, configurable: true,
		value: {}
	});
}

defineNonEnumerableProperty(BaseClass.prototype, "toString", function toString(){ return `[object ${this.constructor.name}]`; });

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
	 * @param {function} $super - The parent class's constructor, bound as the first argument. It is to be used like the `super` keyword. It *must* be called within the constructor, and it *should* be called before using `this`.
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
	 * @class
	 * @augments ParentClass
	 * @private
	 * @throws {ReferenceError} - super constructor may only be called once
	 * @throws {ReferenceError} - invalid delete involving super constructor
	 * @throws {ReferenceError} - must call super constructor before returning from derived constructor
	 */
	function ChildClass(...argumentsList){
		const newInstance = this;
		let _$superCalled = false;
		
		const $super = new Proxy(ParentClass, {
			apply(target, thisArg, argumentsList){	//target===ParentClass
				if(_$superCalled) throw new ReferenceError("super constructor may only be called once");
				_$superCalled = true;
				
				target.apply(newInstance, argumentsList);
				
				return newInstance[protectedMembers];
			},
			deleteProperty(target, property){	//target===ParentClass
				//disallow deletion of static members of a parent class
				throw new ReferenceError("invalid delete involving super constructor");
			}
		});
		
		_instanceIsUnderConstruction = true;
		try{
			init.apply(newInstance, [$super, ...argumentsList]);
		}
		finally{
			_instanceIsUnderConstruction = false;
		}
		
		if(!_$superCalled) throw new ReferenceError("must call super constructor before returning from derived constructor");
		
		return newInstance;
	}
	
	ChildClass.prototype = Object.create(ParentClass.prototype);
	defineNonEnumerableProperty(ChildClass.prototype, "constructor", ParentClass);
	
	Object.defineProperty(ChildClass, "name", {
		writable: false, enumerable: false, configurable: true,
		value: className
	});
	
	//ChildClass.toString() outputs the 'init' function
	defineNonEnumerableProperty(ChildClass, "toString", function toString(){ return init.toString(); });
	
	//make extend() a static method of the new class
	defineNonEnumerableProperty(ChildClass, "extend", extend);
	
	//use a Proxy to distinguish calls to ChildClass between those that do and do not use the `new` keyword
	//@throws {TypeError} if called without the `new` keyword and without the `{@link call}` argument.
	const proxyForChildClass = new Proxy(ChildClass, {
		construct(target, argumentsList, newTarget){	//target===ChildClass, newTarget===the proxy itself (proxyForChildClass)
			const newInstance = Reflect.construct(...arguments);
			
			defineNonEnumerableProperty(newInstance, "constructor", newTarget);
			
			return newInstance;
		},
		apply(target, thisArg, argumentsList){	//target===ChildClass
			if(_instanceIsUnderConstruction){
				//the 'new' keyword was used, and this proxy handler is for the constructor of a super class
				
				return target.apply(thisArg, argumentsList);	//thisArg===the new instance
			}
			else if(call){
				//the 'new' keyword was not used, and a 'call' function was passed
				return call.apply(thisArg, argumentsList);
			}
			throw new TypeError(`Class constructor ${className} cannot be invoked without 'new'`);
		}
	});
	
	return proxyForChildClass;
}



/* helper functions */

function defineNonEnumerableProperty(object, property, value){
	Object.defineProperty(object, property, {
		writable: true, enumerable: false, configurable: true,
		value: value
	});
}
