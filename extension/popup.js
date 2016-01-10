//*************************************************
//*************** Configurations
//*************************************************
var RandME = {
  configs : {
    debugging         : true, //Set this to false to stop console logs
    recents_limit     : 5,  // Limit the history terms
    no_gif_message    : "No GIFs found :(",
    api_path          : "http://baleiabalao.com/_apps/rando/", //Server address
  },
  //API commands //Used to define what parameters do we need to send to the server
  commands : {
    random     : 'rand',  //Return a random GIF for search term
    byID       : 'byid',  //Return a specific image
    translate  : 'trans', //Return a GIF translating the search term
  },
  keys : {
    recent      : 'recent',
    loved       : 'loved',
  },
  constants : {
    recent_term_prefix        : 'rt_',
    recent_term_button_prefix : 'brt_',
  },
  ui : {
    search_btn          : 'serach_btn',
    search_textfield    : 'search_textfield',
    thumbs_up_btn       : 'thumbs_up',
    love_btn            : 'love_gif',
    recent_terms        : 'recent_terms',
    gif_url             : 'gif_url',
    gif_img             : 'gif_img',
    loading             : 'loading',
  }
}


//As soon DOM complete loading, add all primary event listeners
//Also populates the recent terms and make a initial search to present a random gif
document.addEventListener('DOMContentLoaded', function() {
  RandoInit(); //Init Rando
});


//**********************************
//        INITIAL Actions
//**********************************
function RandoInit(){

  RandoInitialListeners();

  //Displays the recent tems
  populateRecentSeachTerms();

  //Make a initial search
  requestRandomGif('dancing',false);
}

function RandoInitialListeners(){
  //Add the action to the search button
  listener.click( RandME.ui.search_btn, function() {
    handleSearch();
  });

  //
  listener.keypress( RandME.ui.search_textfield, function(e) {
    if (e.keyCode == '13') {
      handleSearch();
    }
  });

  //Add the action to the thumbs up button
  listener.click( RandME.ui.thumbs_up_btn, function() {
    requestRandomGif('thumbs up',false);
  });

  listener.click( RandME.ui.love_btn, function() {
    requestGifByID('feqkVgjJpYtjy');
  });

  // love.add('feqkVgjJpYtjy');
  // love.list();
}


//**********************************
//      RECENT SEARCH TERMS
// Deal with the latest searchs bar
//**********************************
/*
  Return a slug containing only tha A to Z characters
  If given a prefix, the result will contain it
*/
function termSlug( term, prefix ){
  var slug = term.replace(/[^a-zA-Z ]/g, "");
  return prefix ? prefix+slug : slug;
}

//Return a HTML code for the RECENTS footer containing the given term
function searchTermToHTML( term ){
  var slug    = termSlug(term, RandME.constants.recent_term_prefix);
  var btnSlug = termSlug(term, RandME.constants.recent_term_button_prefix);
  return "<div class='search-term'><div class='term' id='"+ slug +"'>"+term+"</div><button class='remove-term' id='" + btnSlug + "''>x</button></div>";
}

function populateRecentSeachTerms(){
  recent.list( function( items ) {
    var rt = items[RandME.keys.recent] || new Array();
    var rt_container = element( RandME.ui.recent_terms );

    var echo = ""; //Final printable HTML
    for (var i = 0; i < rt.length; i++) {
      echo += searchTermToHTML(rt[i]); //Get the HTML code and add to the final output
    };

    rt_container.innerHTML = echo; //Insert the final content to container
    handleRecentTermsListeners(); //Add the necessary actions to all recent buttons
  });
}

function handleRecentTermsListeners(){
  recent.list( function( items ){
    var rt = items[RandME.keys.recent] || new Array();

    //Loop to get all Buttons and add the listeners to it
    for (var i = 0; i < rt.length; i++) {

      //Search button
      var objID = termSlug( rt[i] , RandME.constants.recent_term_prefix );
      listener.click( objID, function() {
        element( RandME.ui.search_textfield ).value = this.innerHTML;
        handleSearch();
      });

      //Remove searchterm from bar
      var removeBtnID = termSlug( rt[i] , RandME.constants.recent_term_button_prefix );
      listener.click( removeBtnID, function() {
        var thisID = this.id.replace( RandME.constants.recent_term_button_prefix, RandME.constants.recent_term_prefix );
        var searchTerm  = element( thisID ).innerHTML;
        removeRecentSearchTerm( searchTerm ); //Remove serachterm
      });

    };
  });
}
//Remove a speific recent term //triggered by the recent term X button
function removeRecentSearchTerm( term ){
  recent.remove( term, function(){
    populateRecentSeachTerms();
  });
}









//**********************************
//         SEARCH ACTIONS
//**********************************
function handleSearchTerms( term ){
  recent.add( term , function( items ) {
    populateRecentSeachTerms();
  });
}

//Get the search term and request the GIF
function handleSearch(){
  var term = element( RandME.ui.search_textfield ).value;
  if(term.length){
    requestRandomGif( term, true);
  }
}


//**********************************
//               UI
//**********************************
//Deal with loader visibility
var loader = (function () {
  return {
    show: function() {
      var loaderContainer = element( RandME.ui.loading );
      loaderContainer.className = "";
    },
    hide: function() {
      var loaderContainer = element( RandME.ui.loading );
      loaderContainer.className = "hidden";
    }
  }
}());
//Add the result image to UI
function renderGifResponse(gifURL, gifWidth, gifHeight) {
  var status = gifURL ? gifURL : RandME.configs.no_gif_message;
  element( RandME.ui.gif_url ).textContent = status;

  var imageResult       = element( RandME.ui.gif_img );
  imageResult.src       = "";
  imageResult.src       = gifURL ? gifURL : "images/sad-face.png";
  imageResult.width     = gifURL ? gifWidth : 335;
  imageResult.height    = gifURL ? gifHeight : 180;

  loader.hide();
}





//**********************************
//              API
//**********************************
/*
  Request a random GIF
*/
function requestRandomGif( term, save_term ){
  if(!term){ return; }

  requestGifFromServer( RandME.commands.random , term ); //Call server

  if(save_term){ //Save as recent term
    handleSearchTerms(term);
  }
}

/*
  Request an specific GIF from server
*/
function requestGifByID( gifID ){
  if(!gifID){return;}
  requestGifFromServer( RandME.commands.byID , gifID ); //Call server
}


function api( cmd, param, success, fail ){

  var x = new XMLHttpRequest();
  x.open('GET', api.url( cmd , param ) );
  x.responseType = 'json';

  x.onload = function(){

    var r = x.response;
    if(!r){ debug.error( "[api]", cmd, "FAIL", "No response");
      fail(); return;
    }
    if(r.error){ debug.error( "[api]", cmd, "FAIL", response.message);
      fail(); return;
    }else if (!r.data) { debug.error( "[api]", cmd, "FAIL", "Response contains NO DATA");
      fail(); return;
    };

    success( r );
  };

  x.onerror = function(){ debug.error( "[api]", cmd, "FAIL", "Network error");
    fail();
  };

  x.send();
}
api.url = function(cmd, param){
  param = encodeURIComponent(param);
  switch(cmd) {
    case RandME.commands.byID:
    return RandME.configs.api_path + "?cmd="+RandME.commands.byID+"&id=" + param;
        break;
    case RandME.commands.random:
    default:
      return RandME.configs.api_path + "?cmd="+RandME.commands.random+"&gif=" + param;
  }
}

/*
  Make the final server request
  * Receive a command (cmd) and a param (ID, search term)
  ** Once the server responds, render the rreceived image
*/
function requestGifFromServer( cmd , param ){
  debug.log( "[getGifImage]:", "Requesting GIF for:", param );

  loader.show(); //Show loading

  api( cmd, param, function( response ){

    var d = response.data; //Response GIF data
    renderGifResponse( d.url, d.width, d.height ); //Display final GIF
    debug.log("[requestGifFromServer]", "RESPONSE:", response);

  } , function(){
    loader.hide();
  });
}





//**********************************
//         ELEMENT HELPER
//**********************************
function element( objID ){
  return document.getElementById( [objID] );
}

//**********************************
//         LISTENER HELPER
//**********************************
function listener(){}
listener.click = function( objID, callback ){
  element( objID ).addEventListener( 'click', callback );
}
listener.keypress = function ( objID, callback ){
  element( objID ).addEventListener( 'keypress', callback );
}

//**********************************
//             STORAGE
//**********************************
function storage(){}
storage.get = function( key, callback ){
  chrome.storage.sync.get( [key] , callback );
}
storage.set = function( key, data, callback ){
  chrome.storage.sync.set( { [key] : data }, callback );
}
storage.remove = function(key){
  chrome.storage.sync.remove( [key] );
}

//**********************************
//             RECENT
//  Deal with recent search terms
//**********************************
function recent(){};
recent.set = function( data, callback ){
  storage.set( RandME.keys.recent, data, callback ? callback : function() {
    debug.log( "[recent.set]", "Success", data);
  });
}
recent.list = function( callback ){
  storage.get( RandME.keys.recent, callback ) ;
}
recent.add = function( term, callback ){
  term = term.toLowerCase();
  recent.list( function( items ) {

    var rt = items[RandME.keys.recent] || new Array();

    //Check if limit was reached
    if(rt.length >= RandME.configs.recents_limit){
      rt.pop();
    }

    //Check if term already exists
    if( rt.indexOf( term ) == -1 ){

      //Add recent term to set
      rt.unshift( term );

      //Debug
      debug.warn("[recent.add]:", "SUCCESS:", term);

      //Replace set
      recent.set( rt , callback );

    }else{
      debug.warn("[recent.add]:", "FAIL:", "Search term already exists");
    }

  });
}
recent.remove = function( term, callback ){
  term = term.toLowerCase();
  recent.list( function( items ) {

    var rt = items[RandME.keys.recent] || new Array();
    var index = rt.indexOf( term );

    if(index > -1){

      //Remove searchterm from set
      rt.splice(index, 1);

      //Debug
      debug.warn("[recent.remove]:", "SUCCESS:", term);

      //Replace set
      recent.set( rt , callback );

    }else{
      debug.error("[recent.remove]", "FAIL:", "Search term not found");
    }
  });
}

//**********************************
//          Loving GIFs
//**********************************
//Get loved GIFs
//Check if GIF is loved
//Add love to GIF
//Remove love from GIF
//Display loved GIF
function love(){}
love.set = function( data, callback ){
  storage.set( RandME.keys.loved, data, callback ? callback : function() {
    debug.warn( "[love.set]", "SUCCESS:", data);
  });
}
love.add = function( gifID ){
  storage.get( RandME.keys.loved , function( items ){

    var lvd = items[RandME.keys.loved] || new Array();
    if( lvd.indexOf( gifID ) == -1 ){

      //Add gifID to the set
      lvd.unshift( gifID );

      //Debug
      debug.warn( "[love.add]", "SUCCESS:", gifID );

      //Save set
      love.set( lvd );

    }else{
      debug.error( "[love.add]", "FAIL:", "ID already exists" );
    }

  });
}
love.remove = function( gifID ){
  storage.get( RandME.keys.loved , function( items ){

    var lvd = items[RandME.keys.loved] || new Array();
    var index = lvd.indexOf( gifID );
    if( index > -1 ){

      //Remove gifID from set
      lvd.splice(index, 1);

      //Debug
      debug.warn( "[love.remove]" , "SUCCESS:", gifID );

      //Save new SET
      love.set( lvd );

    }else{
      debug.error( "[love.remove]", "FAIL:", "ID does not exist" );
    }

  });
}
love.list = function( callback ){
  storage.get( RandME.keys.loved , function( items ){
    var lvd = items[RandME.keys.loved];
    debug.log( "[love.list]",  lvd );
  });
}



//**********************************
//          Debug Helper
//**********************************
var debug = (function () {
  return {
    log: function() {
      if(RandME.configs.debugging){
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console, args);
      }
    },
    warn: function() {
      if(RandME.configs.debugging){
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, args);
      }
    },
    error: function() {
      if(RandME.configs.debugging){
        var args = Array.prototype.slice.call(arguments);
        console.error.apply(console, args);
      }
    }
  }
}());
