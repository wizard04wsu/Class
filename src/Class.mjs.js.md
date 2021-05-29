<a name="module_Class"></a>

## Class

* [Class](#module_Class)
    * _static_
        * [.extend(init, [call])](#module_Class.extend) ⇒ <code>Class</code>
    * _inner_
        * [~initializer](#module_Class..initializer) ⇒ <code>object</code>

<a name="module_Class.extend"></a>

### Class.extend(init, [call]) ⇒ <code>Class</code>
Creates a child class.

**Kind**: static method of [<code>Class</code>](#module_Class)  
**Returns**: <code>Class</code> - - The new child class.  
**Throws**:

- <code>TypeError</code> - 'extend' method requires that 'this' be a Class constructor
- <code>TypeError</code> - 'init' is not a function
- <code>TypeError</code> - 'init' must be a named function
- <code>TypeError</code> - 'call' is not a function


| Param | Type | Description |
| --- | --- | --- |
| init | <code>initializer</code> | Handler to initialize a new instance of the child class. The name of the function is used as the name of the class. |
| [call] | <code>function</code> | Handler for when the class is called without using the `new` keyword. Default behavior is to throw a TypeError. |

<a name="module_Class..initializer"></a>

### Class~initializer ⇒ <code>object</code>
**Kind**: inner typedef of [<code>Class</code>](#module_Class)  
**Returns**: <code>object</code> - - An object providing access to protected members.  

| Param | Type | Description |
| --- | --- | --- |
| $super | <code>function</code> | The parent class's constructor, bound as the first argument. It is to be used like the `super` keyword. It *must* be called exactly once during the execution of the constructor, before any use of the `this` keyword. |
| ...args | <code>\*</code> |  |

