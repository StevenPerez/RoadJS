/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 * 
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) + 
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));

/*======================================================================================

					|  __ \ / __ \   /\   |  __ \       | |/ ____|
					| |__) | |  | | /  \  | |  | |      | | (___  
					|  _  /| |  | |/ /\ \ | |  | |  _   | |\___ \ 
					| | \ \| |__| / ____ \| |__| | | |__| |____) |
					|_|  \_\\____/_/    \_\_____/   \____/|_____/ 

*///====================================================================================

var road = function road()
{
	var data = [];				// Object container of the information
	var dataRemoved = [];		// Object container of the information
	
	
	//-----------------------> OBJECT DELEGATION <--------------------------------
	
	// Get unique values from Array of Objects
	Array.prototype.unique = function() {
		
		var newArray = JSON.stringify(this);
		newArray = JSON.parse(newArray);
		var strCollection = JSON.stringify(this);

		newArray.forEach(function(item) { 
			
			var indexFirst = strCollection.indexOf(JSON.stringify(item));
			var indexOther = strCollection.indexOf(JSON.stringify(item), indexFirst + JSON.stringify(item).length)
			
			if (indexOther > -1)
				newArray.splice(newArray.indexOf(item), 1);
			
		});

		return newArray;
	}

	// Get distinct values for flat Array
	Array.prototype.distinct = function() {

	  var b = [this[0]], i, j, tmp;
	  for (i = 1; i < this.length; i++) {
		tmp = 1;
		for (j = 0; j < b.length; j++) {
		  if (this[i] == b[j]) {
			tmp = 0;
			break;
		  }
		}
		if (tmp) {
		  b.push(this[i]);
		}
	  }
	  return b;
	}

	// Allow to run async functions
	window.runAsync = function(fn, arguments, callback, ms){
			
			// Save Params in an Object
			var run = { fn: fn, arguments: arguments, callback: callback };
		
			// Execute Async
			setTimeout(function asyncF(){
				run.callback = run.callback || function () {};
				run.callback(run.fn.apply(undefined, run.arguments));
			}, (ms == undefined) ? 0 : ms);
	}
	
	// ==========================================================================
	
	//-----------------------> PRIVATE FUNCTIONS <-------------------------------
	
	// Update the Destination property's values base on the Source
	// when key properties match
	updateProperties : function updateProperties(Source, Destination) {
		try {
			
			for (var key in Source) {

				if(Destination.hasOwnProperty(key)){
					Destination[key] = Source[key];
				}
				
			}
		}
		catch (err)
		{ throw err; }
			
	}
	
	// Validate if CID is passed correctly as parameter
	validateCUID: function validateCUID(cuid) {
		// Check if a cuid was passed
		if (cuid)
		{
			if (typeof(cuid) == 'number')
				throw 'cuid value should be String';
		}
		else
			throw 'Missing cuid';
	}
	
	var observableCallback = undefined;
	obs: function obs() {

		execute: function execute(params)
		{
			observableCallback = observableCallback || function() {};
			observableCallback(params);
		}
		
		getObservable: function getObservable()
		{
			return observableCallback;
		}
		
		setObservable: function setObservable(fn)
		{
			fn = fn || function() {};
			observableCallback = fn;
		}
		
		return {
			execute: execute,
			getObservable: getObservable,
			setObservable: setObservable
		};
	}
	
	// ==========================================================================

	
	//-----------------------> PUBLIC FUNCTIONS <--------------------------------
	
	// 					> Live Items <
	
	add: function add(obj, fun, status) {
			try {
				
				// Initialize
				fun = fun || {};
				fun.sendBack = fun.sendBack || false;
				status = status || 'new';
				
				var length = 0;
				// If the object was passed
				if (obj) 
					length = obj.length || 1;
				else
				// If object was not passed
					throw 'Missing object to be included';
				
				// If it is an Array of Objects
				if (length > 1)
				{
					// Loop and add the properties to each Object
					for (var i = 0; i < length; i++)
					{
						if (status != 'recovered')
							obj[i].cuid = cuid();
						
						obj[i].status 	= status;
												
						// Clone Extended Object
						var copiedObject = {};
						$.extend(copiedObject, obj[i]);
						
						// Add the Object
						data.push(copiedObject);
						
						// OK Callback
						if(typeof(fun.ok) == "function")
							fun.ok(copiedObject);
						
						// Observe
						runAsync(obs().execute, [{ 
													action: 'Added', 
													obj: $.extend({}, copiedObject), 
													cuid: copiedObject.cuid 
												}]);
					}
				}
				else
				// If it is just one Object
				{					
					if (status != 'recovered')
						obj.cuid 	= cuid();
					
					obj.status 		= status;
										
					// Clone Extended Object
					var copiedObject = {};
					$.extend(copiedObject, obj);
					
					// Add the Object
					data.push(copiedObject);
					
					// OK Callback
					if(typeof(fun.ok) == "function")
						fun.ok(copiedObject);
					
					// Observe
					runAsync(obs().execute, [{ 
												action: 'Added', 
												obj: $.extend({}, copiedObject), 
												cuid: copiedObject.cuid 
											}]);
				}
				
				// Return Object
				if (fun.sendBack)
					return obj;
				
				// END Callback
				if(typeof(fun.end) == "function")
					fun.end(obj);
				
			}
			catch (err)
			{
				// ERROR Callback
				if(typeof(fun.err) == "function")
					fun.err(err);
				
				throw err; 
			}
		}
	
	remove: function remove(cuid, fun) {
			try
			{
				// Initialize
				fun = fun || {};
				
				// Check if a cuid was passed
				validateCUID(cuid);
				
				// Check if a cuid was not passed
				if (length() == 0)
					throw 'No data in memory';
				
				// Get the index of the item to delete
				var removeIndex = data.map(function(data) 
										   { return data.cuid; })
									   .indexOf(cuid);
				
				// If an object was found
				if (removeIndex >= 0) 
				{					
					// Add the Clone to dataRemoved
					var objRemoved = getByCUID(cuid);
					objRemoved.status = 'removed';
					
					dataRemoved.push(objRemoved);
					
					// Remove the Item
					data.splice(removeIndex, 1);
					
					// Ok Callback
					if(typeof(fun.ok) == "function")
						fun.ok(objRemoved);
					
					// Observe
					runAsync(obs().execute, [{ 
												action: 'Removed', 
												obj: $.extend({}, objRemoved), 
												cuid: objRemoved.cuid 
											}]);
				}
				else
					return null;
				
				// END Callback
				if(typeof(fun.end) == "function")
					fun.end();
			}
			catch (err)
			{
				// ERROR Callback
				if(typeof(fun.err) == "function")
					fun.err(err);
				
				throw err; 
			}
		}
	
	update: function update(obj, cuid, fun) {
			try {
				
				// Initialize
				fun = fun || {};
				
				// Validations
				if (!obj)
					throw 'Missing object';
								
				if (cuid)
				{
					if (typeof(cuid) == 'number')
						throw 'cuid value should be String';
				}
				
				var length = 0;
				// If the object was passed
				if (obj) 
					length = obj.length || 1;
				else
				// If object was not passed
					throw 'Missing object to be included';
				
				// If it is an Array of Objects to be updated
				if (length > 1)
				{
					// Loop and add the properties to each Object
					for (var i = 0; i < length; i++)
					{
						if (!obj[i].cuid)
							throw 'For array updates it is required the cuid property on each object.';
						// Get the object from Data by cuid
						var objData = getByCUID(obj[i].cuid, false);
						
						// Validate if item was found
						if (objData == undefined)
							throw 'No item found for cuid ' + cuid.toString();
						
						// Update the properties between Source and Destination
						updateProperties(obj[i], objData);
						objData.status = 'changed';
						
						// Ok Callback
						if(typeof(fun.ok) == "function")
							fun.ok(objData);
						
						// Observe
						runAsync(obs().execute, [{ 
													action: 'Updated', 
													obj: $.extend({}, objData), 
													cuid: objData.cuid 
												}]);
					}
				}
				else
				// If it is just one Object
				{
					if (!obj.cuid && !cuid)
						throw 'Missing cuid';
				
					if (!cuid && obj.cuid)
						cuid = cuid || obj.cuid;
					
					// Get the object from Data by cuid
					var objData = getByCUID(cuid.toString(), false);
					
					// Validate if item was found
					if (objData == undefined)
						throw 'No item found for cuid ' + cuid.toString();
					
					// Update the properties between Source and Destination
					updateProperties(obj, objData);
					
					// Change Status and reinforce the cuid item
					objData.cuid = cuid.toString();
					objData.status = 'changed';
					
					// Ok Callback
					if(typeof(fun.ok) == "function")
						fun.ok(objData);
					
					// Observe
					runAsync(obs().execute, [{ 
												action: 'Updated', 
												obj: $.extend({}, objData), 
												cuid: objData.cuid 
											}]);
				}
				
				// End Callback
				if(typeof(fun.end) == "function")
					fun.end();
				
			}
			catch (err)
			{
				// ERROR Callback
				if(typeof(fun.err) == "function")
					fun.err(err);
				
				throw err; 
			}
		}
	
	del: function del(cuid, fun) {
			try {

				// Initialize
				fun = fun || {};
				
				validateCUID(cuid);

				// Get Object to change status as deleted
				var obj = getByCUID(cuid, false);
				
				// Validate if item was found
				if (obj == undefined || obj == [])
					throw 'No item found for cuid ' + cuid.toString();
				
				// Change Status and reinforce the cuid item				
				obj.cuid 	=  cuid;
				obj.status 	= 'deleted';
				
				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok(obj);

				// Observe
				runAsync(obs().execute, [{ 
											action: 'Deleted', 
											obj: $.extend({}, obj), 
											cuid: obj.cuid 
										}]);
				
				// End Callback
				if(typeof(fun.end) == "function")
					fun.end();
			}
			catch (err)
			{
				// ERROR Callback
				if(typeof(fun.err) == "function")
					fun.err(err);
				
				throw err; 
			}
		}
		
	setData: function setData(newData, fun) {
		try
		{
			// Initialize
			fun = fun || {};

			data = [];
			data = add(newData, { sendBack: true}, 'origin');

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(data);

			// Observe
			runAsync(obs().execute, [{ 
										action: 'Set Data', 
										obj: $.extend({}, data), 
										cuid: null 
									}]);
			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	getAll: function getAll(fun) {
		try {

			// Initialize
			fun = fun || {};

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(data);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			return data;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	getByCUID: function getByCUID(cuid, isClone, fun) {
		try
		{
			// Initialize
			fun = fun || {};

			// If it is undefined then create a Clone of the
			// returned object
			if (isClone == undefined) { isClone = true; }

			// Check if a cuid was passed
			validateCUID(cuid);

			// Filter Items
			var result = data.filter(function(item) 
									 { return item.cuid == cuid; }
							  )[0];

			if (!result)
				throw 'No item found for cuid ' + cuid;

			if (isClone)
			{
				var Clone = {};
				$.extend(Clone, result);

				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok(Clone);

				// End Callback
				if(typeof(fun.end) == "function")
					fun.end();

				return Clone;
			}
			else
			{
				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok(result);

				// End Callback
				if(typeof(fun.end) == "function")
					fun.end();

				return result;
			}
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	length: function length(fun) {
		try {
			// Initialize
			fun = fun || {};

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(data.length);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			return data.length;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	filter: function filter(criteria, fun) {
		try {

			// Initialize
			fun = fun || {};

			var result = [];

			// Create a clone in case of bad request
			var dataClone = [];
			$.extend(dataClone, data);

			// Find items
			dataClone.forEach(function (item) {
				if (criteria(item))
				{
					// Ok Callback
					if(typeof(fun.ok) == "function")
						fun.ok(item);

					result.push(item);
				}
			});

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end(result);

			return result;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	map: function map(criteria, fun) {
		try {
			// Initialize
			fun = fun || {};

			var result = [];

			// Create a clone in case of bad request
			var dataClone = [];
			$.extend(dataClone, data);

			// New object mapped
			var newObj = dataClone.map(criteria);

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(newObj);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			return newObj;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	uniqueProp: function uniqueProp(property, fun) {
		try {
			// Initialize
			fun = fun || {};

			var result = [];

			if (property == undefined)
				throw 'Missing property name.';

			if (typeof(property) != 'string' || property.length == 0)
				throw 'Property name should be String';

			// Create a clone in case of bad request
			var dataClone = [];
			$.extend(dataClone, data);

			// Create new unique object
			var newObj = dataClone.map(function (x) { return x[property] }).distinct();

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(newObj);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			return newObj;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	// 					> Removed Items <
		
	getAllRemoved: function getAllRemoved(fun) {
		try {
			// Initialize
			fun = fun || {};

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(dataRemoved);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			return dataRemoved;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	getRemovedByCUID: function getRemovedByCUID(cuid, isClone, fun) {
		try	
		{	
			// Initialize
			fun = fun || {};

			// If it is undefined then create a Clone of the
			// returned object
			if (isClone == undefined) { isClone = true; }

			// Check if a cuid was passed
			validateCUID(cuid);

			// Filter Items
			var result = dataRemoved.filter(function(item) 
										{ return item.cuid == cuid; }
									 )[0];

			if (!result)
				throw 'No item found for cuid ' + cuid;

			if (isClone)
			{
				var Clone = {};
				$.extend(Clone, result);

				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok(Clone);

				// End Callback
				if(typeof(fun.end) == "function")
					fun.end();

				return Clone;
			}
			else
			{
				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok(result);

				// End Callback
				if(typeof(fun.end) == "function")
					fun.end();

				return result;
			}
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	cleanRemoved: function cleanRemoved(fun) {
		try {
			// Initialize
			fun = fun || {};

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok();

			// Observe
			runAsync(obs().execute, [{ 
										action: 'Clean Removed', 
										obj: {}, 
										cuid: null
									}]);
			
			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			dataRemoved = [];
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	lengthRemoved: function lengthRemoved(fun) {
		try {
			// Initialize
			fun = fun || {};

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(dataRemoved.length);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			return dataRemoved.length;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	destroyRemovedByCUID: function destroyRemovedByCUID(cuid, fun) {
		try
		{
			// Initialize
			fun = fun || {};

			// Check if a cuid was passed
			validateCUID(cuid);

			
			// Check if a cuid was not passed
			if (lengthRemoved() == 0)
				throw 'No data in memory';

			// Get Item that will be destroyed
			var objDestroyed = getRemovedByCUID(cuid);
			
			// Get the index of the item to delete
			var removeIndex = dataRemoved.map(function(dataRemoved) 
											  { return dataRemoved.cuid; })
										 .indexOf(cuid);

			// If an object was found
			if (removeIndex >= 0) 
			{	
				// Remove the Item
				dataRemoved.splice(removeIndex, 1);
			}
			else
				return null;

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(objDestroyed);

			// Observe
			runAsync(obs().execute, [{ 
										action: 'Destroyed', 
										obj: $.extend({}, objDestroyed), 
										cuid: objDestroyed.cuid 
									}]);
			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	recoverRemovedByCUID: function recoverRemovedByCUID(cuid, fun) {
		try {
			// Initialize
			fun = fun || {};

			// Check if a cuid was passed
			validateCUID(cuid);

			// Check if a cuid was not passed
			if (lengthRemoved() == 0)
				throw 'No data in memory';

			// Get the item to recover from the removed list
			var objRecover = getRemovedByCUID(cuid);

			// Check if the item was found
			if (!objRecover)
				throw 'No item found for cuid ' + cuid.toString();

			// Add the item to the Non removed list
			add(objRecover, null, 'recovered');

			// Remove item from the Removed list
			destroyRemovedByCUID(cuid);

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(objRecover);

			// Observe
			runAsync(obs().execute, [{ 
										action: 'Recovered', 
										obj: $.extend({}, objRecover), 
										cuid: objRecover.cuid 
									}]);
			
			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	recoverAllRemoved: function recoverAllRemoved(fun) {
		try {
			// Initialize
			fun = fun || {};

			// Check if a cuid was not passed
			if (lengthRemoved() == 0)
				throw 'No data in memory';

			for (var i = 0; i < lengthRemoved(); i++)
			{
				add(dataRemoved[i], null, 'recovered');

				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok(dataRemoved[i]);
			}

			// Observe
			runAsync(obs().execute, [{ 
										action: 'Recovered All', 
										obj: $.extend({}, dataRemoved), 
										cuid: null 
									}]);
			
			// Clean the Removed list
			cleanRemoved();


			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	filterRemoved: function filterRemoved(criteria, fun) {
		try {
			// Initialize
			fun = fun || {};

			var result = [];

			// Create a clone in case of bad request
			var dataClone = [];
			$.extend(dataClone, dataRemoved);

			// Find items
			dataClone.forEach(function (item) {
				if (criteria(item))
				{
					// Ok Callback
					if(typeof(fun.ok) == "function")
						fun.ok(item);

					result.push(item);
				}
			});

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end(result);

			return result;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	mapRemoved: function mapRemoved(criteria, fun) {
		try {
			// Initialize
			fun = fun || {};

			var result = [];

			// Create a clone in case of bad request
			var dataClone = [];
			$.extend(dataClone, dataRemoved);

			var newObj = dataClone.map(criteria);

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(newObj);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			return newObj;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	uniquePropRemoved: function uniquePropRemoved(property, fun) {
		try {
			// Initialize
			fun = fun || {};

			var result = [];

			if (property == undefined)
				throw 'Missing property name.';

			if (typeof(property) != 'string' || property.length == 0)
				throw 'Property name should be String';

			// Create a clone in case of bad request
			var dataClone = [];
			$.extend(dataClone, dataRemoved);

			// New unique object
			var newObj = dataClone.map(function (x) { return x[property] }).distinct();

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(newObj);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			return newObj;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	// 				> Local Storage <

	isLocalStorageSupported: function isLocalStorageSupported() {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} 
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	saveLocalStorage: function saveLocalStorage(fun) {
		try {
			// Initialize
			fun = fun || {};

			if (isLocalStorageSupported())
			{
				localStorage['live'] = JSON.stringify(data);
				localStorage['removed'] = JSON.stringify(dataRemoved);

				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok();
			}
			else
				throw 'No local storage supported.'

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	loadLocalStorage: function loadLocalStorage(fun) {
		try {
			// Initialize
			fun = fun || {};

			if (isLocalStorageSupported())
			{
				data = [];
				dataRemoved = [];

				data = JSON.parse(localStorage['live']);
				dataRemoved = JSON.parse(localStorage['removed']);

				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok();
			}
			else
				throw 'No local storage supported.'

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	cleanLocalStorage: function cleanLocalStorage(fun) {
		try {
			// Initialize
			fun = fun || {};

			if (isLocalStorageSupported())
			{
				localStorage['live'] = null;
				localStorage['removed'] = null;

				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok();
			}
			else
				throw 'No local storage supported.'

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	// 				>>> Ajax Requests <<<

	serverLoad: function serverLoad(ajaxUrl, fun) {
		try {
			// Initialize
			fun = fun || {};

			var ajaxParams = {};

			// Validate there are params
			if (!ajaxUrl)
				throw 'Missing ajax url parameter';

			// Set not async load
			ajaxParams.async = false;
			ajaxParams.method = 'GET';
			ajaxParams.url = ajaxUrl;

			// Initialize Data
			data = [];

			// Send Ajax Request
			var dataAnalysis = $.ajax(ajaxParams).responseText;

			// If it is JSON convert to JS Array
			if (typeof(dataAnalysis) == 'string')
				dataAnalysis = JSON.parse(dataAnalysis);

			// If there is data then Add to data
			if (dataAnalysis.length == 1) {	
				add(dataAnalysis[0], {}, 'origin');
			} else {
				add(dataAnalysis, {}, 'origin');
			}

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(dataAnalysis);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	serverSendAll: function serverSendAll(ajaxUrl, isJSON, fun) {
		try {
			// Initialize
			fun = fun || {};

			var ajaxParams = {};

			// Initialize isJSON
			if (isJSON == undefined) { isJSON = false; }

			// Validate there are params
			if (!ajaxUrl)
				throw 'Missing ajax url parameter';

			if (!data || data == [])
				throw 'No data found.';

			// -----------------------------------------------------------

			if (isJSON == false)
				ajaxParams.data = { 'data': data };
			else
				ajaxParams.data = JSON.stringify(data);

			ajaxParams.async = false;
			ajaxParams.method = 'POST';
			ajaxParams.url = ajaxUrl;

			// Send and Get Ajax Response
			var reponseAjax = $.ajax(ajaxParams).responseText;

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(reponseAjax);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			// If it is JSON convert to JS Array
			return reponseAjax;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	serverSendAllMap: function serverSendAllMap(ajaxUrl, criteria, isJSON, fun) {
		try {
			// Initialize
			fun = fun || {};

			var ajaxParams = {};

			// Initialize isJSON
			if (isJSON == undefined) { isJSON = false; }

			// Validate there are params
			if (!ajaxUrl)
				throw 'Missing ajax url parameter';

			if (!data || data == [] && !dataRemoved || dataRemoved == [])
				throw 'No data found.';

			// -----------------------------------------------------------

			var objFiltered = [];

			filter(criteria).forEach( function(item){ objFiltered.push(item); });
			filterRemoved(criteria).forEach( function(item) { objFiltered.push(item); });

			// -----------------------------------------------------------

			if (isJSON == false)
				ajaxParams.data = { 'data': objFiltered.map(criteria) };
			else
				ajaxParams.data = JSON.stringify(objFiltered.map(criteria));

			ajaxParams.async = false;
			ajaxParams.method = 'POST';
			ajaxParams.url = ajaxUrl;

			// Send and Get Ajax Response
			var reponseAjax = $.ajax(ajaxParams).responseText;

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(reponseAjax);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			// If it is JSON convert to JS Array
			return reponseAjax;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	serverSendAllRemoved: function serverSendAllRemoved(ajaxUrl, isJSON, fun) {
		try {
			// Initialize
			fun = fun || {};

			var ajaxParams = {};

			// Initialize isJSON
			if (isJSON == undefined) { isJSON = false; }

			// Validate there are params
			if (!ajaxUrl)
				throw 'Missing ajax url parameter';

			if (!dataRemoved || dataRemoved == [])
				throw 'No data found.';

			// -----------------------------------------------------------

			if (isJSON == false)
				ajaxParams.data = { 'data': dataRemoved };
			else
				ajaxParams.data = JSON.stringify(dataRemoved);

			ajaxParams.async = false;
			ajaxParams.method = 'POST';
			ajaxParams.url = ajaxUrl;

			// Send and Get Ajax Response
			var reponseAjax = $.ajax(ajaxParams).responseText;

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(reponseAjax);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			// If it is JSON convert to JS Array
			return reponseAjax;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	serverSendFilter: function serverSendFilter(ajaxUrl, criteria, isJSON, fun) {
		try {
			// Initialize
			fun = fun || {};

			var ajaxParams = {};

			// Initialize isJSON
			if (isJSON == undefined) { isJSON = false; }

			// Validate there are params
			if (!ajaxUrl)
				throw 'Missing ajax url parameter';

			// Validate there are params
			if (!criteria)
				throw 'Missing filter criteria parameter';

			if (!data || data == [] && !dataRemoved || dataRemoved == [])
				throw 'No data found.';

			// -----------------------------------------------------------

			var objFiltered = [];

			filter(criteria).forEach( function(item){ objFiltered.push(item); });
			filterRemoved(criteria).forEach( function(item) { objFiltered.push(item); });

			if (isJSON == false)
				ajaxParams.data = { 'data': objFiltered };
			else
				ajaxParams.data = JSON.stringify(objFiltered);

			ajaxParams.async = false;
			ajaxParams.method = 'POST';
			ajaxParams.url = ajaxUrl;

			// Send and Get Ajax Response
			var reponseAjax = $.ajax(ajaxParams).responseText;

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(reponseAjax);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end();

			// If it is JSON convert to JS Array
			return reponseAjax;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	serverSendByCUID: function serverSendByCUID(cuid, ajaxUrl, isJSON, fun) {
		try {
			// Initialize
			fun = fun || {};

			var ajaxParams = {};

			// Check if a cuid was passed
			validateCUID(cuid);

			// Initialize isJSON
			if (isJSON == undefined) { isJSON = false; }

			// Validate there are params
			if (!ajaxUrl)
				throw 'Missing ajax url parameter';

			// Initialize Data
			var objToSend = '';
			try { 
				objToSend = getByCUID(cuid); 
			}
		 	catch(err) { 
				objToSend = getRemovedByCUID(cuid); 
			}

			if (typeof(objToSend) == 'string')
				throw 'No item found for cuid ' + cuid;

			// -----------------------------------------------------------

			if (isJSON == false)
				ajaxParams.data = objToSend;
			else
				ajaxParams.data = JSON.stringify(objToSend);

			ajaxParams.async = false;
			ajaxParams.method = 'POST';
			ajaxParams.url = ajaxUrl;

			// Send and Get Ajax Response
			var reponseAjax = $.ajax(ajaxParams).responseText;

			// Ok Callback
			if(typeof(fun.ok) == "function")
				fun.ok(objToSend, reponseAjax);

			// End Callback
			if(typeof(fun.end) == "function")
				fun.end(reponseAjax);

			// If it is JSON convert to JS Array
			return reponseAjax;
		}
		catch (err)
		{
			// ERROR Callback
			if(typeof(fun.err) == "function")
				fun.err(err);

			throw err; 
		}
	}

	// 				> Test Performance <
	
	performance: function performance(fn) {
		var start =+ new Date();
		fn();
		var end =  +new Date();  // log end timestamp
		return end - start;
	}
	
	// ==========================================================================
	
	return {
		
		// Live Items
		add: add,
		remove: remove,
		update: update,
		delete: del,
		setData: setData,
		getAll: getAll,
		getByCUID: getByCUID,
		length: length,
		filter: filter,
		map: map,
		uniqueProp: uniqueProp,
		
		// Removed Items
		getAllRemoved: getAllRemoved,
		getRemovedByCUID: getRemovedByCUID,
		cleanRemoved: cleanRemoved,
		lengthRemoved: lengthRemoved,
		destroyRemovedByCUID: destroyRemovedByCUID,
		recoverRemovedByCUID: recoverRemovedByCUID,
		recoverAllRemoved: recoverAllRemoved,
		filterRemoved: filterRemoved,
		mapRemoved: mapRemoved,
		uniquePropRemoved: uniquePropRemoved,
		
		// Local Storage
		isLocalStorageSupported: isLocalStorageSupported,
		saveLocalStorage: saveLocalStorage,
		loadLocalStorage: loadLocalStorage,
		cleanLocalStorage: cleanLocalStorage,
		
		// Server Ajax Requests
		serverLoad: serverLoad,
		serverSendAll: serverSendAll,
		serverSendAllMap: serverSendAllMap,
		serverSendAllRemoved: serverSendAllRemoved,
		serverSendFilter: serverSendFilter,
		serverSendByCUID: serverSendByCUID,
		
		performance: performance,
		observe: obs()
	};
	
};