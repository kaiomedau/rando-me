
//*************************************************
//*************** Define API Path
//*************************************************
var API_PATH = "http://baleiabalao.com/_apps/rando/";

// Limit the history terms
// The actual UI can take 5 short terms
var recent_terms_limit = 5;



//API commands
//Used to define what parameters do we need to send to the server
var commands = {
   'random'     : 'rand',
   'byid'       : 'gif',
   'translate'  : 'trans',
};

//Constants
var consts = {
  'recent_term_prefix': 'rt_',
  'recent_term_button_prefix': 'brt_',
};

//Array to handle the recent terms
var recent_terms_array = new Array();


/* get_api_url
//Receive the command key and a second parameter - can be a search term or a gifID
//Return the final url ready to use
*/
function get_api_url( cmd , param ){
  switch(cmd) {
    case "gif":
    return API_PATH + "?cmd=gif&id=" + param;
        break;
    case "rand":
    default:
      return API_PATH + "?cmd=rand&gif=" + param;
  }
}


//As soon DOM complete loading, add all primary event listeners
//Also populates the recent terms and make a initial search to present a random gif
document.addEventListener('DOMContentLoaded', function() {

    //Add the action to the search button
    var search_btn = document.getElementById('request_gif');
    search_btn.addEventListener('click', function() {
        handleSearchClick();
    });

    //Add the action to the search field when the ENTER key is pressed
    var search_field = document.getElementById('search_term');
    search_field.addEventListener('keypress', function(e) {
      if (e.keyCode == '13') {
        handleSearchClick();
      }
    });

    //Add the action to the thumbs up button
    var thumbs = document.getElementById('thumbs_up');
    thumbs.addEventListener('click', function() {
        requestRandomGif('thumbs up',false);
    });


    var love = document.getElementById('love_gif');
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
  var slug    = termSlug(term,consts.recent_term_prefix);
  var btnSlug = termSlug(term,consts.recent_term_button_prefix);
  return "<div class='search-term'><div class='term' id='"+ slug +"'>"+term+"</div><button class='remove-term' id='" + btnSlug + "''>x</button></div>";
}

//Erase all recent terms from Sync and Local
function clearRecentsStorage(){
  chrome.storage.sync.remove("recent");
}

function populateRecentSeachTerms(){

  //******* Used for debug
  // clearRecentsStorage();
  // return;
  //******* END Used for debug

  chrome.storage.sync.get("recent", function( items ) {

    //Check if has any recent terms
    if( !items || !items.recent ){
      console.log("[populateRecentSeachTerms]:", "No recent search terms found");
      return;
    }

    var rt = items.recent;
    var rt_container = document.getElementById('recent_terms');

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

    var obj = termSlug( recent_terms_array[i] , consts.recent_term_prefix );
    document.getElementById( obj ).addEventListener('click', function() {
      document.getElementById('search_term').value = this.innerHTML;
      handleSearchClick();
    });

    var btObj = termSlug( recent_terms_array[i] , consts.recent_term_button_prefix );
    document.getElementById( btObj ).addEventListener('click', function() {

      var objID = this.id;
          objID = objID.replace( consts.recent_term_button_prefix, consts.recent_term_prefix );

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

  chrome.storage.sync.get( "recent", function( items ) {
    if(!items || !items.recent){ return; }

    var rt = items.recent;
    var rtIndex = rt.indexOf(term);

    if(rtIndex > -1){
      rt.splice(rtIndex, 1);

      chrome.storage.sync.set({ "recent" : rt }, function() {
          console.log( "[removeRecentSearchTerm]:","Term removed:",term );
      });
    }

    populateRecentSeachTerms();
  });

}


function handleSearchTerms(term){
  term = term.toLowerCase();

  chrome.storage.sync.get( "recent" , function( items ) {

    var recent_terms = items.recent;

    if(recent_terms){
      //Já temos termos de busca salvos.
      console.log("ja temos termos salvos", items);
      console.log("Termo buscado:",term);

      if(recent_terms.indexOf(term) == -1){

        if(recent_terms.length >= recent_terms_limit){
          recent_terms.pop();
        }

        recent_terms.unshift(term);

        chrome.storage.sync.set({ "recent" : recent_terms}, function() {
          console.log( "Term saved",recent_terms );
        });

      }

    }else{

      console.log("[handleSearchTerms]:","No recent terms found yet");

      recent_terms = new Array(term);
      chrome.storage.sync.set({ "recent" : recent_terms}, function() {
        console.log( "[handleSearchTerms]:", "Recent storage created", recent_terms );
      });

    }

    populateRecentSeachTerms();

  });

}

//Get the search term and request the GIF
function handleSearchClick(){
  var term = document.getElementById('search_term').value;
  if(term.length){
    requestRandomGif( term, true);
  }
}

function requestRandomGif( term, store_as_recent_term ){
  if(!term){ return; }

  //Ask the server for a GIF
  requestGifFromServer( commands.random , term );

  //Save as recent term
  if(store_as_recent_term){
    handleSearchTerms(term);
  }
}

function requestGifByID( gifID ){
  if(!gifID){ return; }

  //Ask the server for a GIF
  requestGifFromServer( commands.byid , gifID );
}






function requestGifFromServer( cmd , param ){
  console.log( "[getGifImage]:", "Requesting GIF for:", param );

  changeLoaderVisibility(false); //Show loading

  var searchUrl = get_api_url( cmd , encodeURIComponent(param) );
  // api_url_path + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest(); //Create the request
  x.open('GET', searchUrl);
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

function renderGifResponse(gifURL, gifWidth, gifHeight) {

    var status = gifURL ? gifURL : "No GIF found. Sorry :(";
    document.getElementById('gif_url').textContent = status;

    var imageResult = document.getElementById('gif_img');
    imageResult.src = "";
    imageResult.src = gifURL ? gifURL : "images/sad-face.png";
    imageResult.width = gifURL ? gifWidth : 335;
    imageResult.height = gifURL ? gifHeight : 180;

    changeLoaderVisibility(true);

}

function changeLoaderVisibility( hide_loader ){

  var gifContainer    = document.getElementById('gif_img');
  var loaderContainer = document.getElementById('loading');

  loaderContainer.className = hide_loader ? "hidden" : "";

  gifContainer.hidden = false;// = hide_loader ? false : true;
}


//**********************************
//          Loving GIFs
//**********************************
//Get loved GIFs
//Check if GIF is loved
//Add love to GIF
//Remove love from GIF
//Display loved GIF
