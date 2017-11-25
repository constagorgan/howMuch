<?php
# Includes the autoloader for libraries installed with composer
require_once('vendor/autoload.php');

# Imports the Google Cloud client library
use Google\Cloud\Language\LanguageClient;
use Google\Cloud\Language\Annotation;

function getKeywords($text){ 
  try {
    $configs = include('config.php');
    putenv('GOOGLE_APPLICATION_CREDENTIALS=EventSnitch-04a546d50399.json'); //your path to file of cred
    # Your Google Cloud Platform project ID
    $projectId = $configs->eventSnitchGoogleProjectId;

    # Instantiates a client
    $language = new LanguageClient([
        'projectId' => $projectId
    ]);

    # Detects the entities of the text
    $annotation = $language->analyzeEntities($text, [
      'language' => 'en'
    ]);

    $entities = $annotation->entities();
    $keywords = array();

    foreach ($entities as $entity) {
      array_push($keywords, $entity['name']);
    }

    return $keywords;
  } catch (Exception $e) {
    error_log($e->getMessage());
    return $text;
  }
}