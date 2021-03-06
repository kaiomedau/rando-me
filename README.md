<p align="center">
   <img src="https://raw.githubusercontent.com/kaiomedau/rando-me/master/_layout/Chrome-Store/store_rando_tile_440.png" alt="Rando.me a GIF" /><br/>
   <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg" />
</p>

**Rando.me a GIF** is a Google Chrome extension that makes finding GIFs an easy and fun task. Just type the desired keyword and let us do the rest! You will receive a related random GIF in seconds.

The history bar will keep track of your latest terms making it easy for you to get a new image in seconds
> If you are connected to Google Chrome, this feature will be cross devices.

Start adding GIFs to your messages, emails, Facebook, Twitter or to whatever tools you use.
> Just drag and drop the image.

Keep in mind that you can always use the thumbs up button as a shortcut.

## Features:
- Request random GIFs by `search term`
- Request specific GIFs `by ID`
- Request a `translation` GIF - Translates a keyword into image eg.: "NO" will return someone saying "NO"
- Store `recent search` terms
- Store `loved GIFs`


----
# Overview
Everithing is pretty much ready to run.

You will only need to:
- Rename the file `config.example.php`
- Upload the contents of the `server folder` to your server
- Inform the final API address to `popup.js`


### Structure
All extensions will be kept inside the, also called, `extensions` folder.
> Note that the `chrome` folder is the only one containing ready to use code. All the others still under development.



----
# Setup
### Server Setup:
The `congif.php` file holds your `Giphy API key` used to make your `GIF` and `search requests`.
> **Note:** rename `server/includes/config-example.php` to `server/includes/config.php`.

Please use the `Giphy Public key` - *already inside config.example.php* - while you develop your application and experiment with your integrations.

```
$public_giphy_key   = "dc6zaTOxFJmzC";
```


### Extension Setup:
All customizable data is kept inside `RandME` object.
> **Note:** you will not need to change anything else inside popup.js. All requests will make reference to `RandME` and its keys.

```
var RandME = {
  configs : {
    debugging         : true,                   //Set this to false to stop console logs
    recents_limit     : 5,                      //Limit the history terms
    initial_serach    : "Dance",                //Initial keyword
    no_gif_message    : "No GIFs found :(",     //Mesage for GIFs not found
    api_path          : "http://YOUR-SERVER",   //Server address
  },
  commands : {
    random     : 'rand',  //Return a random GIF for a keyword
    byID       : 'byid',  //Return a specific GIF
    translate  : 'trans', //Return a GIF translating the search term
  },
  keys : { //Used to store data localy and sync it
    recent      : 'recent', //Used to display the recent seach terms
    loved       : 'loved',  //Used to display the loved GIFs
    last        : 'last',   //Used to recover the last GIF loaded
  },
  constants : { //Used to build and request UI elements
    recent_term_prefix        : 'rt_',
    recent_term_button_prefix : 'brt_',
    loved_class               : 'loved',
    opened_class              : 'open',
    visible_class             : 'visible',
  },
  ui : { //IDs from your HTML.
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
```

> Replace RandMe.configs.**{api_path}** with your server URL

Feel free to keep the default address `while you develop` your application.


----

# Usage
## Init
As soon the document is done loading the `DOMContentLoaded` will be triggered. This will execute the `RandoInit()` function that holds all initial actions.
```
function RandoInit(){

  RandoInitialListeners();      //Add the initial listeners to all ui elements

  populateRecentSeachTerms();   //Populates the recents bar

  last.load();                  //Load the last GIF seen
  //requestRandomGif( RandME.configs.initial_serach ,false); //Make a initial search
}
```
> Note: If you do prefere to make a random request when starting the plugin, you nedd to comment the `last.load();` and uncomment the `requestRandomGif(...);` lines.



## GIF Requests
> All requests will automatic render the result image to the UI.

### Random GIF
`requestRandomGif` will return a random GIF related to a given search term.
```
requestRandomGif( term, save_term );
```
- **term** - `String`: Keyword to be searched
- **save_term** - `Boolean`: If the term sould be stored as recent term. If `false`, it will not apear at the recents bar.

### Specific GIF
`requestGifByID` will return a specific GIF based on it's ID.
```
function requestGifByID( gifID );
```
- **gifID** - `String`: Object id.



## Storage
As each browser deals with storage its own way, `storage class` is used to unify this actions in a single place. Therefore, once you start a development for a new browser, you will need to interact with this methods.
```
function storage(){}
storage.get = function( key, callback ){}
storage.set = function( key, data, callback ){}
storage.remove = function(key){}
```

### Recent
Deal with recently searched keywords. This methods can be called to retrieve, save and delete search terms.
```
function recent(){};
recent.set = function( data, callback ){}
recent.list = function( callback ){}
recent.add = function( term, callback ){}
recent.remove = function( term, callback ){}
```

#### Recent.List
Retrieves all saved keywords save as recent terms and executes the callback function.
```
recent.list( function( items ) {
    var recentTerms = items[RandME.keys.recent] || new Array();
    debug.log( recentTerms );
    //console.log( recentTerms );
} );
```

#### Recent.Add
Adds a new term, if not yet exists, to the `recents object`. It will include the given term, save it and execute the callback function.
```
recent.add( "My term", function(){
  debug.log( "Term added:", "My term" );
  //console.log( "Term added:", "My term" );
} );
```

#### Recent.Remove
Removes a specific term from the `recents object`. It will remove the given term and execute the callback function.
```
recent.remove( "My term", function(){
  debug.log( "Term removed:", "My term" );
  //console.log( "Term removed:", "My term" );
} );
```



## Debug
Instead of calling `console.{command}()`, you can use `debug.{command}()`. This will allow you to stop logs and warnings only by changing the **RandME.configs.**`debugging` value to false.
```
debug.log( "Something to log", ... , obj );
```
```
debug.warn( "Something to warn", ... , obj );
```
```
debug.error( "Some error alert", ... , obj );
```



----

# Firefox:
- Depends on `node.js` and npm
- Install `jpm` with `npm install jpm --global` and `jpm run` on firefox folder.




----

# License

```
The MIT License (MIT)

Copyright (c) 2016 Kaio Medau

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
