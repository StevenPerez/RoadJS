RoadJS
======

Useful memory Array object management library, it is very helpful when you want to perform changes on properties, save and recover the Array [objects] in memory or store and load the Array from the Web Browser's local storage, filter, work with removed items, ajax request to load and send from the server and so on...
<br/><br/>

<h3>RoadJS Implementation</h3>
```html
<script type="text/javascript" src="jquery-1.11.1.min.js"></script>
<script type="text/javascript" src="browser-cuid.js"></script>
<script type="text/javascript" src="road.min.js"></script></body>
OR
<script type="text/javascript" src="jquery-1.11.1.min.js"></script>
<script type="text/javascript" src="road-cuid.min.js"></script>
```

<h3>Brief Introduction behind RoadJS</h3>
RoadJS manages two internal Arrays:

<strong>data</strong>: Array of Objects which contains the "live" objects in memory and <br />
<strong>dataRemoved</strong>: Array that contains the "removed" items from the "live" <strong>data</strong>'s array, in other words, this is the "trash".
<br /><br />
Every time you add or load an object via <strong>roadjs methods</strong> to the <strong>data</strong> array, roadjs will assign a <strong><i>cuid property</i></strong> to the new object, so you can use this property as ID in your UI and also perform actions through the roadjs methods. 
<br /><br />
<strong>Important:</strong> If you want to know more about cuid please refer to the <a href='https://github.com/ericelliott/cuid'>Eric Elliott's cuid</a> repository

<br />
<h3>Road Internal Object Status</h3>
<h6>Find Below of this documentation an example for each status / method</h6>
<strong>status:origin -</strong> it refers when you load information from a Source (DB / Array), it could be using the <strong>road.serverLoad(url)</strong> method or <strong>road.setData(Object)</strong> / <strong>road.setData([Objects])</strong> method.
<br /><br />
<strong>status:new -</strong> it is assigned when you use the road.add(Object) / road.add([Objects]) method, it doesn't exists in a DB source but it exists in memory.
<br /><br />
<strong>status:changed -</strong> it refers when you use the road.update(Object's Property, CUID) method, it changes the propertie(s) in memory to the item linked by the CUID.
<br /><br />
<strong>status:deleted -</strong> it is assigned when you use the road.delete(CUID) method, it changes the status to deleted in memory to the item linked by the CUID.
<br /><br />
<strong>status:removed -</strong> it refers when you use the road.remove(CUID) method, it remove the item from the "live" <strong>data</strong> array and move the item to the <strong>dataRemoved</strong> "trash" Array in memory to the item linked by the CUID.
<br /><br />
<strong>status:recovered -</strong> it refers when you use the road.recoverRemovedByCUID(CUID) / road.recoverAllRemoved() methods, it recovers the item from the <strong>dataRemoved</strong> "trash" Array to the "live" <strong>data</strong> array in memory.

<br />
<h3>Road Methods</h3>

<h5>add</h5>
<h6>Add items to the "live" array</h6>
```javascript
// Create People
var people = road();

people.add({ name: 'Steven', age: 28 });
// undefined
// Note: but  the item was added 
// => Object {name: "Steven", age: 20, cuid: "ci3yr0js000003252zgao2whl", status: "new"}

people.add({ name: 'Steven', age: 28 }, { sendBack : true });
// Object {name: "Steven", age: 28, cuid: "ci3yr5zee00003252z62qx6gy", status: "new"}

people.add({ name: 'Steven', age: 28 }, { sendBack : true }, 'Cust'); // Adding Custom Status
// Object {name: "Steven", age: 28, cuid: "ci3ytspj700003252exffkyae", status: "Cust"}

// Adding Arrays
var friends = [{ name: 'Eric', age: 22 }, { name: 'Maritza', age: 22 }];
people.add(friends);
// undefined
```

<h5>getAll</h5>
<h6>Return all the "live" array objects</h6>
```javascript
people.getAll();
// [Object, Object, ...]
```
<h5>remove</h5>
<h6>Move an object from "live" array to "removed" array</h6>
```javascript
  people.getAll();
  // Object {name: "Eric", age: 22, cuid: "ci3ytv6xk000032534caqjx6o", status: "new"} => Remove This
  // Object {name: "Maritza", age: 22, cuid: "ci3ytv6xl00013253uxurwohm", status: "new"}
  people.remove('ci3ytv6xk000032534caqjx6o');
  
  // Check
  people.getAll();
  // Object {name: "Maritza", age: 22, cuid: "ci3ytv6xl00013253uxurwohm", status: "new"}
  
  // The item was moved to removed array
  people.getAllRemoved();
  // Object {name: "Eric", age: 22, cuid: "ci3ytv6xk000032534caqjx6o", status: "removed"}
```
<h5>update</h5>
<h6>Update properties to a "live" object</h6>
```javascript
people.getAll();
// Object {name: "Carlos", age: 22, cuid: "ci3yuixr900003255e4eh1u7o", status: "new"}
// Object {name: "Maritza", age: 22, cuid: "ci3ytv6xl00013253uxurwohm", status: "new"}

people.update({name: 'Duck'}, 'ci3yuixr900003255e4eh1u7o');
// Object {name: "Duck", age: 22, cuid: "ci3yuixr900003255e4eh1u7o", status: "changed"} // Now status = changed

people.update({name: 'Duck', cuid: 'ci3yuixr900003255e4eh1u7o'}); // same result
// Object {name: "Duck", age: 22, cuid: "ci3yuixr900003255e4eh1u7o", status: "changed"} // Now status = changed
```

<h5>delete</h5>
<h6>Change the status to deleted in an Object</h6>
```javascript
people.getAll();
// Object {name: "Carlos", age: 22, cuid: "ci3yus8oa00003255mm0bzo0w", status: "new"}
// Object {name: "Maritza", age: 22, cuid: "ci3yus8oe000132557hdpexjb", status: "new"}

people.delete('ci3yus8oa00003255mm0bzo0w');
// Object {name: "Carlos", age: 22, cuid: "ci3yus8oa00003255mm0bzo0w", status: "deleted"}

```
<h5>setData</h5>
<h6>Replace the "live" array for another one</h6>
```javascript
people.getAll();
// Object {name: "Carlos", age: 24, cuid: "ci3yus8oa00003255mm0bzo0w", status: "new"}
// Object {name: "Ana", age: 32, cuid: "ci3yus8oe000132557hdpexjb", status: "new"}

var friends = [
	{ name: 'Carlos', age: 22 }, 
	{ name: 'Maritza', age: 22 },
	{ name: 'Mary', age: 22 }
];

people.setData(friends);
// Object {name: "Carlos", age: 22, cuid: "ci3zab93d00003255zxg3x2cj", status: "origin"}
// Object {name: "Maritza", age: 22, cuid: "ci3zab93h00013255it22cjg3", status: "origin"}
// Object {name: "Mary", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}

```
<h5>length</h5>
<h6>Returns the length of the "live" array</h6>
```javascript
people.length();
// 3

```
<h5>filter</h5>
<h6>Return the objects from the "live" array where the Lambda criteria matches</h6>
```javascript
people.filter(function (x) { return x.name == 'Mary' && x.age == 22; });
// Object {name: "Mary", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}

```
<h5>getByCUID</h5>
<h6>Return the objects from the "live" array by CUID, you can return in two ways:</h6>
```javascript
people.getAll();
// Object {name: "Carlos", age: 22, cuid: "ci3zab93d00003255zxg3x2cj", status: "origin"}
// Object {name: "Maritza", age: 22, cuid: "ci3zab93h00013255it22cjg3", status: "origin"}
// Object {name: "Mary", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}

// #1 - Item without link from the source (extended).
var person = people.getByCUID('ci3zab93h000232554wzxkji5');
// Object {name: "Mary", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}
person.name = 'Jhon'; // It changes the person object but not the source
// Object {name: "Jhon", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}

// Source people.getAll() still without changes
// Object {name: "Mary", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}


// #2 - Item linked to the source (not extended).
var person = people.getByCUID('ci3zab93h000232554wzxkji5', false);
// Object {name: "Mary", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}
person.name = 'Jhon'; // It changes the person object but not the source
// Object {name: "Jhon", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}

// Source people.getAll() was changed
// Object {name: "Jhon", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}
```
