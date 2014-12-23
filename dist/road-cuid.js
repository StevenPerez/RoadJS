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
				}
									
				// Return Object
				if (fun.sendBack)
					return obj;
			}
			catch (err)
			{ throw err; }
		},
				
		remove: function remove(cuid) {
			try
			{
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
				}
				else
					return null;
			}
			catch(err)
			{ throw err; }
		},
		
		update: function update(obj, cuid) {
			try {
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
				}
				
			}
			catch (err)
			{ throw err; }
		},
		
		delete: function del(cuid) {
			try {
				
				validateCUID(cuid);

				// Get Object to change status as deleted
				var obj = this.getByCUID(cuid, false);
				
				// Validate if item was found
				if (obj == undefined || obj == [])
					throw 'No item found for cuid ' + cuid.toString();
				
				// Change Status and reinforce the cuid item				
				obj.cuid 	=  cuid;
				obj.status 	= 'deleted';

			}
			catch (err)
			{ throw err; }
			},
		
		setData: function setData(newData) {
			try
			{
				data = [];
				data = this.add(newData, { sendBack: true}, 'origin');
			}
			catch(err)
			{ throw err; }
		},
		
		getAll: function getAll() {
			try {
				return data;
			}
			catch (err)
			{ throw err; }
		},
		
		getByCUID: function getByCUID(cuid, isClone) {
			try
			{					
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
					
					return Clone;
				}
				else
					return result;
				
			}
			catch(err) { return err; }
		},
		
		length: function length() {
			try {
				return data.length;
			}
			catch (err)
			{ throw err; }
		},
		
		filter: function filter(criteria) {
			try {
				var result = [];
				
				// Create a clone in case of bad request
				var dataClone = [];
				$.extend(dataClone, data);
				
				// Find items
				dataClone.forEach(function (item) {
					if (criteria(item))
						result.push(item);
				});
				
				return result;
			}
			catch (err)
			{ throw err; }
		},
		
		// >> Removed Items
		getAllRemoved: function getAllRemoved() {
			try {
				return dataRemoved;
			}
			catch (err)
			{ throw err; }
		},
		
		getRemovedByCUID: function getRemovedByCUID(cuid, isClone) {
			try	
			{	
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

					return Clone;
				}
				else
					return result;

			}
			catch(err) { return err; }
		},
		
		cleanRemoved: function cleanRemoved() {
			try {
				dataRemoved = [];
			}
			catch (err)
			{ throw err; }
		},
		
		lengthRemoved: function lengthRemoved() {
			try {
				return dataRemoved.length;
			}
			catch (err)
			{ throw err; }
		},
		
		destroyRemovedByCUID: function destroyRemovedByCUID(cuid) {
			try
			{
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
			}
			catch(err)
			{ throw err; }
		},
		
		recoverRemovedByCUID: function recoverRemovedByCUID(cuid) {
			try {
				
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
			}
			catch (err)
			{ throw err; }
		},
		
		recoverAllRemoved: function recoverAllRemoved() {
			try {
				
				// Check if a cuid was not passed
				if (this.lengthRemoved() == 0)
					throw 'No data in memory';

				for (var i = 0; i < this.lengthRemoved(); i++)
					this.add(dataRemoved[i], null, 'recovered');

				// Clean the Removed list
				this.cleanRemoved();
			}
			catch (err)
			{ throw err; }
		},
		
		filterRemoved: function filterRemoved(criteria) {
			try {
				var result = [];
				
				// Create a clone in case of bad request
				var dataClone = [];
				$.extend(dataClone, dataRemoved);
				
				// Find items
				dataClone.forEach(function (item) {
					if (criteria(item))
						result.push(item);
				});
				
				return result;
			}
			catch (err)
			{ throw err; }
		},
		
		// 				>>> Local Storage <<<
		
		// Check if Local Storage is Supported
		isLocalStorageSupported: function isLocalStorageSupported() {
			try {
				return 'localStorage' in window && window['localStorage'] !== null;
			} catch (e) 
			{ return false; }
		},
		
		// Save in Local Storage
		saveLocalStorage: function saveLocalStorage() {
			try {
				if (this.isLocalStorageSupported())
				{
					localStorage['live'] = JSON.stringify(data);
					localStorage['removed'] = JSON.stringify(dataRemoved);
				}
				else
					throw 'No local storage supported.'
			}
			catch (err)
			{ throw err; }
		},
		
		// Load from Local Storage
		loadLocalStorage: function loadLocalStorage() {
			try {
				if (this.isLocalStorageSupported())
				{
					data = [];
					dataRemoved = [];
					
					data = JSON.parse(localStorage['live']);
					dataRemoved = JSON.parse(localStorage['removed']);
				}
				else
					throw 'No local storage supported.'
			}
			catch (err)
			{ throw err; }
		},
		
		// Clean Local Storage
		cleanLocalStorage: function cleanLocalStorage() {
			try {
				if (this.isLocalStorageSupported())
				{
					localStorage['live'] = null;
					localStorage['removed'] = null;
				}
				else
					throw 'No local storage supported.'
			}
			catch (err)
			{ throw err; }
		},
		
		// 				>>> Ajax Requests <<<
		
		// Load data through non-async request
		serverLoad: function serverLoad(ajaxUrl) {
			try {
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

			}
			catch(err)
			{ throw err; }
		},
		
		serverSendAll: function serverSendAll(ajaxUrl, isJSON) {
			try {
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
				
				// If it is JSON convert to JS Array
				return reponseAjax;
			}
			catch (err)
			{ throw err; }
		},
		
		serverSendAllRemoved: function serverSendAllRemoved(ajaxUrl, isJSON) {
			try {
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
				
				// If it is JSON convert to JS Array
				return reponseAjax;
			}
			catch (err)
			{ throw err; }
		},
		
		serverSendFilter: function serverSendFilter(ajaxUrl, criteria, isJSON) {
			try {
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
				
				// If it is JSON convert to JS Array
				return reponseAjax;
			}
			catch (err)
			{ throw err; }
		},
		
		serverSendByCUID: function serverSendByCUID(cuid, ajaxUrl, isJSON) {
			try {
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
				
				// If it is JSON convert to JS Array
				return reponseAjax;
			}
			catch (err)
			{ throw err; }
		},
		
	};
	
};