<?php
class CountryCode
{
    public $fullName;
    public $alphaTwo;
    public $alphaThree;
    public $numericCode;
  
  function __construct($fullName, $AlphaTwo, $AlphaThree, $NumericCode){
    $this->fullName = $fullName;
    $this->alphaTwo = $AlphaTwo;
    $this->alphaThree = $AlphaThree;
    $this->numericCode = $NumericCode;
  }
}
$countryCodes = array();

array_push($countryCodes, new CountryCode("Afghanistan", "AF", "AFG", "004"));
array_push($countryCodes, new CountryCode("Aland Islands", "AX", "ALA", "248"));
array_push($countryCodes, new CountryCode("Albania", "AL", "ALB", "008"));
array_push($countryCodes, new CountryCode("Algeria", "DZ", "DZA", "012"));
array_push($countryCodes, new CountryCode("American Samoa", "AS", "ASM", "016"));
array_push($countryCodes, new CountryCode("Andorra", "AD", "AND", "020"));
array_push($countryCodes, new CountryCode("Angola", "AO", "AGO", "024"));
array_push($countryCodes, new CountryCode("Anguilla", "AI", "AIA", "660"));
array_push($countryCodes, new CountryCode("Antarctica", "AQ", "ATA", "010"));
array_push($countryCodes, new CountryCode("Antigua and Barbuda", "AG", "ATG", "028"));
array_push($countryCodes, new CountryCode("Argentina", "AR", "ARG", "032"));
array_push($countryCodes, new CountryCode("Armenia", "AM", "ARM", "051"));
array_push($countryCodes, new CountryCode("Aruba", "AW", "ABW", "533"));
array_push($countryCodes, new CountryCode("Australia", "AU", "AUS", "036"));
array_push($countryCodes, new CountryCode("Austria", "AT", "AUT", "040"));
array_push($countryCodes, new CountryCode("Azerbaijan", "AZ", "AZE", "031"));
array_push($countryCodes, new CountryCode("Bahamas", "BS", "BHS", "044"));
array_push($countryCodes, new CountryCode("Bahrain", "BH", "BHR", "048"));
array_push($countryCodes, new CountryCode("Bangladesh", "BD", "BGD", "050"));
array_push($countryCodes, new CountryCode("Barbados", "BB", "BRB", "052"));
array_push($countryCodes, new CountryCode("Belarus", "BY", "BLR", "112"));
array_push($countryCodes, new CountryCode("Belgium", "BE", "BEL", "056"));
array_push($countryCodes, new CountryCode("Belize", "BZ", "BLZ", "084"));
array_push($countryCodes, new CountryCode("Benin", "BJ", "BEN", "204"));
array_push($countryCodes, new CountryCode("Bermuda", "BM", "BMU", "060"));
array_push($countryCodes, new CountryCode("Bhutan", "BT", "BTN", "064"));
array_push($countryCodes, new CountryCode("Bolivia", "BO", "BOL", "068"));
array_push($countryCodes, new CountryCode("Bosnia and Herzegovina", "BA", "BIH", "070"));
array_push($countryCodes, new CountryCode("Botswana", "BW", "BWA", "072"));
array_push($countryCodes, new CountryCode("Bouvet Island", "BV", "BVT", "074"));
array_push($countryCodes, new CountryCode("Brazil", "BR", "BRA", "076"));
array_push($countryCodes, new CountryCode("British Virgin Islands", "VG", "VGB", "092"));
array_push($countryCodes, new CountryCode("British Indian Ocean Territory", "IO", "IOT", "086"));
array_push($countryCodes, new CountryCode("Brunei Darussalam", "BN", "BRN", "096"));
array_push($countryCodes, new CountryCode("Bulgaria", "BG", "BGR", "100"));
array_push($countryCodes, new CountryCode("Burkina Faso", "BF", "BFA", "854"));
array_push($countryCodes, new CountryCode("Burundi", "BI", "BDI", "108"));
array_push($countryCodes, new CountryCode("Cambodia", "KH", "KHM", "116"));
array_push($countryCodes, new CountryCode("Cameroon", "CM", "CMR", "120"));
array_push($countryCodes, new CountryCode("Canada", "CA", "CAN", "124"));
array_push($countryCodes, new CountryCode("Cape Verde", "CV", "CPV", "132"));
array_push($countryCodes, new CountryCode("Cayman Islands", "KY", "CYM", "136"));
array_push($countryCodes, new CountryCode("Central African Republic", "CF", "CAF", "140"));
array_push($countryCodes, new CountryCode("Chad", "TD", "TCD", "148"));
array_push($countryCodes, new CountryCode("Chile", "CL", "CHL", "152"));
array_push($countryCodes, new CountryCode("China", "CN", "CHN", "156"));
array_push($countryCodes, new CountryCode("Hong Kong, SAR China", "HK", "HKG", "344"));
array_push($countryCodes, new CountryCode("Macao, SAR China", "MO", "MAC", "446"));
array_push($countryCodes, new CountryCode("Christmas Island", "CX", "CXR", "162"));
array_push($countryCodes, new CountryCode("Cocos (Keeling) Islands", "CC", "CCK", "166"));
array_push($countryCodes, new CountryCode("Colombia", "CO", "COL", "170"));
array_push($countryCodes, new CountryCode("Comoros", "KM", "COM", "174"));
array_push($countryCodes, new CountryCode("Congo (Brazzaville)", "CG", "COG", "178"));
array_push($countryCodes, new CountryCode("Congo, (Kinshasa)", "CD", "COD", "180"));
array_push($countryCodes, new CountryCode("Cook Islands", "CK", "COK", "184"));
array_push($countryCodes, new CountryCode("Costa Rica", "CR", "CRI", "188"));
array_push($countryCodes, new CountryCode("Côte d'Ivoire", "CI", "CIV", "384"));
array_push($countryCodes, new CountryCode("Croatia", "HR", "HRV", "191"));
array_push($countryCodes, new CountryCode("Cuba", "CU", "CUB", "192"));
array_push($countryCodes, new CountryCode("Cyprus", "CY", "CYP", "196"));
array_push($countryCodes, new CountryCode("Czech Republic", "CZ", "CZE", "203"));
array_push($countryCodes, new CountryCode("Denmark", "DK", "DNK", "208"));
array_push($countryCodes, new CountryCode("Djibouti", "DJ", "DJI", "262"));
array_push($countryCodes, new CountryCode("Dominica", "DM", "DMA", "212"));
array_push($countryCodes, new CountryCode("Dominican Republic", "DO", "DOM", "214"));
array_push($countryCodes, new CountryCode("Ecuador", "EC", "ECU", "218"));
array_push($countryCodes, new CountryCode("Egypt", "EG", "EGY", "818"));
array_push($countryCodes, new CountryCode("El Salvador", "SV", "SLV", "222"));
array_push($countryCodes, new CountryCode("Equatorial Guinea", "GQ", "GNQ", "226"));
array_push($countryCodes, new CountryCode("Eritrea", "ER", "ERI", "232"));
array_push($countryCodes, new CountryCode("Estonia", "EE", "EST", "233"));
array_push($countryCodes, new CountryCode("Ethiopia", "ET", "ETH", "231"));
array_push($countryCodes, new CountryCode("Falkland Islands (Malvinas)", "FK", "FLK", "238"));
array_push($countryCodes, new CountryCode("Faroe Islands", "FO", "FRO", "234"));
array_push($countryCodes, new CountryCode("Fiji", "FJ", "FJI", "242"));
array_push($countryCodes, new CountryCode("Finland", "FI", "FIN", "246"));
array_push($countryCodes, new CountryCode("France", "FR", "FRA", "250"));
array_push($countryCodes, new CountryCode("French Guiana", "GF", "GUF", "254"));
array_push($countryCodes, new CountryCode("French Polynesia", "PF", "PYF", "258"));
array_push($countryCodes, new CountryCode("French Southern Territories", "TF", "ATF", "260"));
array_push($countryCodes, new CountryCode("Gabon", "GA", "GAB", "266"));
array_push($countryCodes, new CountryCode("Gambia", "GM", "GMB", "270"));
array_push($countryCodes, new CountryCode("Georgia", "GE", "GEO", "268"));
array_push($countryCodes, new CountryCode("Germany", "DE", "DEU", "276"));
array_push($countryCodes, new CountryCode("Ghana", "GH", "GHA", "288"));
array_push($countryCodes, new CountryCode("Gibraltar", "GI", "GIB", "292"));
array_push($countryCodes, new CountryCode("Greece", "GR", "GRC", "300"));
array_push($countryCodes, new CountryCode("Greenland", "GL", "GRL", "304"));
array_push($countryCodes, new CountryCode("Grenada", "GD", "GRD", "308"));
array_push($countryCodes, new CountryCode("Guadeloupe", "GP", "GLP", "312"));
array_push($countryCodes, new CountryCode("Guam", "GU", "GUM", "316"));
array_push($countryCodes, new CountryCode("Guatemala", "GT", "GTM", "320"));
array_push($countryCodes, new CountryCode("Guernsey", "GG", "GGY", "831"));
array_push($countryCodes, new CountryCode("Guinea", "GN", "GIN", "324"));
array_push($countryCodes, new CountryCode("Guinea-Bissau", "GW", "GNB", "624"));
array_push($countryCodes, new CountryCode("Guyana", "GY", "GUY", "328"));
array_push($countryCodes, new CountryCode("Haiti", "HT", "HTI", "332"));
array_push($countryCodes, new CountryCode("Heard and Mcdonald Islands", "HM", "HMD", "334"));
array_push($countryCodes, new CountryCode("Holy See (Vatican City State)", "VA", "VAT", "336"));
array_push($countryCodes, new CountryCode("Honduras", "HN", "HND", "340"));
array_push($countryCodes, new CountryCode("Hungary", "HU", "HUN", "348"));
array_push($countryCodes, new CountryCode("Iceland", "IS", "ISL", "352"));
array_push($countryCodes, new CountryCode("India", "IN", "IND", "356"));
array_push($countryCodes, new CountryCode("Indonesia", "ID", "IDN", "360"));
array_push($countryCodes, new CountryCode("Iran, Islamic Republic of", "IR", "IRN", "364"));
array_push($countryCodes, new CountryCode("Iraq", "IQ", "IRQ", "368"));
array_push($countryCodes, new CountryCode("Ireland", "IE", "IRL", "372"));
array_push($countryCodes, new CountryCode("Isle of Man", "IM", "IMN", "833"));
array_push($countryCodes, new CountryCode("Israel", "IL", "ISR", "376"));
array_push($countryCodes, new CountryCode("Italy", "IT", "ITA", "380"));
array_push($countryCodes, new CountryCode("Jamaica", "JM", "JAM", "388"));
array_push($countryCodes, new CountryCode("Japan", "JP", "JPN", "392"));
array_push($countryCodes, new CountryCode("Jersey", "JE", "JEY", "832"));
array_push($countryCodes, new CountryCode("Jordan", "JO", "JOR", "400"));
array_push($countryCodes, new CountryCode("Kazakhstan", "KZ", "KAZ", "398"));
array_push($countryCodes, new CountryCode("Kenya", "KE", "KEN", "404"));
array_push($countryCodes, new CountryCode("Kiribati", "KI", "KIR", "296"));
array_push($countryCodes, new CountryCode("Korea (North)", "KP", "PRK", "408"));
array_push($countryCodes, new CountryCode("Korea (South)", "KR", "KOR", "410"));
array_push($countryCodes, new CountryCode("Kuwait", "KW", "KWT", "414"));
array_push($countryCodes, new CountryCode("Kyrgyzstan", "KG", "KGZ", "417"));
array_push($countryCodes, new CountryCode("Lao PDR", "LA", "LAO", "418"));
array_push($countryCodes, new CountryCode("Latvia", "LV", "LVA", "428"));
array_push($countryCodes, new CountryCode("Lebanon", "LB", "LBN", "422"));
array_push($countryCodes, new CountryCode("Lesotho", "LS", "LSO", "426"));
array_push($countryCodes, new CountryCode("Liberia", "LR", "LBR", "430"));
array_push($countryCodes, new CountryCode("Libya", "LY", "LBY", "434"));
array_push($countryCodes, new CountryCode("Liechtenstein", "LI", "LIE", "438"));
array_push($countryCodes, new CountryCode("Lithuania", "LT", "LTU", "440"));
array_push($countryCodes, new CountryCode("Luxembourg", "LU", "LUX", "442"));
array_push($countryCodes, new CountryCode("Macedonia, Republic of", "MK", "MKD", "807"));
array_push($countryCodes, new CountryCode("Madagascar", "MG", "MDG", "450"));
array_push($countryCodes, new CountryCode("Malawi", "MW", "MWI", "454"));
array_push($countryCodes, new CountryCode("Malaysia", "MY", "MYS", "458"));
array_push($countryCodes, new CountryCode("Maldives", "MV", "MDV", "462"));
array_push($countryCodes, new CountryCode("Mali", "ML", "MLI", "466"));
array_push($countryCodes, new CountryCode("Malta", "MT", "MLT", "470"));
array_push($countryCodes, new CountryCode("Marshall Islands", "MH", "MHL", "584"));
array_push($countryCodes, new CountryCode("Martinique", "MQ", "MTQ", "474"));
array_push($countryCodes, new CountryCode("Mauritania", "MR", "MRT", "478"));
array_push($countryCodes, new CountryCode("Mauritius", "MU", "MUS", "480"));
array_push($countryCodes, new CountryCode("Mayotte", "YT", "MYT", "175"));
array_push($countryCodes, new CountryCode("Mexico", "MX", "MEX", "484"));
array_push($countryCodes, new CountryCode("Micronesia, Federated States of", "FM", "FSM", "583"));
array_push($countryCodes, new CountryCode("Moldova", "MD", "MDA", "498"));
array_push($countryCodes, new CountryCode("Monaco", "MC", "MCO", "492"));
array_push($countryCodes, new CountryCode("Mongolia", "MN", "MNG", "496"));
array_push($countryCodes, new CountryCode("Montenegro", "ME", "MNE", "499"));
array_push($countryCodes, new CountryCode("Montserrat", "MS", "MSR", "500"));
array_push($countryCodes, new CountryCode("Morocco", "MA", "MAR", "504"));
array_push($countryCodes, new CountryCode("Mozambique", "MZ", "MOZ", "508"));
array_push($countryCodes, new CountryCode("Myanmar", "MM", "MMR", "104"));
array_push($countryCodes, new CountryCode("Namibia", "NA", "NAM", "516"));
array_push($countryCodes, new CountryCode("Nauru", "NR", "NRU", "520"));
array_push($countryCodes, new CountryCode("Nepal", "NP", "NPL", "524"));
array_push($countryCodes, new CountryCode("Netherlands", "NL", "NLD", "528"));
array_push($countryCodes, new CountryCode("Netherlands Antilles", "AN", "ANT", "530"));
array_push($countryCodes, new CountryCode("New Caledonia", "NC", "NCL", "540"));
array_push($countryCodes, new CountryCode("New Zealand", "NZ", "NZL", "554"));
array_push($countryCodes, new CountryCode("Nicaragua", "NI", "NIC", "558"));
array_push($countryCodes, new CountryCode("Niger", "NE", "NER", "562"));
array_push($countryCodes, new CountryCode("Nigeria", "NG", "NGA", "566"));
array_push($countryCodes, new CountryCode("Niue", "NU", "NIU", "570"));
array_push($countryCodes, new CountryCode("Norfolk Island", "NF", "NFK", "574"));
array_push($countryCodes, new CountryCode("Northern Mariana Islands", "MP", "MNP", "580"));
array_push($countryCodes, new CountryCode("Norway", "NO", "NOR", "578"));
array_push($countryCodes, new CountryCode("Oman", "OM", "OMN", "512"));
array_push($countryCodes, new CountryCode("Pakistan", "PK", "PAK", "586"));
array_push($countryCodes, new CountryCode("Palau", "PW", "PLW", "585"));
array_push($countryCodes, new CountryCode("Palestinian Territory", "PS", "PSE", "275"));
array_push($countryCodes, new CountryCode("Panama", "PA", "PAN", "591"));
array_push($countryCodes, new CountryCode("Papua New Guinea", "PG", "PNG", "598"));
array_push($countryCodes, new CountryCode("Paraguay", "PY", "PRY", "600"));
array_push($countryCodes, new CountryCode("Peru", "PE", "PER", "604"));
array_push($countryCodes, new CountryCode("Philippines", "PH", "PHL", "608"));
array_push($countryCodes, new CountryCode("Pitcairn", "PN", "PCN", "612"));
array_push($countryCodes, new CountryCode("Poland", "PL", "POL", "616"));
array_push($countryCodes, new CountryCode("Portugal", "PT", "PRT", "620"));
array_push($countryCodes, new CountryCode("Puerto Rico", "PR", "PRI", "630"));
array_push($countryCodes, new CountryCode("Qatar", "QA", "QAT", "634"));
array_push($countryCodes, new CountryCode("Réunion", "RE", "REU", "638"));
array_push($countryCodes, new CountryCode("Romania", "RO", "ROU", "642"));
array_push($countryCodes, new CountryCode("Russian Federation", "RU", "RUS", "643"));
array_push($countryCodes, new CountryCode("Rwanda", "RW", "RWA", "646"));
array_push($countryCodes, new CountryCode("Saint-Barthélemy", "BL", "BLM", "652"));
array_push($countryCodes, new CountryCode("Saint Helena", "SH", "SHN", "654"));
array_push($countryCodes, new CountryCode("Saint Kitts and Nevis", "KN", "KNA", "659"));
array_push($countryCodes, new CountryCode("Saint Lucia", "LC", "LCA", "662"));
array_push($countryCodes, new CountryCode("Saint-Martin (French part)", "MF", "MAF", "663"));
array_push($countryCodes, new CountryCode("Saint Pierre and Miquelon", "PM", "SPM", "666"));
array_push($countryCodes, new CountryCode("Saint Vincent and Grenadines", "VC", "VCT", "670"));
array_push($countryCodes, new CountryCode("Samoa", "WS", "WSM", "882"));
array_push($countryCodes, new CountryCode("San Marino", "SM", "SMR", "674"));
array_push($countryCodes, new CountryCode("Sao Tome and Principe", "ST", "STP", "678"));
array_push($countryCodes, new CountryCode("Saudi Arabia", "SA", "SAU", "682"));
array_push($countryCodes, new CountryCode("Senegal", "SN", "SEN", "686"));
array_push($countryCodes, new CountryCode("Serbia", "RS", "SRB", "688"));
array_push($countryCodes, new CountryCode("Seychelles", "SC", "SYC", "690"));
array_push($countryCodes, new CountryCode("Sierra Leone", "SL", "SLE", "694"));
array_push($countryCodes, new CountryCode("Singapore", "SG", "SGP", "702"));
array_push($countryCodes, new CountryCode("Slovakia", "SK", "SVK", "703"));
array_push($countryCodes, new CountryCode("Slovenia", "SI", "SVN", "705"));
array_push($countryCodes, new CountryCode("Solomon Islands", "SB", "SLB", "090"));
array_push($countryCodes, new CountryCode("Somalia", "SO", "SOM", "706"));
array_push($countryCodes, new CountryCode("South Africa", "ZA", "ZAF", "710"));
array_push($countryCodes, new CountryCode("South Georgia and the South Sandwich Islands", "GS", "SGS", "239"));
array_push($countryCodes, new CountryCode("South Sudan", "SS", "SSD", "728"));
array_push($countryCodes, new CountryCode("Spain", "ES", "ESP", "724"));
array_push($countryCodes, new CountryCode("Sri Lanka", "LK", "LKA", "144"));
array_push($countryCodes, new CountryCode("Sudan", "SD", "SDN", "736"));
array_push($countryCodes, new CountryCode("Suriname", "SR", "SUR", "740"));
array_push($countryCodes, new CountryCode("Svalbard and Jan Mayen Islands", "SJ", "SJM", "744"));
array_push($countryCodes, new CountryCode("Swaziland", "SZ", "SWZ", "748"));
array_push($countryCodes, new CountryCode("Sweden", "SE", "SWE", "752"));
array_push($countryCodes, new CountryCode("Switzerland", "CH", "CHE", "756"));
array_push($countryCodes, new CountryCode("Syrian Arab Republic (Syria)", "SY", "SYR", "760"));
array_push($countryCodes, new CountryCode("Taiwan, Republic of China", "TW", "TWN", "158"));
array_push($countryCodes, new CountryCode("Tajikistan", "TJ", "TJK", "762"));
array_push($countryCodes, new CountryCode("Tanzania, United Republic of", "TZ", "TZA", "834"));
array_push($countryCodes, new CountryCode("Thailand", "TH", "THA", "764"));
array_push($countryCodes, new CountryCode("Timor-Leste", "TL", "TLS", "626"));
array_push($countryCodes, new CountryCode("Togo", "TG", "TGO", "768"));
array_push($countryCodes, new CountryCode("Tokelau", "TK", "TKL", "772"));
array_push($countryCodes, new CountryCode("Tonga", "TO", "TON", "776"));
array_push($countryCodes, new CountryCode("Trinidad and Tobago", "TT", "TTO", "780"));
array_push($countryCodes, new CountryCode("Tunisia", "TN", "TUN", "788"));
array_push($countryCodes, new CountryCode("Turkey", "TR", "TUR", "792"));
array_push($countryCodes, new CountryCode("Turkmenistan", "TM", "TKM", "795"));
array_push($countryCodes, new CountryCode("Turks and Caicos Islands", "TC", "TCA", "796"));
array_push($countryCodes, new CountryCode("Tuvalu", "TV", "TUV", "798"));
array_push($countryCodes, new CountryCode("Uganda", "UG", "UGA", "800"));
array_push($countryCodes, new CountryCode("Ukraine", "UA", "UKR", "804"));
array_push($countryCodes, new CountryCode("United Arab Emirates", "AE", "ARE", "784"));
array_push($countryCodes, new CountryCode("United Kingdom", "GB", "GBR", "826"));
array_push($countryCodes, new CountryCode("United States of America", "US", "USA", "840"));
array_push($countryCodes, new CountryCode("United States", "US", "USA", "840"));
array_push($countryCodes, new CountryCode("US Minor Outlying Islands", "UM", "UMI", "581"));
array_push($countryCodes, new CountryCode("Uruguay", "UY", "URY", "858"));
array_push($countryCodes, new CountryCode("Uzbekistan", "UZ", "UZB", "860"));
array_push($countryCodes, new CountryCode("Vanuatu", "VU", "VUT", "548"));
array_push($countryCodes, new CountryCode("Venezuela (Bolivarian Republic)", "VE", "VEN", "862"));
array_push($countryCodes, new CountryCode("Viet Nam", "VN", "VNM", "704"));
array_push($countryCodes, new CountryCode("Virgin Islands, US", "VI", "VIR", "850"));
array_push($countryCodes, new CountryCode("Wallis and Futuna Islands", "WF", "WLF", "876"));
array_push($countryCodes, new CountryCode("Western Sahara", "EH", "ESH", "732"));
array_push($countryCodes, new CountryCode("Yemen", "YE", "YEM", "887"));
array_push($countryCodes, new CountryCode("Zambia", "ZM", "ZMB", "894"));
array_push($countryCodes, new CountryCode("Zimbabwe", "ZW", "ZWE", "716"));

return (object) $countryCodes;

?>
