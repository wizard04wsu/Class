/* eslint-env es6 */
// https://github.com/wizard04wsu/Class

//let _initializing = false;
const protected = Symbol("protected members");


/*** helper functions ***/

function isPrimitive(o){ return o === null || (typeof(o) !== "object" && typeof(o) !== "function"); }


/*** base class ***/

function Class(){
	Object.defineProperty(this, protected, {
		writable: false, enumerable: false, configurable: true,
		value: {}
	});
};

Object.defineProperty(Class.prototype, "toString", {
	writable: true, enumerable: false, configurable: true,
	value: function toString(){ return "[object "+this.constructor.name+"]"; }
});

Object.defineProperty(Class, "extend", {
	writable: true, enumerable: false, configurable: true,
	value: extend
});


/**
 * Creates a new class that inherits from the super class.
 * 
 * @param {object} [options]
 * @param {string} [options.className] - Used as .name for the class function and in .toString() for instances of the class.
 * @param {function} [options.constructor] - Initializes a new instance of the class. Its first argument will be a function that can be used to call the constructor of the super class (like a `super` keyword). It must be called before using `this`, or to gain access to protected members of the super class. If not specified, the default constructor will call the constructor of the super class, passing any arguments.
 * @param {function} [options.function] - Returns a value when the class is called as a function instead of as a constructor (i.e., without using the 'new' keyword). If not specified, a TypeError will be thrown instead.
 * @return {function} - The new class.
 */
function extend(constructor, applier){
	if(typeof this !== "function" || !(this.prototype instanceof Class))
		throw new TypeError("extend requires that 'this' be a Class constructor");
	if(typeof constructor !== "function")
		throw new TypeError("constructor is not a function");
	if(arguments.length > 1 && typeof applier !== "function")
		throw new TypeError("applier is not a function");
	
	const newClass = new Proxy(constructor, {
		construct(target, argumentsList, newTarget){	//target===constructor, newTarget===the proxy (newClass)
			let supCalled;
			
			const sup = new Proxy(target.prototype.constructor, {
				apply(target, thisArg, [newInstance, ...argumentsList]){	//target===the super constructor
					if(supCalled) throw new ReferenceError("Super constructor may only be called once");
					supCalled = true;
					
					target.apply(newInstance, argumentsList);
				},
				get(target, property, receiver){	//target===the super constructor, receiver===the proxy (sup)
					if(property === "_protected"){
						if(!supCalled) throw new ReferenceError("Must call super constructor from derived constructor before accessing protected members");
						return target[protected];
					}
					return Reflect.get(...arguments);
				},
				set(target, property, value){	//target===the super constructor
					if(property === "_protected") return false;
					return Reflect.set(...arguments);
				},
				deleteProperty(target, property){	//target===the super constructor
					throw new ReferenceError("invalid delete involving super constructor");
				}
			});
			
			const newInstance = Reflect.construct(target, [sup, ...argumentsList], newTarget);
			
			if(!supCalled) throw new ReferenceError("Must call super constructor before returning from derived constructor");
			
			return newInstance;
		},
		apply(target, thisArg, argumentsList){	//target===constructor
			return typeof applier === "function" ? applier.apply(thisArg, argumentsList) : void 0;
		}
	});
	
	newClass.prototype = Object.create(this.prototype);
	
	Object.defineProperty(newClass, "name", {
		writable: false, enumerable: false, configurable: true,
		value: constructor.name
	});
}






	/*** create the new prototype ***/

	//An uninitialized instance of the super class will be the prototype of the new class.
	//To create an instance without initializing it, we'll temporarily use an empty function as the constructor.
	let emptyFn = function (){};
	emptyFn.prototype = this.prototype;
	let newPrototype = new emptyFn();
	defineNonEnumerableProperty(newPrototype, "constructor", this);
	
	//override .toString()
	defineNonEnumerableProperty(newPrototype, "toString", function toString(){ return `[object ${$className}]`; });

	defineProperty(newClass, "prototype", newPrototype, false, false, false);
	
	
	return newClass;
	



export { _baseClass as default };
