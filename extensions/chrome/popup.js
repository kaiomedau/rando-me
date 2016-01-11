//*************************************************
//*************** Configurations
//*************************************************
var RandME = {
  configs : {
    debugging         : true, //Set this to false to stop console logs
    recents_limit     : 5,  // Limit the history terms
    initial_serach    : "Dance", //Seach term for the first request.
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
    recent      : 'recent', //Used to display the recent seach terms
    loved       : 'loved', //Used to display the loved GIFs
    last        : 'last', //Used to recover the last GIF loaded
  },
  constants : {
    recent_term_prefix        : 'rt_',
    recent_term_button_prefix : 'brt_',
    loved_class               : 'loved',
    opened_class              : 'open',
    visible_class             : 'visible',
  },
  ui : {
    main                : 'main',
    hit                 : 'hit',
    search_btn          : 'serach_btn',
    search_textfield    : 'search_textfield',
    thumbs_up_btn       : 'thumbs_up',
    love_btn            : 'love_gif',
    love_menu_btn       : 'loved_menu_btn',
    recent_terms        : 'recent_terms',
    gif_url             : 'gif_url',
    gif_img             : 'gif_img',
    loading             : 'loading',
  }
}

var loveopen = false;


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
  // requestRandomGif('dancing',false);
  last.load();
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
    loveUiHandle.change( this );
  });

  listener.click( RandME.ui.love_menu_btn, function(){ loveMenuHandler(); });
  listener.click( RandME.ui.hit, function(){ loveMenuHandler(); });
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
//            REQUESTS
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
/*
  Request a random GIF
*/
function requestRandomGif( term, save_term ){
  if(!term){ return; }

  requestGifFromServer( RandME.commands.random , term.toLowerCase() ); //Call server

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
/*
  Make the final server request
  * Receive a command (cmd) and a param (ID, search term)
  ** Once the server responds, render the rreceived image
*/
function requestGifFromServer( cmd , param ){
  debug.log( "[getGifImage]:", "Requesting GIF for:", param );

  loader.show(); //Show loading

  api( cmd, param, function( response ){
    renderGifResponse( response.data ); //Display final GIF
    debug.log("[requestGifFromServer]", "RESPONSE:", response);
  } , function(){
    loader.hide();
  });
}
//Add the result image to UI
function renderGifResponse( response ) {

  //Save as last GIF loaded
  last.set( response.id );

  //Check if gif is loved
  loveUiHandle( response.id );


  var gifURL = response.url;
  var status = gifURL ? gifURL : RandME.configs.no_gif_message;
  element( RandME.ui.gif_url ).textContent = status;

  var imageResult       = element( RandME.ui.gif_img );
  imageResult.src       = "";
  imageResult.src       = gifURL ? gifURL : "images/sad-face.png";
  imageResult.width     = gifURL ? response.width   : 335;
  imageResult.height    = gifURL ? response.height  : 180;

  loader.hide();
}

//**********************************
//              API
//**********************************
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
    debug.log( "[recent.set]", "SUCCESS", data);
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

    }else{ debug.warn("[recent.add]:", "FAIL:", "Search term already exists"); }
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

    }else{ debug.error("[recent.remove]", "FAIL:", "Search term not found"); }
  });
}

//**********************************
//          Loving GIFs
//**********************************
function loveUiHandle( gifID ){
  love.loved( gifID, function(){
    debug.log("[loveHandle]", "GIF LOVED", gifID);
    element( RandME.ui.love_btn ).className = RandME.constants.loved_class + " " + gifID;
  }, function(){
    debug.log("[loveHandle]", "GIF NOT LOVED", gifID);
    element( RandME.ui.love_btn ).className = gifID;
  });
}
loveUiHandle.change = function( obj ){
  var c = obj.className.split(" ");
  if(c.indexOf( RandME.constants.loved_class ) > -1){
    obj.className = c[1];
    love.remove( c[1] );
  }else{
    love.add( c[0] );
    obj.className = RandME.constants.loved_class + " " + c[0];
  }
}
loveUiHandle.toHTML = function( gifID ){
  return "<div id='"+ gifID +"' class='loved_gif'><img src='http://media3.giphy.com/media/"+ gifID +"/giphy.gif' /></div>"
}
loveUiHandle.populate = function(){
  love.list( function( items ){

    var lvd = items[RandME.keys.loved] || new Array();
    var echo = ""; //Final printable HTML
    for (var i = 0; i < lvd.length; i++) {
      echo += loveUiHandle.toHTML( lvd[i] ); //Get the HTML code and add to the final output
    };

    element("loved_gifs").innerHTML = echo; //Insert the final content to container

    loveUiHandle.addListeners();
  });
}
loveUiHandle.addListeners = function(){
  love.list( function( items ){
    var lvd = items[RandME.keys.loved] || new Array();
    for (var i = 0; i < lvd.length; i++) {
      listener.click( lvd[i] , function(){

        loveMenuHandler();
        requestGifByID( this.id );

      } );
    };
  });
}
//Love menu
function loveMenuHandler(){
  var m = element( RandME.ui.main );
  var h = element( RandME.ui.hit );
  m.className = m.className ? "" : RandME.constants.opened_class;
  h.className = h.className ? "" : RandME.constants.visible_class;

  loveopen = loveopen ? false : true;
  if(loveopen){
    loveUiHandle.populate();
  }
}

//**********************************
//          Love Helper
//**********************************
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

    }else{ debug.warn( "[love.add]", "FAIL:", "ID already exists" ); }
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

    }else{ debug.error( "[love.remove]", "FAIL:", "ID does not exist" ); }
  });
}
love.loved = function( gifID, yes, no ){
  storage.get( RandME.keys.loved , function( items ){

    var lvd = items[RandME.keys.loved] || new Array();
    var index = lvd.indexOf( gifID );

    index > -1 ? yes() : no();
  });
}
love.list = function( callback ){
  storage.get( RandME.keys.loved , callback );
}

//**********************************
//          LAST Helper
//**********************************
function last(){}
last.set = function(gifID){
  storage.set( RandME.keys.last, gifID, function() {
    debug.warn( "[last.set]", "SUCCESS:", gifID);
  });
}
last.get = function( callback ){
  storage.get( RandME.keys.last , callback );
}
last.load = function(){ //Request the last GIF loaded
  last.get(function( items ){

    var lastID = items[RandME.keys.last];
    if(lastID){
      requestGifByID( lastID );
    }else{
      requestRandomGif( RandME.configs.initial_serach ,false);
    }
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
