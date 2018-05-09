<?php  

require_once('../vendor/autoload.php');
use \Firebase\JWT\JWT; 
date_default_timezone_set('Europe/London');

$configs = include('../config.php');
include "../access_granted/SitemapGenerator.php";
$generator = new \SitemapGenerator('https://www.eventsnitch.com');

$link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);

mysqli_set_charset($link,'utf8');
$sql = "select id, name from events";
$result = mysqli_query($link,$sql);

$rows = array();
$generator->sitemapFileName = "../../sitemap.xml";
$generator->sitemapIndexFileName = "sitemap-eventsnitch.xml";
$generator->addUrl('https://www.eventsnitch.com', date('c'), 'daily', '1');
$generator->addUrl('https://www.eventsnitch.com/category/popular', date('c'), 'daily', '1');
$generator->addUrl('https://www.eventsnitch.com/category/upcoming', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/local', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/Cultural', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/Education', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/Entertainment', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/featured', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/Holiday', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/Music', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/Political', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/Science', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/category/Sport', date('c'), 'daily', '0.5');
$generator->addUrl('https://www.eventsnitch.com/contact', date('c'), 'monthly', '0.3');

while($r = mysqli_fetch_assoc($result)) {
  $rows[] = $r;
  $generator->addUrl('https://www.eventsnitch.com/event/' . str_replace("%20", "+", rawurlencode(htmlspecialchars_decode($r['name'], ENT_QUOTES))). '/' . $r['id'], date('c'), 'monthly', '0.7');
}

$generator->createSitemap();

$generator->writeSitemap();

mysqli_close($link);
exit();
