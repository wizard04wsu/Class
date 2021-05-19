/* eslint-env es6 */
// https://github.com/wizard04wsu/Class

let _initializing = false;


/*** helper functions ***/

function defineProperty(object, propertyName, value, isWritable, isEnumerable, isConfigurable){
	Object.defineProperty(object, propertyName, { value:value, writable:isWritable, enumerable:isEnumerable, configurable:isConfigurable });
}
function defineNonEnumerableProperty(object, propertyName, value){
	defineProperty(object, propertyName, value, true, false, true);
}

function isPrimitive(o){ return o === null || (typeof(o) !== "object" && typeof(o) !== "function"); }


/*** base class ***/

let _baseClass = function Class(){};

defineNonEnumerableProperty(_baseClass.prototype, "toString", function toString(){ return "[object Class]"; });


/**
 * Creates a new class that inherits from the super class.
 * 
 * @param {object} [options]
 * @param {string} [options.className] - Used as .name for the class function and in .toString() for instances of the class.
 * @param {function} [options.constructor] - Initializes a new instance of the class. Its first argument will be a function that can be used to call the constructor of the super class (like a `super` keyword). It must be called before using `this`, or to gain access to protected members of the super class. If not specified, the default constructor will call the constructor of the super class, passing any arguments.
 * @param {function} [options.function] - Returns a value when the class is called as a function instead of as a constructor (i.e., without using the 'new' keyword). If not specified, a TypeError will be thrown instead.
 * @return {function} - The new class.
 */
let _extendFn = function extend(options){
	
	if(options === void 0) options = {};
	else if(isPrimitive(options)) throw new TypeError("options is not an object");
	
	let $className = options.className;
	if($className === void 0 || String($className)===""){
		if(options.constructor.name !== "constructor") $className = options.constructor.name;
		$className = $className || this.name || "Class";
	}
	
	let $constructor = options.constructor;
	if($constructor === void 0){
		//default contructor calls the constructor of the super class, passing any remaining arguments
		$constructor = function ($super){ $super.apply(void 0, [].slice.call(arguments, 1)); };
	}
	else if(typeof($constructor) !== "function") throw new TypeError("options.constructor is not a function");
	
	let $function = options.function;
	if($function === void 0){
		$function = () => throw new TypeError(`${$className} class constructor cannot be invoked without 'new'`);
	}
	else if(typeof(options.function) !== "function") throw new TypeError("options.function is not a function");
	
	
	/*** create the new constructor ***/
	
	let newClass = function Class(){
		
		if(this && this instanceof newClass && (this.constructor === newClass.prototype.constructor || _initializing)){
			//A new instance is being created; initialize it.
			//This condition will be true in these cases:
			//  1) The 'new' operator was used to instantiate this class
			//  2) The 'new' operator was used to instantiate a subclass, and the subclass' constructor calls the constructor of its super class
			//  3) The 'new' operator was used to instantiate a subclass, and the subclass' constructor includes something like `MySuperClass.call(this)`
			//  4) Possibly if the prototype chain has been manipulated

			let newInstance = this;

			if(newInstance.constructor === newClass.prototype.constructor){
				//this function is the constructor of the new instance (i.e., it's not a super class' constructor)
				
				defineNonEnumerableProperty(newInstance, "constructor", newClass);
			}
			
			let superFnCalled = false;
			function $super(){
				if(superFnCalled) throw new ReferenceError("Super constructor may only be called once");
				superFnCalled = true;
				
				//initialize the instance using the super class
				let protectedAccessors = newClass.prototype.constructor.apply(newInstance, arguments) || {};
				
				//add the protected value accessors to `$super`
				defineProperty($super, "protected", {}, false, false, false);
				for(const key in protectedAccessors){
					$super.protected[key] = protectedAccessors[key];
				}
			}
			
			//construct the new instance
			_initializing = true;
			$constructor.apply(newInstance, [$super].concat([].slice.call(arguments)));
			
			if(!superFnCalled) throw new ReferenceError("Must call super constructor in derived class before accessing 'this' or returning from derived constructor");
			
			if(newInstance.constructor === newClass){
				//this function is the constructor of the new instance
				
				_initializing = false;
			}
			else{
				//this function is the constructor of a super class
				
				//generate protected value accessors for the subclass
				let protectedAccessors = {};
				for(const key in $super.protected){
					Object.defineProperty(protectedAccessors, key, {
						get: ()=>$super[key],
						set: value=>($super[key] = value),
						enumerable:true, configurable:false
					});
				}
				return protectedAccessors;
			}
			
		}
		else{
			//the 'new' operator was not used; it was just called as a function

			return $function.apply(void 0, arguments);

		}
		
	}
	
	//override .name
	defineProperty(newClass, "name", $className, false, false, true);
	
	if(this.extend === _extendFn){
		//the 'extend' method of the super class was not modified
		
		//make extend() a static method of the new class
		defineNonEnumerableProperty(newClass, "extend", _extendFn);
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
	
}

//make extend() a static method of Class
defineNonEnumerableProperty(_baseClass, "extend", _extendFn);



export { _baseClass as default };
