RoadJS
======

Useful memory Array object management library, it is very helpful when you want to perform changes on properties, save and recover the Array [objects] in memory or store and load the Array from the Web Browser's local storage, filter, work with removed items, ajax request to load and send from the server and so on...
<br/><br/>

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

<h5>Add</h5>
```javascript
// Create People
var people = road();

people.add({ name: 'Steven', age: 28 });
// Object Added => Object {name: "Steven", age: 20, cuid: "ci3yr0js000003252zgao2whl", status: "new"}
```
