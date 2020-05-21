import Class from "../src/Class.mjs.js"

//create a class without adding anything new to it
console.groupCollapsed("A - empty class");
	let Alpha, alpha1;
	
	console.group("Alpha class");
	Alpha = Class.extend();
	console.dir(Alpha);
	console.assert(Alpha.name === "Class", Alpha.name);	//function's .name property is the class name
	console.assert(Alpha.extend === Class.extend, Alpha.extend);	//.extend() is inherited (copied to new class)
	console.assert(Alpha.toString() === "function Class() { [custom code] }", Alpha.toString());	//.toString() output
	console.groupEnd();

	console.group("Alpha instance");
	alpha1 = new Alpha();
	console.dir(alpha1);
	console.assert(alpha1.constructor === Alpha, alpha1.constructor);	//the Alpha class is the constructor of the instance
	console.assert(alpha1.toString() === "[instance of Class]", alpha1.toString());	//.toString() output
	console.groupEnd();
console.groupEnd();

//create a class with a custom class name
console.groupCollapsed("B - class name");
	let Bravo, bravo1;
	
	console.group("Bravo class");
	Bravo = Class.extend({className:"Bravo"});
	console.dir(Bravo);
	console.assert(Bravo.name === "Bravo", Bravo.name);	//class name is 'Bravo'
	console.assert(Bravo.toString() === "function Class() { [custom code] }", Bravo.toString());	//.toString() output
	console.groupEnd();

	console.group("Bravo instance");
	bravo1 = new Bravo();
	console.dir(bravo1);
	console.assert(bravo1.toString() === "[instance of Bravo]", bravo1.toString());	//.toString() output
	console.groupEnd();
console.groupEnd();

//create a class, specifying an invalid class name
console.groupCollapsed("C - invalid class name");
	let Charlie, charlie1;
	
	console.group("Charlie class");
	Charlie = Class.extend({className:"5"});
	console.dir(Charlie);
	console.assert(Charlie.name === "Class", Charlie.name);	//class name is inherited (copied to new class)
	console.groupEnd();

	console.group("Charlie instance");
	charlie1 = new Charlie();
	console.dir(charlie1);
	console.assert(charlie1.toString() === "[instance of Class]", charlie1.toString());	//.toString() output
	console.groupEnd();
console.groupEnd();

//specify returnFn() in case class is called without the 'new' keyword
console.groupCollapsed("D - return function");
	let Delta, delta1, delta2;
	
	console.group("Delta class");
	Delta = Class.extend({className:"Delta",
		constructorFn:function (Super){
			Super();
			this.bar = function (){return "bar"};
			this.baz = function (){return this.bar()};
		},
		returnFn:function (){return "foo"}
	});
	console.dir(Delta);
	console.groupEnd();

	console.group("Delta call");
	delta1 = Delta();
	console.dir(delta1);
	console.assert(delta1 === "foo", delta1);	//returns output of returnFn()
	console.assert(delta1.bar === void 0, delta1.bar);	//.bar() is not added to the instance
	console.assert(delta1.baz === void 0, delta1.baz);	//.baz() is not added to the instance
	console.groupEnd();

	console.group("Delta instance");
	delta2 = new Delta();
	console.dir(delta2);
	console.assert(delta2.bar() === "bar", delta2.bar());	//.bar() returns 'bar'
	console.assert(delta2.baz() === "bar", delta2.baz());	//.baz() returns 'bar'
	console.groupEnd();
console.groupEnd();

//use 'this' keyword inside of returnFn()
console.groupCollapsed("E - return function using 'this'");
	let Echo, echo1;
	
	console.group("Echo class");
	Echo = Class.extend({className:"Echo",
		constructorFn:function (){
			this.foo = function (){return "foo"};
		},
		returnFn:function (){return this.foo}
	});
	console.dir(Echo);
	console.groupEnd();

	console.group("Echo call");
	echo1 = Echo();
	console.dir(echo1);
	console.assert(echo1 === window.foo, echo1);	//'this' refers to the window, not an instance of the class
	console.groupEnd();
console.groupEnd();

//don't call Super() within the Golf class' constructorFn()
console.groupCollapsed("F,G - subclass constructor without 'Super()'");
	let Foxtrot, Golf, golf1, golf2;
	
	console.group("Foxtrot class");
	Foxtrot = Class.extend({className:"Foxtrot",
		constructorFn:function(Super){Super();this.foo = "foo"}
	});
	console.dir(Foxtrot);
	console.groupEnd();

	console.group("Golf class");
	Golf = Class.extend({className:"Golf",
		constructorFn:function(Super){}
	});
	console.dir(Golf);
	console.groupEnd();

	console.group("Golf instance 1");
	golf1 = new Golf();	//logs a warning to the console from the Golf constructor
	console.info("\u2B11 should have gotten a warning about 'Super'");
	console.dir(golf1);
	console.assert(golf1.foo === void 0, golf1.foo);	//.foo was not added to the instance via the super class constructor
	console.groupEnd();

	console.group("Golf instance 2");
	console.info("\u2B10 should not get additional warnings");
	golf2 = new Golf();	//should not log a warning again
	console.dir(golf2);
	console.groupEnd();
console.groupEnd();

//don't call Super() within the Hotel class' constructorFn()
console.groupCollapsed("H,I - super-class constructor without 'Super()'");
	let Hotel, India, india1, india2;
	
	console.group("Hotel class");
	Hotel = Class.extend({className:"Hotel",
		constructorFn:function(Super){this.foo = "foo"}
	});
	console.dir(Hotel);
	console.groupEnd();

	console.group("India class");
	India = Hotel.extend({className:"D",
		constructorFn:function(Super){Super()}
	});
	console.dir(India);
	console.groupEnd();

	console.group("India instance 1");
	india1 = new India();	//logs a warning to the console from the Hotel constructor
	console.info("\u2B11 should have gotten a warning about 'Super'");
	console.dir(india1);
	console.groupEnd();

	console.group("India instance 2");
	console.info("\u2B10 should not get additional warnings");
	india2 = new India();
	console.dir(india2);
	console.groupEnd();
console.groupEnd();

//call Super() inside all the constructor functions
console.groupCollapsed("J,K - constructors with 'Super()'");
	let Juliet, Kilo, kilo1;
	
	console.group("Juliet class");
	Juliet = Class.extend({className:"Juliet",
		constructorFn:function(Super){Super();this.foo = "foo"}
	});
	console.dir(Juliet);
	console.groupEnd();

	console.group("Kilo class");
	Kilo = Juliet.extend({className:"Kilo",
		constructorFn:function(Super){Super()}
	});
	console.dir(Kilo);
	console.groupEnd();

	console.group("Kilo instance");
	kilo1 = new Kilo();
	console.dir(kilo1);
	console.assert(kilo1.foo === "foo", kilo1.foo);	//.foo was added to the instance via the super class constructor
	console.groupEnd();
console.groupEnd();

//protected properties
console.groupCollapsed("L,M,N - protected properties");
	let Lima, Mike, mike1, November, november1;
	
	console.group("Lima class");
	Lima = Class.extend({className:"Lima",
		constructorFn:function(Super){
			Super();
			let foo="bar";
			this.bop = function (){return foo};
			Object.defineProperty(Super.protected, "foo", {
				get:function (){return foo},
				set:function(v){foo=v},
				enumerable:true, configurable:true
			});	//subclasses of Lima will have access to the 'foo' variable
			Super.protected.foo = foo;
		}
	});
	console.dir(Lima);
	console.groupEnd();

	console.group("Mike class");
	Mike = Lima.extend({className:"Mike",
		constructorFn:function(Super){
			Super();
			let $protected = Super.protected;
			console.log('Super.protected', $protected);
			console.assert($protected.foo === "bar", $protected.foo);	//Mike constructor has access to the protected foo value
			$protected.foo = "baz";
			console.assert($protected.foo === "baz", $protected.foo);	//protected foo value can be changed via the Mike constructor
			console.assert(this.bop() === "baz", this.bop()); //confirms that the value in the Lima constructor's variable is what changed
			delete $protected.foo;	//subclasses of Mike will not have access to the protected foo value
		}
	});
	console.dir(Mike);
	console.groupEnd();

	console.group("Mike instance");
	mike1 = new Mike();
	console.dir(mike1);
	console.assert(mike1.foo === void 0, mike1.foo);	//instance doesn't have access to the protected foo value
	console.assert(mike1.bop() === "baz", mike1.bop());	//instance's constructor-created method does have access to the protected foo value
	console.groupEnd();

	console.group("November class");
	November = Mike.extend({className:"November",
		constructorFn:function(Super){
			Super();
			console.assert(Super.protected.foo === void 0, Super.protected.foo);	//class November doesn't have access to the protected foo value
			console.assert(this.bop() === "baz", this.bop());	//inherited function still has access
		}
	});
	console.dir(November);
	console.groupEnd();

	console.group("November instance");
	november1 = new November();
	console.dir(november1);
	console.assert(november1.bop() === "baz", november1.bop());	//inherited function still has access
	console.groupEnd();
console.groupEnd();

//Class.noConflict()
console.groupCollapsed("O - noConflict");
	let Oscar;
	
	console.dir(Class);
	console.assert(Object.getOwnPropertyDescriptor(Class, "noConflict").enumerable === false, Object.getOwnPropertyDescriptor(Class, "noConflict").enumerable);
	Oscar = Class.noConflict();
	console.assert(Class === void 0, Class);
	console.dir(Oscar);
	console.assert(Object.getOwnPropertyDescriptor(Oscar, "noConflict") === void 0, Object.getOwnPropertyDescriptor(Oscar, "noConflict"));
	console.assert(Oscar.noConflict === void 0, Oscar.noConflict);
console.groupEnd();