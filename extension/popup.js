
//*************************************************
//*************** Configurations
//*************************************************
var RandME = {
  configs : {
    api_path          : "http://baleiabalao.com/_apps/rando/", //Server address
    recents_limit     : 5,  // Limit the history terms
    no_gif_message    : "No GIFs found :(",
  },
  //API commands //Used to define what parameters do we need to send to the server
  commands : {
    random     : 'rand',  //Return a random GIF for search term
    byID       : 'byid',  //Return a specific image
    translate  : 'trans', //Return a GIF translating the search term
  },
  keys : {
    recent     : 'recent',
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


//Array to handle the recent terms
var recent_terms_array = new Array();


//As soon DOM complete loading, add all primary event listeners
//Also populates the recent terms and make a initial search to present a random gif
document.addEventListener('DOMContentLoaded', function() {

    //Add the action to the search button
    var search_btn = document.getElementById( RandME.ui.search_btn );
    search_btn.addEventListener('click', function() {
        handleSearchClick();
    });

    //Add the action to the search field when the ENTER key is pressed
    var search_field = document.getElementById( RandME.ui.search_textfield );
    search_field.addEventListener('keypress', function(e) {
      if (e.keyCode == '13') {
        handleSearchClick();
      }
    });

    //Add the action to the thumbs up button
    var thumbs = document.getElementById( RandME.ui.thumbs_up_btn );
    thumbs.addEventListener('click', function() {
        requestRandomGif('thumbs up',false);
    });


    var love = document.getElementById( RandME.ui.love_btn );
    love.addEventListener('click', function() {
        requestGifByID('feqkVgjJpYtjy');
    });


    //Displays the recent tems
    populateRecentSeachTerms();

    //Make a initial search
    requestRandomGif('dancing',false);

});

//**********************************
//      RECENT SEARCH TERMS
//**********************************

//Return a slug containing only tha A to Z characters
//If given a prefix, the result will contain it
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

  storage.get( RandME.keys.recent, function( items ) {

    //Check if has any recent terms
    if( !items || !items[RandME.keys.recent] ){
      console.log("[populateRecentSeachTerms]:", "No recent search terms found");
      return;
    }

    var rt = items[RandME.keys.recent];
    var rt_container = document.getElementById( RandME.ui.recent_terms );

    var echo = ""; //Final printable HTML
    for (var i = 0; i < rt.length; i++) {
      echo += searchTermToHTML(rt[i]); //Get the HTML code and add to the final output
    };

    //Insert the final content to container
    rt_container.innerHTML = echo;

    //Store the recent terms to create the recent buttons actions
    recent_terms_array = rt;

    //Add the necessary actions to all recent buttons
    handleRecentTermsListeners();

  });

}


function handleRecentTermsListeners(){
  if(!recent_terms_array || !recent_terms_array.length){
    return;
  }

  //Loop to get all Buttons and add the listeners to it
  for (var i = 0; i < recent_terms_array.length; i++) {

    var obj = termSlug( recent_terms_array[i] , RandME.constants.recent_term_prefix );
    document.getElementById( obj ).addEventListener('click', function() {
      document.getElementById( RandME.ui.search_textfield ).value = this.innerHTML;
      handleSearchClick();
    });

    var btObj = termSlug( recent_terms_array[i] , RandME.constants.recent_term_button_prefix );
    document.getElementById( btObj ).addEventListener('click', function() {

      var objID = this.id;
          objID = objID.replace( RandME.constants.recent_term_button_prefix, RandME.constants.recent_term_prefix );

      var term  = document.getElementById( objID ).innerHTML;

      removeRecentSearchTerm( term );

    });

  };

 }

//Remove a speific recent term
//triggered by the recent term X button
function removeRecentSearchTerm(term){
  term = term.toLowerCase();
  console.log("[removeRecentSearchTerm]:", "Term to remove:",term)

  storage.get( RandME.keys.recent, function( items ) {
    if(!items || !items[RandME.keys.recent]){
      console.log("[removeRecentSearchTerm]:", "History not found");
      return;
    }

    var rt = items[RandME.keys.recent];
    var index = rt.indexOf( term );

    if(index > -1){

      rt.splice(index, 1); //Remove term

      storage.set( RandME.keys.recent, rt , function() {
          console.log( "[removeRecentSearchTerm]:","Term removed:",term );
      });

    }

    populateRecentSeachTerms();
  });

}










function handleSearchTerms(term){
  term = term.toLowerCase();

  storage.get( RandME.keys.recent , function( items ) {

    var rt = items[RandME.keys.recent] || new Array();
    if(rt.length >= RandME.configs.recents_limit){
      rt.pop();
    }

    //Check if term already exists
    if(rt.indexOf( term ) == -1){
      //Add recent term
      rt.unshift( term );

      //Save recents
      storage.set( RandME.keys.recent, rt, function() {
        console.log( "Term saved", rt );
      });

    }else{
      console.log("termo já existe");
    }

    populateRecentSeachTerms();
  });
}

//Get the search term and request the GIF
function handleSearchClick(){
  var term = document.getElementById( RandME.ui.search_textfield ).value;
  if(term.length){
    requestRandomGif( term, true);
  }
}



//**********************************
//               UI
//**********************************
function renderGifResponse(gifURL, gifWidth, gifHeight) {

    var status = gifURL ? gifURL : RandME.configs.no_gif_message;// "No GIF found. Sorry :(";
    document.getElementById( RandME.ui.gif_url ).textContent = status;

    var imageResult = document.getElementById( RandME.ui.gif_img );
    imageResult.src = "";
    imageResult.src = gifURL ? gifURL : "images/sad-face.png";
    imageResult.width = gifURL ? gifWidth : 335;
    imageResult.height = gifURL ? gifHeight : 180;

    changeLoaderVisibility(true);

}

function changeLoaderVisibility( hide_loader ){

  var gifContainer    = document.getElementById( RandME.ui.gif_img );
  var loaderContainer = document.getElementById( RandME.ui.loading );

  loaderContainer.className = hide_loader ? "hidden" : "";

  gifContainer.hidden = false;// = hide_loader ? false : true;
}




//**********************************
//              API
//**********************************
/*
  Request a random GIF
*/
function requestRandomGif( term, store_as_recent_term ){
  if(!term){ return; }
  requestGifFromServer( RandME.commands.random , term ); //Call server

  //Save as recent term
  if(store_as_recent_term){
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
  console.log( "[getGifImage]:", "Requesting GIF for:", param );

  changeLoaderVisibility(false); //Show loading

  // var searchUrl = get_api_url( cmd , encodeURIComponent(param) );
  var x = new XMLHttpRequest(); //Create the request
  x.open('GET', get_api_url( cmd , encodeURIComponent(param) ) );
  x.responseType = 'json';
  x.onload = function() {

  var response = x.response;
  if(response){
    if(response.error){
      console.log( "[requestGifFromServer]:", "ERROR:", response.message);
      return;
    }else if (!response.data) {
      console.log( "[requestGifFromServer]:", "Response contains NO DATA");
    };
  }else{
    console.log( "[requestGifFromServer]:", "No response");
    return;
  }

  console.log(response);

  //Response GIF data
  var gifURL    = response.data.url;
  var gifWidth  = response.data.width;
  var gifHeight = response.data.height;

  //Display final GIF
  renderGifResponse(gifURL,gifWidth,gifHeight);
};
  x.onerror = function() {
    console.log("[getGifImage]:", 'Network error.');
    loader.hidden = true;
  };
  x.send();

}

/* get_api_url
//Receive the command key and a second parameter - can be a search term or a gifID
//Return the final url ready to use
*/
function get_api_url( cmd , param ){
  switch(cmd) {
    case "byid":
    return RandME.configs.api_path + "?cmd=gif&id=" + param;
        break;
    case "rand":
    default:
      return RandME.configs.api_path + "?cmd=rand&gif=" + param;
  }
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
//          Loving GIFs
//**********************************
//Get loved GIFs
//Check if GIF is loved
//Add love to GIF
//Remove love from GIF
//Display loved GIF
