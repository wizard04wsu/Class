/* eslint-env es6 */
// https://github.com/wizard04wsu/Class


const protectedMembers = Symbol("protected members");
let _underConstruction = false;


function Class(){
	Object.defineProperty(this, protectedMembers, {
		writable: false, enumerable: false, configurable: true,
		value: {}
	});
}

Class.prototype.constructor = Class;

Object.defineProperty(Class.prototype, "toString", {
	writable: true, enumerable: false, configurable: true,
	value: function toString(){ return `[object ${this.constructor.name}]`; }
});

Object.defineProperty(Class, "extend", {
	writable: true, enumerable: false, configurable: true,
	value: extend
});


/**
 * Creates a new class that inherits from the super class.
 * 
 * @param {function} [constructor] - Initializes a new instance of the class. Its first argument will be a function that can be used to call the constructor of the super class (instead of the `super` keyword). It must be called in the constructor, it should be called before using `this`, and it must be called to gain access to protected members.
 * @param {function} [applier] - Returns a value when the class is called without using the 'new' keyword. If not specified, a TypeError will be thrown instead of returning a value.
 * @return {function} - The new class.
 */
function extend(constructor, applier){
	if(typeof this !== "function" || !(this === Class || this.prototype instanceof Class))
		throw new TypeError("extend requires that 'this' be a Class constructor");
	if(typeof constructor !== "function")
		throw new TypeError("constructor is not a function");
	if(!constructor.name)
		throw new TypeError("constructor must be a named function");
	if(arguments.length > 1 && typeof applier !== "function")
		throw new TypeError("applier is not a function");
	
	const superClass = this;
	
	function constructorWrapper(...argumentsList){
		const newInstance = this;
		let _$superCalled = false;
		
		const $super = new Proxy(superClass, {
			apply(target, thisArg, argumentsList){	//target===superClass
				if(_$superCalled) throw new ReferenceError("Super constructor may only be called once");
				_$superCalled = true;
				
				target.apply(newInstance, argumentsList);
			},
			get(target, property, receiver){	//target===superClass
				if(property === "_protected"){
					if(!_$superCalled) throw new ReferenceError("Must call super constructor from derived constructor before accessing protected members");
					return target[protectedMembers];
				}
				return Reflect.get(...arguments);
			},
			set(target, property, value, receiver){	//target===superClass
				if(property === "_protected") return false;
				return Reflect.set(...arguments);
			},
			deleteProperty(target, property){	//target===superClass
				throw new ReferenceError("invalid delete involving super constructor");
			}
		});
		
		_underConstruction = true;
		try{
			constructor.apply(newInstance, [$super, ...argumentsList]);
		}
		finally{
			_underConstruction = false;
		}
		
		if(!_$superCalled) throw new ReferenceError("Must call super constructor before returning from derived constructor");
		
		return newInstance;
	}
	
	const newClass = new Proxy(constructorWrapper, {
		construct(target, argumentsList, newTarget){	//target===constructorWrapper, newTarget===the proxy itself (newClass)
			const newInstance = Reflect.construct(...arguments);
			newInstance.constructor = newTarget;
			return newInstance;
		},
		apply(target, thisArg, argumentsList){	//target===constructorWrapper
			if(_underConstruction){
				return target.apply(thisArg, argumentsList);	//thisArg===the new instance
			}
			else if(applier){
				return applier.apply(thisArg, argumentsList);
			}
			throw new TypeError(`Class constructor ${constructor.name} cannot be invoked without 'new'`);
		}
	});
	
	console.log("newClass:", newClass);
	newClass.prototype = Object.create(superClass.prototype);
	newClass.prototype.constructor = superClass;
	console.log(newClass.prototype instanceof superClass);
	
	Object.defineProperty(newClass, "name", {
		writable: false, enumerable: false, configurable: true,
		value: constructor.name
	});
	
	Object.defineProperty(newClass, "toString", {
		writable: true, enumerable: false, configurable: true,
		value: function toString(){ return constructor.toString(); }
	});
	
	//make extend() a static method of the new class
	Object.defineProperty(newClass, "extend", {
		writable: true, enumerable: false, configurable: true,
		value: extend
	});
	
	return newClass;
}



export { Class as default };
