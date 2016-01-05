<?php

$path = "includes";
require_once("$path/rando_config.php");

$searchTerm = $_GET["gif"];
$searchTerm = str_replace(" ", "+", $searchTerm);

$finalAPIUrl = "http://api.giphy.com/v1/gifs/random?api_key=$apiKEY&tag=$searchTerm";
    //"http://api.giphy.com/v1/gifs/search?q=$searchTerm&limit=$resulstsLimit&api_key=$apiKEY";

$response   = file_get_contents($finalAPIUrl);
$json       = json_decode($response);

$imgSRC     = $json->{'data'}->{'image_original_url'};
$imgWidth   = $json->{'data'}->{'image_width'};
$imgHeight  = $json->{'data'}->{'image_height'};

echo json_encode( array("data" => array( "url"=> $imgSRC , "width" => $imgWidth, "height" => $imgHeight) ) );

?>
