RoadJS
======

Useful memory Array object management library that improves the way you perform changes on properties, save and recover the Array [objects] in memory or store and load the Array in the Web Browser's local storage, filter, work with removed items, ajax request (load and send) to the server and so on...
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
<h3>Road Callback</h3>
<h6>The 99.9% of the functions contains an object to track callbacks.</h6>
<strong>fun</strong> parameter contains 3 callback methods: 
<br />
<ul>
	<li>fun.ok : Callback for each item(s) once the action is completed, most of the time, it is inside of the loops</li>
	<li>fun.end : Callback before the last return, so it skip the loops</li>
	<li>fun.err : Callback in case of error and before the throw</li>
</ul>

<br />
<h3>Road Methods</h3>

```javascript
// Create People
var people = road();
```

<h5>add</h5>
<h6>Add items to the "live" array</h6>
`Params: add(obj, fun, status)`
```javascript
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
`Params: getAll(fun)`
```javascript
people.getAll();
// [Object, Object, ...]
```
<h5>remove</h5>
<h6>Move an object from "live" array to "removed" array</h6>
`Params: remove(cuid, fun)`
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
`Params: update(obj, cuid, fun)`
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
`Params: del(cuid, fun)`
```javascript
people.getAll();
// Object {name: "Carlos", age: 22, cuid: "ci3yus8oa00003255mm0bzo0w", status: "new"}
// Object {name: "Maritza", age: 22, cuid: "ci3yus8oe000132557hdpexjb", status: "new"}

people.delete('ci3yus8oa00003255mm0bzo0w');
// Object {name: "Carlos", age: 22, cuid: "ci3yus8oa00003255mm0bzo0w", status: "deleted"}

```
<h5>setData</h5>
<h6>Replace the "live" array for another one</h6>
`Params: setData(newData, fun)`
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
`Params: length(fun)`
```javascript
people.length();
// 3

```
<h5>filter</h5>
<h6>Return the objects from the "live" array where the Lambda criteria matches</h6>
`Params: filter(criteria, fun)`
```javascript
people.filter(function (x) { return x.name == 'Mary' && x.age == 22; });
// Object {name: "Mary", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}

```

<h5>map</h5>
<h6>Return the mapped objects from the "live" array where the Lambda criteria matches</h6>
`Params: map(criteria, fun)`
```javascript
people.getAll();
// Object {name: "Steven", age: 28, cuid: "ci41iswtf000032536id8deb1", status: "new"}
// Object {name: "Carlos", age: 22, cuid: "ci41iswtg00013253a9u7dzo5", status: "new"}
// Object {name: "Carlos", age: 31, cuid: "ci41iswtg00023253fzru2c0a", status: "new"}

people.map(function (x) { return x.name; });
// ["Steven", "Carlos", "Carlos"]

people.map(function (x) { return { key: x.cuid, value: x.name }; })
// Object {key: "ci41iswtf000032536id8deb1", value: "Steven"}
// Object {key: "ci41iswtg00013253a9u7dzo5", value: "Carlos"}
// Object {key: "ci41iswtg00023253fzru2c0a", value: "Carlos"}

```

<h5>uniqueProp</h5>
<h6>Return the unique values from the "live" objects by a property name</h6>
`Params: uniqueProp(property, fun)`
```javascript
people.getAll();
// Object {name: "Steven", age: 28, cuid: "ci41iswtf000032536id8deb1", status: "new"}
// Object {name: "Carlos", age: 22, cuid: "ci41iswtg00013253a9u7dzo5", status: "new"}
// Object {name: "Carlos", age: 31, cuid: "ci41iswtg00023253fzru2c0a", status: "new"}

people.uniqueProp('name');
// ["Steven", "Carlos"]

people.uniqueProp('status');
// ["new"]

```

<h5>getByCUID</h5>
<h6>Return the objects from the "live" array by CUID, you can return in two ways:</h6>
`Params: getByCUID(cuid, isClone, fun)`
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
person.name = 'Jhon'; // It changes the person object AND the source
// Object {name: "Jhon", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}

// Source people.getAll() was changed
// Object {name: "Jhon", age: 22, cuid: "ci3zab93h000232554wzxkji5", status: "origin"}
```
<br />
<h4>dataRemoved Array "Trash"</h4>

<h5>getAllRemoved</h5>
<h6>Returns all the objects from the "removed" array</h6>
`Params: getAllRemoved(fun)`
```javascript

people.getAll();
// Object {name: "Carlos", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "new"}

people.remove('ci3zb3v2k00003255tdncj0qu'); // Remove the item, now it is in the dataRemoved Array

people.getAllRemoved();
// Object {name: "Carlos", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "removed"}

```

<h5>lengthRemoved</h5>
<h6>Returns the length of the "removed" array</h6>
`Params: lengthRemoved(fun)`
```javascript
people.lengthRemoved();
// 1

```

<h5>cleanRemoved</h5>
<h6>Initialize with an empty "removed" array</h6>
`Params: cleanRemoved(fun)`
```javascript
people.cleanRemoved();
// []

```

<h5>getRemovedByCUID</h5>
<h6>Return the objects from the "removed" array by CUID, you can return in two ways:</h6>
`Params: getRemovedByCUID(cuid, isClone, fun)`
```javascript
people.getAllRemoved();
// Object {name: "Carlos", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "removed"}

// #1 - Item without link from the source (extended).
var person = people.getRemovedByCUID('ci3zb3v2k00003255tdncj0qu');
// Object {name: "Carlos", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "removed"}
person.name = 'Jhon'; // It changes the person object but not the source
// Object {name: "Jhon", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "removed"}

// Source people.getAll() still without changes
// Object {name: "Carlos", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "removed"}


// #2 - Item linked to the source (not extended).
var person = people.getRemovedByCUID('ci3zb3v2k00003255tdncj0qu', false);
// Object {name: "Carlos", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "removed"}
person.name = 'Jhon'; // It changes the person object AND the source
// Object {name: "Jhon", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "removed"}

// Source people.getAll() was changed
// Object {name: "Jhon", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "removed"}
```

<h5>recoverRemovedByCUID</h5>
<h6>Recover a "removed" object to the "live" array by CUID</h6>
`Params: recoverRemovedByCUID(cuid, fun)`
```javascript
people.getAllRemoved();
// Object {name: "Jhon", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "removed"}

// Recover the removed item
people.recoverRemovedByCUID('ci3zb3v2k00003255tdncj0qu');

people.getAll();
// Object {name: "Carlos", age: 22, cuid: "ci3zb3v2k00003255tdncj0qu", status: "recovered"}

```
<h5>recoverAllRemoved</h5>
<h6>Recover All the "removed" objects to the "live" array</h6>
`Params: recoverAllRemoved(fun)`
```javascript
people.getAllRemoved();
// Object {name: "Carlos", age: 22, cuid: "ci3zbod4i00003255fapsw2o4", status: "removed"}
// Object {name: "Maritza", age: 22, cuid: "ci3zbod4m00013255d49pu9qg", status: "removed"}
// Object {name: "Mary", age: 22, cuid: "ci3zbod4n00023255ou8ldbtu", status: "removed"}

// Recover all the removed items
people.recoverAllRemoved();

people.getAll();
// Object {name: "Carlos", age: 22, cuid: "ci3zbod4i00003255fapsw2o4", status: "recovered"}
// Object {name: "Maritza", age: 22, cuid: "ci3zbod4m00013255d49pu9qg", status: "recovered"}
// Object {name: "Mary", age: 22, cuid: "ci3zbod4n00023255ou8ldbtu", status: "recovered"}

```

<h5>filterRemoved</h5>
<h6>Return the objects from the "removed" array where the Lambda criteria matches</h6>
`Params: filterRemoved(criteria, fun)`
```javascript
people.filterRemoved(function (x) { return x.name == 'Mary' && x.age == 22; });
// Object {name: "Mary", age: 22, cuid: "ci3zbod4n00023255ou8ldbtu", status: "removed"}

```
<h5>mapRemoved</h5>
<h6>Return the mapped objects from the "removed" array where the Lambda criteria matches</h6>
`Params: mapRemoved(criteria, fun)`
```javascript
people.getAllRemoved();
// Object {name: "Steven", age: 28, cuid: "ci41iswtf000032536id8deb1", status: "removed"}
// Object {name: "Carlos", age: 22, cuid: "ci41iswtg00013253a9u7dzo5", status: "removed"}
// Object {name: "Carlos", age: 31, cuid: "ci41iswtg00023253fzru2c0a", status: "removed"}

people.mapRemoved(function (x) { return x.name; });
// ["Steven", "Carlos", "Carlos"]

people.mapRemoved(function (x) { return { key: x.cuid, value: x.name }; })
// Object {key: "ci41iswtf000032536id8deb1", value: "Steven"}
// Object {key: "ci41iswtg00013253a9u7dzo5", value: "Carlos"}
// Object {key: "ci41iswtg00023253fzru2c0a", value: "Carlos"}

```

<h5>uniquePropRemoved</h5>
<h6>Return the unique values from the "removed" objects by a property name</h6>
`Params: uniquePropRemoved(property, fun)`
```javascript
people.getAllRemoved();
// Object {name: "Steven", age: 28, cuid: "ci41iswtf000032536id8deb1", status: "removed"}
// Object {name: "Carlos", age: 22, cuid: "ci41iswtg00013253a9u7dzo5", status: "removed"}
// Object {name: "Carlos", age: 31, cuid: "ci41iswtg00023253fzru2c0a", status: "removed"}

people.uniquePropRemoved('name');
// ["Steven", "Carlos"]

people.uniquePropRemoved('status');
// ["removed"]

```


<h5>destroyRemovedByCUID</h5>
<h6>Destroy a "removed" object by CUID, the item will not be accessible anymore</h6>
`Params: destroyRemovedByCUID(cuid, fun)`
```javascript
people.getAllRemoved();
// Object {name: "Carlos", age: 22, cuid: "ci3zbod4i00003255fapsw2o4", status: "removed"}
// Object {name: "Maritza", age: 22, cuid: "ci3zbod4m00013255d49pu9qg", status: "removed"}
// Object {name: "Mary", age: 22, cuid: "ci3zbod4n00023255ou8ldbtu", status: "removed"}

// Destroy from memory
people.destroyRemovedByCUID('ci3zbod4n00023255ou8ldbtu');

people.getAllRemoved();
// Object {name: "Carlos", age: 22, cuid: "ci3zbod4i00003255fapsw2o4", status: "removed"}
// Object {name: "Maritza", age: 22, cuid: "ci3zbod4m00013255d49pu9qg", status: "removed"}

```

<br />
<h4>Local Storage - Web Browser</h4>

<h5>isLocalStorageSupported</h5>
<h6>Returns if the current web browser supports local storage</h6>
`Params: isLocalStorageSupported()`
```javascript
people.isLocalStorageSupported();
// true / false
```

<h5>saveLocalStorage</h5>
<h6>Saves the "live" and "removed" items into the local storage</h6>
`Params: saveLocalStorage(fun)`
```javascript
people.saveLocalStorage();

```

<h5>loadLocalStorage</h5>
<h6>Load the "live" and "removed" objects into the road's arrays</h6>
`Params: loadLocalStorage(fun)`
```javascript
// Load from local storage
people.loadLocalStorage();

people.getAll();
// Object {name: "Carlos", age: 22, cuid: "ci3zbod4i00003255fapsw2o4", status: "new"}

people.getAllRemoved();
// Object {name: "Maritza", age: 22, cuid: "ci3zbod4m00013255d49pu9qg", status: "removed"}
```

<h5>cleanLocalStorage</h5>
<h6>Clean the local storage memory</h6>
`Params: cleanLocalStorage(fun)`
```javascript

people.cleanLocalStorage();

```

<br />
<h4>Ajax Non-Async Requests</h4>

<h5>serverLoad</h5>
<h6>Call a GET verb to a url and then load the "live" array, it could be JSON or JS Array</h6>
`Params: serverLoad(ajaxUrl, fun)`
```javascript

// default: method: get | async: false

people.serverLoad('/json');

people.getAll();
// Object {name: "Steven", age: 28, id: 1, cuid: "ci3zcivvc00033255oi5x9fyi", status: "origin"}
// Object {name: "Carlos", age: 21, id: 2, cuid: "ci3zcivvc00043255g80zkt21", status: "origin"}

```

<h5>serverSendAll</h5>
<h6>Send "live" array to the server, it could be JSON or JS Array</h6>
`Params: serverSendAll(ajaxUrl, isJSON, fun)`
```javascript

// default: method: post | async: false

// As JS Array
people.serverSendAll('/items');
// "{"data":[{"name":"Steven","age":"28","id":"1","cuid":"ci3zcivvc00033255oi5x9fyi","status":"origin"},{"name":"Carlos","age":"21","id":"2","cuid":"ci3zcivvc00043255g80zkt21","status":"origin"},{"name":"Mochi","age":"20","id":"3","cuid":"ci3zcivvc00053255eyiv3bml","status":"origin"}]}"

// As JSON Array
people.serverSendAll('/items', true);
// "[{"name":"Steven","age":28,"id":1,"cuid":"ci3zcivvc00033255oi5x9fyi","status":"origin"},{"name":"Carlos","age":21,"id":2,"cuid":"ci3zcivvc00043255g80zkt21","status":"origin"},{"name":"Mochi","age":20,"id":3,"cuid":"ci3zcivvc00053255eyiv3bml","status":"origin"}]"

```

<h5>serverSendAllRemoved</h5>
<h6>Send "removed" array to the server, it could be JSON or JS Array</h6>
`Params: serverSendAllRemoved(ajaxUrl, isJSON, fun)`
```javascript
// default: method: post | async: false

// As JS Array
people.serverSendAllRemoved('/items');
// "{"data":[{"name":"Steven","age":"28","id":"1","cuid":"ci3zcivvc00033255oi5x9fyi","status":"removed"},{"name":"Carlos","age":"21","id":"2","cuid":"ci3zcivvc00043255g80zkt21","status":"removed"},{"name":"Mochi","age":"20","id":"3","cuid":"ci3zcivvc00053255eyiv3bml","status":"removed"}]}"

// As JSON Array
people.serverSendAllRemoved('/items', true);
// "[{"name":"Steven","age":28,"id":1,"cuid":"ci3zcivvc00033255oi5x9fyi","status":"removed"},{"name":"Carlos","age":21,"id":2,"cuid":"ci3zcivvc00043255g80zkt21","status":"removed"},{"name":"Mochi","age":20,"id":3,"cuid":"ci3zcivvc00053255eyiv3bml","status":"removed"}]"

```

<h5>serverSendFilter</h5>
<h6>Send "live" and "removed" Objects to the server when the filter criteria match, it could be JSON or JS Array</h6>
`Params: serverSendFilter(ajaxUrl, criteria, isJSON, fun)`
```javascript
// default: method: post | async: false

// As JS Array
people.serverSendFilter('/item', function(x) { return x.name == 'Steven'; });
// "{"data":[{"name":"Steven","age":"28","id":"1","cuid":"ci3zcivvc00033255oi5x9fyi","status":"origin"}]}"

// As JSON Array
people.serverSendFilter('/item', function(x) { return x.name == 'Steven'; }, true);
// "{"name":"Steven","age":28,"id":1,"cuid":"ci3zcivvc00033255oi5x9fyi","status":"removed"}"

```

<h5>serverSendAllMap</h5>
<h6>Send "live" and "removed" Objects to the server when the map criteria match, it could be JSON or JS Array</h6>
`Params: serverSendAll(ajaxUrl, criteria, isJSON, fun)`
```javascript
// default: method: post | async: false

// As JS Array
people.serverSendAllMap('/item', function(x) { return x.name; });
// "{"data":["Martha","Tanya","Steven","Carlos","Carlos"]}"

people.serverSendAllMap('/item', function(x) { return {name: x.name }; });
// "{"data":[{"name":"Martha"},{"name":"Tanya"},{"name":"Steven"},{"name":"Carlos"},{"name":"Carlos"}]}"

// As JSON Array
people.serverSendAllMap('/item', function(x) { return x.name; }, true);
// "{"Martha","Tanya","Steven","Carlos","Carlos"}"

people.serverSendAllMap('/item', function(x) { return {name: x.name }; }, true);
// "{ '{"name":"Martha"},{"name":"Tanya"},{"name":"Steven"},{"name":"Carlos"},{"name":"Carlos"}': '' }"

```

<h5>serverSendByCUID</h5>
<h6>Send "live" or "removed" Object to the server when the CUID match, it could be JSON or JS Array</h6>
`Params: serverSendByCUID(cuid, ajaxUrl, isJSON, fun)`
```javascript
// default: method: post | async: false

// As JS Array
people.serverSendByCUID('ci3zcivvc00033255oi5x9fyi', '/item');
// "{"name":"Steven","age":"28","id":"1","cuid":"ci3zcivvc00033255oi5x9fyi","status":"origin"}"

// As JSON Array
people.serverSendByCUID('ci3zcivvc00033255oi5x9fyi', '/item', true);
// "{"name":"Steven","age":28,"id":1,"cuid":"ci3zcivvc00033255oi5x9fyi","status":"removed"}"

```
