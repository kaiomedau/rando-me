<?php

//** Giphy API Key
$apiKEY     = "dc6zaTOxFJmzC"; //Public BETA Key

$searchTerm = $_GET["gif"];

$searchTerm = str_replace(" ", "+", $searchTerm);

$finalAPIUrl = "http://api.giphy.com/v1/gifs/random?api_key=$apiKEY&tag=$searchTerm";
    //"http://api.giphy.com/v1/gifs/search?q=$searchTerm&limit=$resulstsLimit&api_key=$apiKEY";

$response   = file_get_contents($finalAPIUrl);
$json       = json_decode($response);

$imgSRC     = $json->{'data'}->{'image_original_url'};

echo json_encode( array("data" => array( "url"=> $imgSRC ) ) );

?>
