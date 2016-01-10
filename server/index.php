<?php

$path = "includes";

/*
    Check if configuration file is ready.
    Or else, return an error asking the developer to rename the template file.
*/
if(!file_exists("$path/config.php")){
    echo json_encode( array( "error"=>"404", "message"=>"File 'config.php' not found. Please, rename 'config-example.php' to 'config.php' at 'server/includes/'" ) );
    die();
}

/*
    Include the configuration file
*/
require_once("$path/config.php");

/*
    Commands will define what API address will be called
*/
$apiPATH;
$command = $_GET["cmd"];
switch ($command) {
    case 'byid':
    case 'gif':
        $requestID = $_GET["id"];
        $apiPATH = "http://api.giphy.com/v1/gifs/$requestID?api_key=$apiKEY";
        break;
    case 'trans':
        $searchTerm = str_replace(" ", "+", $_GET["gif"] );
        $apiPATH = "http://api.giphy.com/v1/gifs/translate?s=$searchTerm&api_key=$apiKEY";
        break;
    case 'rand':
    default:
        $searchTerm = str_replace(" ", "+", $_GET["gif"] );
        $apiPATH = "http://api.giphy.com/v1/gifs/random?api_key=$apiKEY&tag=$searchTerm";
        break;
}

$response   = file_get_contents($apiPATH);
$json       = json_decode($response);

if($json->{'data'}->{'images'}){
    $imgSRC     = $json->{'data'}->{'images'}->{'downsized'}->{'url'};
    $imgWidth   = $json->{'data'}->{'images'}->{'downsized'}->{'width'};
    $imgHeight  = $json->{'data'}->{'images'}->{'downsized'}->{'height'};
}else{
    $imgSRC     = $json->{'data'}->{'image_url'};//{'image_original_url'};
    $imgWidth   = $json->{'data'}->{'image_width'};
    $imgHeight  = $json->{'data'}->{'image_height'};
}

$imgID = $json->{'data'}->{'id'};

echo json_encode( array("data" => array( "id"=> $imgID, "url"=> $imgSRC , "width" => $imgWidth, "height" => $imgHeight , "giphy"=>$json->{'data'}) ) );

?>
