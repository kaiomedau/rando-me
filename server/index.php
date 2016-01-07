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

$searchTerm = $_GET["gif"];
$searchTerm = str_replace(" ", "+", $searchTerm);

$apiPATH    = "http://api.giphy.com/v1/gifs/random?api_key=$apiKEY&tag=$searchTerm";

$response   = file_get_contents($apiPATH);
$json       = json_decode($response);

$imgSRC     = $json->{'data'}->{'image_original_url'};
$imgWidth   = $json->{'data'}->{'image_width'};
$imgHeight  = $json->{'data'}->{'image_height'};

echo json_encode( array("data" => array( "url"=> $imgSRC , "width" => $imgWidth, "height" => $imgHeight) ) );

?>
