// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var recent_terms_limit = 5;
var recent_terms_array = new Array();


function recentSearchTerms(){
  chrome.storage.sync.get("recent", function( items ) {
    return items.recent ? items.recent : null;
  });
}

function termSlug(term,prefix){
  var slug = term.replace(/[^a-zA-Z ]/g, "");
      return prefix ? prefix+slug : slug;
}

function searchTermToHTML(term){
  var slug    = termSlug(term,"rt_");
  var btnSlug = termSlug(term,"brt_");
  return "<div class='search-term'><div class='term' id='"+ slug +"'>"+term+"</div><button class='remove-term' id='" + btnSlug + "''>x</button></div>";
}

function populateRecentSeachTerms(){

// chrome.storage.sync.remove("recent");
// return;

  chrome.storage.sync.get("recent", function( items ) {
    if( !items || !items.recent ){ console.log("No recent search terms found"); return; }

    var rt = items.recent;
    var rt_container = document.getElementById('recent_terms');

    var echo = "";
    for (var i = 0; i < rt.length; i++) {
      echo += searchTermToHTML(rt[i]);
    };

    rt_container.innerHTML = echo;

    recent_terms_array = rt;
    handleRecentTermsListeners();

  });

}
 function handleRecentTermsListeners(){
  if(!recent_terms_array || !recent_terms_array.length){return;}

  for (var i = 0; i < recent_terms_array.length; i++) {

    document.getElementById('rt_' + recent_terms_array[i] ).addEventListener('click', function() {
      document.getElementById('random_term').value = this.innerHTML;
      handleClick();
    });

    document.getElementById('brt_' + recent_terms_array[i] ).addEventListener('click', function() {
      var term = this.id;
          term = term.replace( "brt_", "" );

      removeRecentSearchTerm( term );
    });

  };

 }


function removeRecentSearchTerm(term){
  term = term.toLowerCase();

  chrome.storage.sync.get("recent", function( items ) {
    if(!items || !items.recent){ return; }

    var rt = items.recent;
    var rtIndex = rt.indexOf(term);
    if(rtIndex > -1){
      rt.splice(rtIndex, 1);

      chrome.storage.sync.set({"recent": rt}, function() {
          console.log( "Term removed", term,recent_terms );
      });
    }

    populateRecentSeachTerms();
  });

}



function handleSearchTerms(term){
  term = term.toLowerCase();

  // console.log("nova funcao", recentSearchTerms());

  chrome.storage.sync.get("recent", function( items ) {

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
        chrome.storage.sync.set({"recent": recent_terms}, function() {
          console.log( "Term saved",recent_terms );
        });

      }

      console.log( recent_terms.indexOf(term) );

    }else{

      console.log("Ainda não temos termos salvos");

      recent_terms = new Array(term);
      chrome.storage.sync.set({"recent": recent_terms}, function() {
        console.log( "First Recent Term Saved", recent_terms );
      });

    }

    populateRecentSeachTerms();

  });


}

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//   for (key in changes) {
//     var storageChange = changes[key];
//           console.log('Storage key "%s" in namespace "%s" changed. ' +
//                       'Old value was "%s", new value is "%s".',
//                       key,
//                       namespace,
//                       storageChange.oldValue,
//                       storageChange.newValue);
//   }
// });


document.addEventListener('DOMContentLoaded', function() {

    var link = document.getElementById('callgif');
    // var term = document.getElementsByClassName('term');
    link.addEventListener('click', function() {
        handleClick();
    });

});



function handleClick(){

  console.log( document.getElementById('random_term').value );
  var term = document.getElementById('random_term').value;

  if(term.length){
    getGifImage(term);
    handleSearchTerms(term);
  }else{
    console.log("sem termos para buscar");
  }


}

function getGifImage( searchTerm ){

  var loader = document.getElementById('loading');
  loader.hidden = false;

  console.log("Iniciando busca por",searchTerm);

  var searchUrl = "http://baleiabalao.com/giphy/?gif=" + encodeURIComponent(searchTerm);
  //"http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=" + encodeURIComponent(searchTerm);


  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {

      console.log(x);
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response || !response.data) {
      console.log("Sem resultados");
      return;
    }

    var gifURL = response.data.url;
    console.log( gifURL );

    loader.hidden = true;

    renderGifResponse(gifURL);

  };
  x.onerror = function() {
    console.log('Network error.');
    loader.hidden = true;
  };
  x.send();

}
function renderGifResponse(gifURL) {

    gifURL = gifURL ? gifURL : "No GIFs found";
    document.getElementById('gif_url').textContent = gifURL;

    var imageResult = document.getElementById('image-result');
    // imageResult.width = width;
    // imageResult.height = height;
    imageResult.src = "";
    imageResult.src = gifURL;
    imageResult.hidden = false;

}

populateRecentSeachTerms();
