var road = function road()
{
	var data = [];				// Object container of the information
	var dataRemoved = [];		// Object container of the information
		
	// Update the Destination property's values base on the Source
	// when key properties match
	function updateProperties(Source, Destination)
	{
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
	function validateCUID(cuid) {
		// Check if a cuid was passed
		if (cuid)
		{
			if (typeof(cuid) == 'number')
				throw 'cuid value should be String';
		}
		else
			throw 'Missing cuid';
	}
	
	// Extend Array to get Unique values
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
	
	return {
		
		// 						>>> Memory Methods <<<
		
		// >> Not Removed Items
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
							obj[i].cuid 		= cuid();
						
						obj[i].status 	= status;
												
						// Clone Extended Object
						var copiedObject = {};
						$.extend(copiedObject, obj[i]);
						
						// Add the Object
						data.push(copiedObject);
						
						// OK Callback
						if(typeof(fun.ok) == "function")
							fun.ok(copiedObject);
					}
				}
				else
				// If it is just one Object
				{					
					if (status != 'recovered')
						obj.cuid 		= cuid();
					obj.status 		= status;
										
					// Clone Extended Object
					var copiedObject = {};
					$.extend(copiedObject, obj);
					
					// Add the Object
					data.push(copiedObject);
					
					// OK Callback
					if(typeof(fun.ok) == "function")
						fun.ok(copiedObject);
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
		},
				
		remove: function remove(cuid, fun) {
			try
			{
				// Initialize
				fun = fun || {};
				
				// Check if a cuid was passed
				validateCUID(cuid);
				
				// Check if a cuid was not passed
				if (this.length() == 0)
					throw 'No data in memory';
				
				// Get the index of the item to delete
				var removeIndex = data.map(function(data) 
										   { return data.cuid; })
									   .indexOf(cuid);
				
				// If an object was found
				if (removeIndex >= 0) 
				{					
					// Add the Clone to dataRemoved
					var objRemoved = this.getByCUID(cuid);
					objRemoved.status = 'removed';
					
					dataRemoved.push(objRemoved);
					
					// Remove the Item
					data.splice(removeIndex, 1);
					
					// Ok Callback
					if(typeof(fun.ok) == "function")
						fun.ok(objRemoved);
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
		},
		
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
						var objData = this.getByCUID(obj[i].cuid, false);
						
						// Validate if item was found
						if (objData == undefined)
							throw 'No item found for cuid ' + cuid.toString();
						
						// Update the properties between Source and Destination
						updateProperties(obj[i], objData);
						objData.status = 'changed';
						
						// Ok Callback
						if(typeof(fun.ok) == "function")
							fun.ok(objData);
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
					var objData = this.getByCUID(cuid.toString(), false);
					
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
		},
		
		delete: function del(cuid, fun) {
			try {

				// Initialize
				fun = fun || {};
				
				validateCUID(cuid);

				// Get Object to change status as deleted
				var obj = this.getByCUID(cuid, false);
				
				// Validate if item was found
				if (obj == undefined || obj == [])
					throw 'No item found for cuid ' + cuid.toString();
				
				// Change Status and reinforce the cuid item				
				obj.cuid 	=  cuid;
				obj.status 	= 'deleted';
				
				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok(obj);

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
		},
		
		setData: function setData(newData, fun) {
			try
			{
				// Initialize
				fun = fun || {};
				
				data = [];
				data = this.add(newData, { sendBack: true}, 'origin');
				
				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok(data);

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
		},
		
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
		},
		
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
		},
		
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
		},
		
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
		},
		
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
		},
		
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
		},
		
		// >> Removed Items
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
		},
		
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
		},
		
		cleanRemoved: function cleanRemoved(fun) {
			try {
				// Initialize
				fun = fun || {};
				
				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok();

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
		},
		
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
		},
		
		destroyRemovedByCUID: function destroyRemovedByCUID(cuid, fun) {
			try
			{
				// Initialize
				fun = fun || {};
				
				// Check if a cuid was passed
				validateCUID(cuid);
				
				// Check if a cuid was not passed
				if (this.lengthRemoved() == 0)
					throw 'No data in memory';
				
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
					fun.ok(removeIndex);

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
		},
		
		recoverRemovedByCUID: function recoverRemovedByCUID(cuid, fun) {
			try {
				// Initialize
				fun = fun || {};
				
				// Check if a cuid was passed
				validateCUID(cuid);
				
				// Check if a cuid was not passed
				if (this.lengthRemoved() == 0)
					throw 'No data in memory';
				
				// Get the item to recover from the removed list
				var objRecover = this.getRemovedByCUID(cuid);
				
				// Check if the item was found
				if (!objRecover)
					throw 'No item found for cuid ' + cuid.toString();
				
				// Add the item to the Non removed list
				this.add(objRecover, null, 'recovered');
				
				// Remove item from the Removed list
				this.destroyRemovedByCUID(cuid);
				
				// Ok Callback
				if(typeof(fun.ok) == "function")
					fun.ok(objRecover);

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
		},
		
		recoverAllRemoved: function recoverAllRemoved(fun) {
			try {
				// Initialize
				fun = fun || {};
				
				// Check if a cuid was not passed
				if (this.lengthRemoved() == 0)
					throw 'No data in memory';

				for (var i = 0; i < this.lengthRemoved(); i++)
				{
					this.add(dataRemoved[i], null, 'recovered');
					
					// Ok Callback
					if(typeof(fun.ok) == "function")
						fun.ok(dataRemoved[i]);
				}
				
				// Clean the Removed list
				this.cleanRemoved();
				
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
		},
		
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
		},
		
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
		},
		
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
		},
		
		// 				>>> Local Storage <<<
		
		// Check if Local Storage is Supported
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
		},
		
		// Save in Local Storage
		saveLocalStorage: function saveLocalStorage(fun) {
			try {
				// Initialize
				fun = fun || {};
				
				if (this.isLocalStorageSupported())
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
		},
		
		// Load from Local Storage
		loadLocalStorage: function loadLocalStorage(fun) {
			try {
				// Initialize
				fun = fun || {};
				
				if (this.isLocalStorageSupported())
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
		},
		
		// Clean Local Storage
		cleanLocalStorage: function cleanLocalStorage(fun) {
			try {
				// Initialize
				fun = fun || {};
				
				if (this.isLocalStorageSupported())
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
		},
		
		// 				>>> Ajax Requests <<<
		
		// Load data through non-async request
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
				if (dataAnalysis) {	
					this.add(dataAnalysis, {}, 'origin');
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
		},
		
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
		},
		
		serverSendAllMap: function serverSendAll(ajaxUrl, criteria, isJSON, fun) {
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
				
				this.filter(criteria).forEach( function(item){ objFiltered.push(item); });
				this.filterRemoved(criteria).forEach( function(item) { objFiltered.push(item); });
				
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
		},
		
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
		},
		
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
				
				this.filter(criteria).forEach( function(item){ objFiltered.push(item); });
				this.filterRemoved(criteria).forEach( function(item) { objFiltered.push(item); });
				
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
		},
		
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
				var objToSend = this.getByCUID(cuid);
				
				if (!objToSend) 
					objToSend = this.getRemovedByCUID(cuid);
				
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
		},
		
		// 				>>> Test Performance <<<
		performance: function performance(fn)
		{
			var start =+ new Date();
			fn();
			var end =  +new Date();  // log end timestamp
	 		return end - start;
		}
		
	};
	
};