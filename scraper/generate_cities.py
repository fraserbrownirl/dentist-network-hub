#!/usr/bin/env python3
"""
Generate cities.txt with all major cities worldwide (500k+ population)
"""

cities_data = {
    "USA": [
        "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
        "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
        "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis",
        "Seattle", "Denver", "Boston", "Nashville", "Portland", "Las Vegas",
        "Detroit", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque",
        "Tucson", "Fresno", "Sacramento", "Atlanta", "Miami", "Minneapolis",
        "New Orleans", "Cleveland", "Pittsburgh", "St. Louis", "Tampa", "Orlando",
        "Honolulu", "Salt Lake City", "Kansas City", "Raleigh", "Virginia Beach",
        "Omaha", "Oakland", "Miami Beach", "Tulsa", "Arlington", "Tampa", "Newark",
        "Buffalo", "Corpus Christi", "Aurora", "Riverside", "St. Petersburg",
        "Lexington", "Anchorage", "Stockton", "Cincinnati", "St. Paul", "Toledo",
        "Greensboro", "Newark", "Plano", "Henderson", "Lincoln", "Buffalo",
        "Jersey City", "Chula Vista", "Fort Wayne", "Orlando", "St. Petersburg",
        "Chandler", "Laredo", "Norfolk", "Durham", "Madison", "Lubbock",
        "Irvine", "Winston-Salem", "Glendale", "Garland", "Hialeah", "Reno",
        "Chesapeake", "Gilbert", "Baton Rouge", "Irving", "Scottsdale", "North Las Vegas",
        "Fremont", "Boise", "Richmond", "San Bernardino", "Birmingham", "Spokane",
        "Rochester", "Des Moines", "Modesto", "Fayetteville", "Tacoma", "Oxnard",
        "Fontana", "Columbus", "Montgomery", "Moreno Valley", "Shreveport", "Aurora",
        "Yonkers", "Akron", "Huntington Beach", "Little Rock", "Augusta", "Amarillo",
        "Glendale", "Mobile", "Grand Rapids", "Salt Lake City", "Tallahassee",
        "Grand Prairie", "Overland Park", "Knoxville", "Worcester", "Brownsville",
        "Newport News", "Santa Clarita", "Port St. Lucie", "Providence", "Fort Lauderdale",
        "Chattanooga", "Tempe", "Oceanside", "Garden Grove", "Rancho Cucamonga",
        "Cape Coral", "Santa Rosa", "Vancouver", "Sioux Falls", "Peoria", "Ontario",
        "Jackson", "Elk Grove", "Springfield", "Pembroke Pines", "Salem", "Corona",
        "Eugene", "McKinney", "Fort Collins", "Lancaster", "Cary", "Palmdale",
        "Hayward", "Salinas", "Frisco", "Springfield", "Pasadena", "Macon", "Alexandria",
        "Pomona", "Lakewood", "Sunnyvale", "Escondido", "Kansas City", "Hollywood",
        "Clarksville", "Torrance", "Rockford", "Joliet", "Paterson", "Bridgeport",
        "Naperville", "Savannah", "Mesquite", "Killeen", "Syracuse", "McAllen",
        "Pasadena", "Bellevue", "Fullerton", "Orange", "Dayton", "Miramar",
        "Thornton", "West Valley City", "Cedar Rapids", "Olathe", "Carrollton",
        "Midland", "Charleston", "Waco", "Surprise", "Topeka", "Beaumont",
        "Elgin", "Visalia", "Denton", "Simi Valley", "Stamford", "Concord",
        "Hartford", "Kent", "Lafayette", "Bellevue", "Santa Clara", "Costa Mesa",
        "Miami Gardens", "Fairfield", "Clearwater", "Peoria", "Independence",
        "Westminster", "North Charleston", "Waterbury", "San Mateo", "Rialto",
        "Edison", "Daly City", "Burbank", "Santa Monica", "El Cajon", "San Leandro",
        "Boulder", "Compton", "Renton", "Evansville", "Downey", "Inglewood",
        "South Bend", "Richmond", "Antioch", "El Monte", "Round Rock", "Pueblo",
        "Kenosha", "Ann Arbor", "Lakeland", "Gresham", "Lewisville", "Tyler",
        "Athens", "Roseville", "Thornton", "Abilene", "Avondale", "Vallejo",
        "Victorville", "Norman", "Allentown", "Berkeley", "West Covina", "Billings",
        "Richardson", "Palm Bay", "Cambridge", "Broken Arrow", "Lowell", "Clearwater",
        "Gainesville", "Westminster", "High Point", "West Jordan", "Murfreesboro",
        "Lakeland", "Pompano Beach", "Bremerton", "Arvada", "Sandy Springs", "Federal Way",
        "Albany", "Boulder", "Odessa", "Erie", "Carrollton", "Wilmington", "Racine",
        "St. Cloud", "Athens", "Thousand Oaks", "Coral Springs", "Elgin", "Independence",
        "Fairfield", "Lansing", "South Bend", "Westminster", "Brockton", "Evansville",
        "Daly City", "Burbank", "Renton", "Inglewood", "Compton", "South Gate",
        "Richmond", "Downey", "El Monte", "Antioch", "Round Rock", "Pueblo",
        "Kenosha", "Ann Arbor", "Lakeland", "Gresham", "Lewisville", "Tyler",
        "Athens", "Roseville", "Thornton", "Abilene", "Avondale", "Vallejo",
        "Victorville", "Norman", "Allentown", "Berkeley", "West Covina", "Billings",
        "Richardson", "Palm Bay", "Cambridge", "Broken Arrow", "Lowell", "Clearwater",
        "Gainesville", "Westminster", "High Point", "West Jordan", "Murfreesboro",
        "Lakeland", "Pompano Beach", "Bremerton", "Arvada", "Sandy Springs", "Federal Way",
        "Albany", "Boulder", "Odessa", "Erie", "Carrollton", "Wilmington", "Racine",
        "St. Cloud", "Athens", "Thousand Oaks", "Coral Springs", "Elgin", "Independence",
        "Fairfield", "Lansing", "South Bend", "Westminster", "Brockton", "Evansville"
    ],
    "Canada": [
        "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa",
        "Winnipeg", "Quebec City", "Hamilton", "Halifax", "London", "Victoria",
        "Saskatoon", "Regina", "St. John's", "Oshawa", "Kitchener", "Windsor",
        "Sherbrooke", "Barrie", "Abbotsford", "Sudbury", "Saguenay", "Trois-Rivieres",
        "Guelph", "Cambridge", "Coquitlam", "Kelowna", "Kingston", "Thunder Bay"
    ],
    "Mexico": [
        "Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León",
        "Juárez", "Torreón", "Querétaro", "San Luis Potosí", "Mérida", "Mexicali",
        "Aguascalientes", "Tampico", "Culiacán", "Acapulco", "Cancún", "Chihuahua",
        "Saltillo", "Morelia", "Hermosillo", "Toluca", "Veracruz", "Xalapa",
        "Oaxaca", "Tuxtla Gutiérrez", "Campeche", "Chetumal", "Villahermosa", "Pachuca"
    ],
    "UK": [
        "London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh",
        "Bristol", "Leeds", "Cardiff", "Belfast", "Newcastle", "Sheffield",
        "Leicester", "Coventry", "Bradford", "Nottingham", "Kingston upon Hull",
        "Plymouth", "Stoke-on-Trent", "Wolverhampton", "Derby", "Southampton",
        "Portsmouth", "Brighton", "Reading", "Northampton", "Luton", "Bolton",
        "Swindon", "Norwich", "Bournemouth", "Peterborough", "Southend-on-Sea",
        "Middlesbrough", "Ipswich", "Blackpool", "Cambridge", "Oxford", "York",
        "Exeter", "Gloucester", "Bath", "Canterbury", "Durham", "Lincoln"
    ],
    "Germany": [
        "Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Düsseldorf",
        "Stuttgart", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden",
        "Hannover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld",
        "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden",
        "Gelsenkirchen", "Mönchengladbach", "Braunschweig", "Chemnitz", "Kiel",
        "Aachen", "Halle", "Magdeburg", "Freiburg", "Krefeld", "Lübeck",
        "Oberhausen", "Erfurt", "Mainz", "Rostock", "Kassel", "Hagen", "Hamm",
        "Saarbrücken", "Mülheim", "Potsdam", "Ludwigshafen", "Oldenburg", "Leverkusen",
        "Osnabrück", "Solingen", "Heidelberg", "Herne", "Neuss", "Darmstadt",
        "Paderborn", "Regensburg", "Ingolstadt", "Würzburg", "Fürth", "Wolfsburg",
        "Offenbach", "Ulm", "Heilbronn", "Pforzheim", "Göttingen", "Bottrop",
        "Trier", "Recklinghausen", "Reutlingen", "Bremerhaven", "Koblenz", "Bergisch Gladbach",
        "Jena", "Remscheid", "Erlangen", "Moers", "Siegen", "Hildesheim", "Salzgitter"
    ],
    "France": [
        "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg",
        "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre",
        "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes",
        "Villeurbanne", "Saint-Denis", "Le Mans", "Aix-en-Provence", "Clermont-Ferrand",
        "Brest", "Limoges", "Tours", "Amiens", "Perpignan", "Metz", "Besançon",
        "Boulogne-Billancourt", "Orléans", "Mulhouse", "Rouen", "Caen", "Nancy",
        "Saint-Denis", "Argenteuil", "Montreuil", "Roubaix", "Tourcoing", "Nanterre"
    ],
    "Spain": [
        "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga",
        "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba",
        "Valladolid", "Vigo", "Gijón", "Hospitalet", "Granada", "Vitoria-Gasteiz",
        "A Coruña", "Elche", "Santa Cruz de Tenerife", "Oviedo", "Badalona",
        "Cartagena", "Terrassa", "Jerez de la Frontera", "Sabadell", "Móstoles",
        "Pamplona", "Santa Coloma de Gramenet", "Almería", "Fuenlabrada", "Leganés",
        "Getafe", "Donostia-San Sebastián", "Burgos", "Albacete", "Castellón de la Plana",
        "Santander", "Alcorcón", "San Sebastián", "Logroño", "Badajoz", "Salamanca",
        "Marbella", "Lleida", "Tarragona", "León", "Cádiz", "Huelva", "Jaén",
        "Lorca", "Mataró", "Dos Hermanas", "Algeciras", "Reus", "Torrevieja"
    ],
    "Italy": [
        "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna",
        "Florence", "Bari", "Catania", "Venice", "Verona", "Messina", "Padua",
        "Trieste", "Brescia", "Parma", "Taranto", "Prato", "Modena", "Reggio Calabria",
        "Reggio Emilia", "Perugia", "Livorno", "Ravenna", "Cagliari", "Foggia",
        "Rimini", "Salerno", "Ferrara", "Sassari", "Latina", "Giugliano in Campania",
        "Monza", "Syracuse", "Bergamo", "Pescara", "Trento", "Forlì", "Terni",
        "Bolzano", "Novara", "Piacenza", "Ancona", "Andria", "Arezzo", "Udine",
        "Cesena", "Lecce", "Pesaro", "La Spezia", "Pisa", "Guidonia Montecelio",
        "Catanzaro", "Pistoia", "Brindisi", "Como", "Marsala", "Grosseto", "Varese"
    ],
    "Netherlands": [
        "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen",
        "Tilburg", "Almere", "Breda", "Nijmegen", "Enschede", "Haarlem", "Arnhem",
        "Zaanstad", "Amersfoort", "Apeldoorn", "Hoofddorp", "Maastricht", "Leiden",
        "Dordrecht", "Zoetermeer", "Zwolle", "Deventer", "Delft", "Heerlen",
        "Alkmaar", "Venlo", "Leeuwarden", "Hilversum", "Amstelveen", "Roosendaal",
        "Schiedam", "Vlaardingen", "Spijkenisse", "Dordrecht", "Purmerend", "Hengelo"
    ],
    "Belgium": [
        "Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur",
        "Leuven", "Mons", "Aalst", "Mechelen", "La Louvière", "Kortrijk", "Hasselt",
        "Ostend", "Sint-Niklaas", "Tournai", "Genk", "Seraing", "Roeselare", "Verviers",
        "Mouscron", "Beveren", "Dendermonde", "Turnhout", "Dilbeek", "Heist-op-den-Berg"
    ],
    "Switzerland": [
        "Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Winterthur", "St. Gallen",
        "Lucerne", "Lugano", "Biel", "Thun", "Köniz", "La Chaux-de-Fonds", "Schaffhausen"
    ],
    "Austria": [
        "Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach",
        "Wels", "Sankt Pölten", "Dornbirn", "Steyr", "Wiener Neustadt", "Feldkirch"
    ],
    "Portugal": [
        "Lisbon", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Funchal",
        "Coimbra", "Setúbal", "Almada", "Agualva-Cacém", "Queluz", "Rio de Mouro",
        "Barreiro", "Aveiro", "Corroios", "Leiria", "Faro", "Évora", "Viseu"
    ],
    "Ireland": [
        "Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk",
        "Swords", "Bray", "Navan", "Ennis", "Kilkenny", "Carlow", "Tralee", "Newbridge"
    ],
    "Denmark": [
        "Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding",
        "Horsens", "Vejle", "Roskilde", "Herning", "Helsingør", "Silkeborg", "Næstved"
    ],
    "Sweden": [
        "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping",
        "Helsingborg", "Jönköping", "Norrköping", "Lund", "Umeå", "Gävle", "Borås",
        "Södertälje", "Växjö", "Halmstad", "Eskilstuna", "Karlstad", "Sundsvall"
    ],
    "Norway": [
        "Oslo", "Bergen", "Trondheim", "Stavanger", "Bærum", "Kristiansand", "Fredrikstad",
        "Sandnes", "Tromsø", "Sarpsborg", "Skien", "Ålesund", "Sandefjord", "Haugesund"
    ],
    "Finland": [
        "Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä",
        "Lahti", "Kuopio", "Pori", "Kouvola", "Joensuu", "Lappeenranta", "Hämeenlinna"
    ],
    "Poland": [
        "Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin",
        "Bydgoszcz", "Lublin", "Katowice", "Białystok", "Gdynia", "Częstochowa",
        "Radom", "Sosnowiec", "Toruń", "Kielce", "Gliwice", "Zabrze", "Bytom",
        "Olsztyn", "Rzeszów", "Ruda Śląska", "Rybnik", "Tychy", "Dąbrowa Górnicza",
        "Elbląg", "Opole", "Gorzów Wielkopolski", "Wałbrzych", "Włocławek", "Tarnów",
        "Chorzów", "Kalisz", "Koszalin", "Legnica", "Grudziądz", "Słupsk", "Jaworzno"
    ],
    "Czech Republic": [
        "Prague", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "Ústí nad Labem",
        "České Budějovice", "Hradec Králové", "Pardubice", "Zlín", "Havířov", "Kladno",
        "Most", "Opava", "Frýdek-Místek", "Karviná", "Jihlava", "Teplice", "Děčín"
    ],
    "Hungary": [
        "Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr", "Nyíregyháza",
        "Kecskemét", "Székesfehérvár", "Szombathely", "Szolnok", "Érd", "Tatabánya",
        "Sopron", "Kaposvár", "Veszprém", "Békéscaba", "Zalaegerszeg", "Eger", "Nagykanizsa"
    ],
    "Greece": [
        "Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Ioannina",
        "Kavala", "Serres", "Chania", "Kalamata", "Rhodes", "Agrinio", "Katerini",
        "Trikala", "Xanthi", "Lamia", "Alexandroupoli", "Kozani", "Komotini", "Sparta"
    ],
    "Romania": [
        "Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova",
        "Brașov", "Galați", "Ploiești", "Oradea", "Brăila", "Arad", "Pitești",
        "Sibiu", "Bacău", "Târgu Mureș", "Baia Mare", "Buzău", "Botoșani", "Satu Mare"
    ],
    "Bulgaria": [
        "Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven",
        "Sliven", "Dobrich", "Shumen", "Pernik", "Yambol", "Haskovo", "Pazardzhik",
        "Blagoevgrad", "Veliko Tarnovo", "Gabrovo", "Vratsa", "Kardzhali", "Kyustendil"
    ],
    "Croatia": [
        "Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Slavonski Brod", "Pula",
        "Sesvete", "Karlovac", "Varaždin", "Šibenik", "Sisak", "Velika Gorica", "Bjelovar"
    ],
    "Serbia": [
        "Belgrade", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo",
        "Čačak", "Novi Pazar", "Kraljevo", "Smederevo", "Leskovac", "Valjevo", "Kruševac"
    ],
    "Japan": [
        "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe",
        "Kawasaki", "Kyoto", "Saitama", "Hiroshima", "Sendai", "Chiba", "Kitakyushu",
        "Setagaya", "Sakai", "Niigata", "Hamamatsu", "Shizuoka", "Okayama", "Kumamoto",
        "Kagoshima", "Hachioji", "Utsunomiya", "Matsuyama", "Kanazawa", "Nagano",
        "Toyama", "Gifu", "Fukui", "Kofu", "Mito", "Urawa", "Omiya", "Kawaguchi",
        "Tokorozawa", "Koshigaya", "Soka", "Ageo", "Sayama", "Kasukabe", "Toda",
        "Warabi", "Kuki", "Fukaya", "Honjo", "Gyoda", "Kumagaya", "Fukushima",
        "Aomori", "Akita", "Yamagata", "Morioka", "Iwaki", "Koriyama", "Aizuwakamatsu"
    ],
    "South Korea": [
        "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon",
        "Ulsan", "Changwon", "Goyang", "Yongin", "Seongnam", "Bucheon", "Ansan",
        "Anyang", "Jeonju", "Cheonan", "Namyangju", "Hwaseong", "Cheongju",
        "Gimhae", "Jinju", "Pohang", "Gyeongju", "Gangneung", "Jeju", "Mokpo",
        "Yeosu", "Gunsan", "Iksan", "Suncheon", "Gwangyang", "Jinju", "Tongyeong"
    ],
    "China": [
        "Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Chengdu", "Chongqing",
        "Hangzhou", "Wuhan", "Xi'an", "Suzhou", "Tianjin", "Nanjing", "Zhengzhou",
        "Changsha", "Dongguan", "Qingdao", "Kunming", "Dalian", "Shenyang",
        "Xiamen", "Jinan", "Harbin", "Foshan", "Hefei", "Changzhou", "Ningbo",
        "Shijiazhuang", "Nanning", "Fuzhou", "Wenzhou", "Zhongshan", "Shantou",
        "Jinhua", "Taizhou", "Xuzhou", "Yantai", "Huizhou", "Zhuhai", "Baoding",
        "Changchun", "Zibo", "Linyi", "Handan", "Weifang", "Jining", "Xiangyang",
        "Luoyang", "Hohhot", "Yinchuan", "Urumqi", "Lhasa", "Haikou", "Sanya"
    ],
    "India": [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
        "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
        "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara",
        "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
        "Rajkot", "Varanasi", "Srinagar", "Amritsar", "Navi Mumbai", "Allahabad",
        "Ranchi", "Howrah", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur",
        "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli", "Mysore",
        "Tiruchirappalli", "Bareilly", "Aligarh", "Moradabad", "Jalandhar", "Gorakhpur",
        "Bhiwandi", "Saharanpur", "Amravati", "Noida", "Firozabad", "Bhubaneswar",
        "Kochi", "Bhavnagar", "Warangal", "Guntur", "Dehradun", "Durgapur", "Asansol",
        "Kolhapur", "Ajmer", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri",
        "Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj", "Mangalore", "Erode", "Belgaum"
    ],
    "Indonesia": [
        "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar",
        "Palembang", "Tangerang", "Depok", "Bekasi", "Batam", "Pekanbaru",
        "Padang", "Malang", "Denpasar", "Bandar Lampung", "Bogor", "Cimahi",
        "Surakarta", "Pontianak", "Manado", "Balikpapan", "Jambi", "Ambon",
        "Samarinda", "Mataram", "Palu", "Banjarmasin", "Yogyakarta", "Cirebon",
        "Kupang", "Sukabumi", "Tasikmalaya", "Pangkal Pinang", "Banda Aceh",
        "Jayapura", "Kendari", "Pematangsiantar", "Binjai", "Parepare", "Tegal"
    ],
    "Thailand": [
        "Bangkok", "Nonthaburi", "Nakhon Ratchasima", "Chiang Mai", "Hat Yai",
        "Udon Thani", "Pak Kret", "Khon Kaen", "Nakhon Si Thammarat", "Ubon Ratchathani",
        "Surat Thani", "Rayong", "Nakhon Sawan", "Phitsanulok", "Chon Buri",
        "Songkhla", "Lampang", "Phuket", "Ratchaburi", "Samut Prakan", "Kanchanaburi",
        "Trang", "Yala", "Pattaya", "Ayutthaya", "Saraburi", "Mae Sot", "Narathiwat"
    ],
    "Malaysia": [
        "Kuala Lumpur", "George Town", "Ipoh", "Johor Bahru", "Melaka", "Kota Kinabalu",
        "Shah Alam", "Kuching", "Kota Bharu", "Alor Setar", "Miri", "Petaling Jaya",
        "Klang", "Subang Jaya", "Seremban", "Kuantan", "Taiping", "Sandakan",
        "Tawau", "Kulim", "Sibu", "Batu Pahat", "Kangar", "Putrajaya", "Labuan"
    ],
    "Singapore": ["Singapore"],
    "Philippines": [
        "Manila", "Quezon City", "Caloocan", "Davao", "Cebu", "Zamboanga",
        "Antipolo", "Pasig", "Taguig", "Cagayan de Oro", "Parañaque", "Dasmariñas",
        "Valenzuela", "Las Piñas", "Makati", "Bacolod", "General Santos", "Muntinlupa",
        "San Jose del Monte", "Marikina", "Mandaue", "Pasay", "Bacoor", "Tarlac City",
        "Iloilo", "Calamba", "Butuan", "Cabuyao", "Lapu-Lapu", "Batangas", "Cainta",
        "San Pedro", "Navotas", "Malabon", "San Fernando", "Roxas", "Naga", "Lipa",
        "Taytay", "Lucena", "Digos", "San Pablo", "Trece Martires", "Koronadal", "Tagum"
    ],
    "Vietnam": [
        "Ho Chi Minh City", "Hanoi", "Haiphong", "Da Nang", "Can Tho", "Bien Hoa",
        "Nha Trang", "Hue", "Vung Tau", "Quy Nhon", "Rach Gia", "Long Xuyen",
        "Nam Dinh", "Thai Nguyen", "Buon Ma Thuot", "Cam Ranh", "Cam Pha", "My Tho",
        "Ca Mau", "Bac Lieu", "Soc Trang", "Tra Vinh", "Bac Giang", "Phan Thiet",
        "Tuy Hoa", "Tan An", "Dong Hoi", "Kon Tum", "Pleiku", "Dong Ha", "Lao Cai"
    ],
    "Australia": [
        "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast",
        "Newcastle", "Canberra", "Sunshine Coast", "Wollongong", "Hobart", "Geelong",
        "Townsville", "Cairns", "Toowoomba", "Darwin", "Ballarat", "Bendigo",
        "Albury", "Launceston", "Mackay", "Rockhampton", "Bunbury", "Bundaberg",
        "Coffs Harbour", "Wagga Wagga", "Hervey Bay", "Port Macquarie", "Tamworth", "Orange"
    ],
    "New Zealand": [
        "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Napier",
        "Palmerston North", "Rotorua", "New Plymouth", "Whangarei", "Invercargill",
        "Nelson", "Hastings", "Gisborne", "Timaru", "Dunedin", "Whanganui"
    ],
    "Brazil": [
        "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte",
        "Manaus", "Curitiba", "Recife", "Porto Alegre", "Goiânia", "Belém", "Guarulhos",
        "Campinas", "São Luís", "São Gonçalo", "Maceió", "Duque de Caxias", "Natal",
        "Teresina", "Campo Grande", "Nova Iguaçu", "São Bernardo do Campo", "João Pessoa",
        "Santo André", "Osasco", "Jaboatão dos Guararapes", "São José dos Campos", "Ribeirão Preto",
        "Uberlândia", "Contagem", "Aracaju", "Feira de Santana", "Cuiabá", "Joinville",
        "Aparecida de Goiânia", "Londrina", "Juiz de Fora", "Ananindeua", "Porto Velho",
        "Serra", "Niterói", "Caxias do Sul", "Campos dos Goytacazes", "Macapá", "Vila Velha",
        "Florianópolis", "Mauá", "Diadema", "São João de Meriti", "Maringá", "Olinda",
        "Carapicuíba", "Belford Roxo", "Santos", "Vitória", "Caucaia", "Anápolis", "Caruaru"
    ],
    "Argentina": [
        "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán",
        "Mar del Plata", "Salta", "Santa Fe", "San Juan", "Resistencia", "Santiago del Estero",
        "Corrientes", "Bahía Blanca", "Posadas", "Paraná", "Neuquén", "Formosa",
        "San Salvador de Jujuy", "La Rioja", "Catamarca", "Río Gallegos", "Comodoro Rivadavia",
        "San Luis", "Viedma", "Rawson", "Ushuaia", "Santa Rosa", "San Rafael", "Tandil"
    ],
    "Chile": [
        "Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco",
        "Rancagua", "Talca", "Arica", "Iquique", "Puerto Montt", "Coquimbo",
        "Valdivia", "Osorno", "Chillán", "Calama", "Copiapó", "Los Ángeles",
        "Punta Arenas", "Curicó", "Quillota", "San Antonio", "Linares", "Talagante"
    ],
    "Colombia": [
        "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta",
        "Bucaramanga", "Pereira", "Santa Marta", "Ibagué", "Pasto", "Manizales",
        "Neiva", "Villavicencio", "Armenia", "Valledupar", "Sincelejo", "Montería",
        "Popayán", "Riohacha", "Tunja", "Florencia", "Quibdó", "Arauca", "Yopal"
    ],
    "Peru": [
        "Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos",
        "Cusco", "Chimbote", "Huancayo", "Pucallpa", "Tacna", "Ica",
        "Juliaca", "Sullana", "Chincha Alta", "Ayacucho", "Cajamarca", "Puno",
        "Tumbes", "Talara", "Huaraz", "Pisco", "Tarapoto", "Moyobamba", "Jaén"
    ],
    "Venezuela": [
        "Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana",
        "Barcelona", "Maturín", "Ciudad Bolívar", "San Cristóbal", "Cumaná", "Barinas",
        "Mérida", "Cabimas", "Puerto La Cruz", "Punto Fijo", "Guanare", "Los Teques",
        "Puerto Cabello", "Coro", "El Tigre", "Valera", "Acarigua", "Carúpano", "El Vigía"
    ],
    "Ecuador": [
        "Quito", "Guayaquil", "Cuenca", "Santo Domingo", "Machala", "Durán",
        "Manta", "Portoviejo", "Loja", "Ambato", "Esmeraldas", "Quevedo",
        "Riobamba", "Milagro", "Ibarra", "Babahoyo", "Sangolquí", "Latacunga",
        "Tulcán", "Pasaje", "Chone", "Montecristi", "Jipijapa", "Ventanas", "La Libertad"
    ],
    "Uruguay": [
        "Montevideo", "Salto", "Ciudad de la Costa", "Paysandú", "Las Piedras",
        "Rivera", "Maldonado", "Tacuarembó", "Melo", "Mercedes", "Artigas",
        "Minas", "San José de Mayo", "Durazno", "Barros Blancos", "Ciudad del Plata",
        "Pando", "Colonia del Sacramento", "Treinta y Tres", "Rocha", "Fray Bentos"
    ],
    "Paraguay": [
        "Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá", "Lambaré",
        "Fernando de la Mora", "Limpio", "Ñemby", "Encarnación", "Mariano Roque Alonso",
        "Pedro Juan Caballero", "Villarrica", "Coronel Oviedo", "Concepción", "Caaguazú",
        "Caacupé", "Itauguá", "San Antonio", "Areguá", "Villa Elisa", "Ypacaraí"
    ],
    "Egypt": [
        "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez",
        "Luxor", "Mansoura", "Tanta", "Asyut", "Ismailia", "Faiyum", "Zagazig",
        "Damietta", "Aswan", "Minya", "Damanhur", "Beni Suef", "Qena", "Sohag",
        "Hurghada", "Shibin El Kom", "Kafr el-Sheikh", "Arish", "Benha", "Desouk"
    ],
    "South Africa": [
        "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth",
        "Pietermaritzburg", "Benoni", "Tembisa", "Vereeniging", "Bloemfontein",
        "Newcastle", "East London", "Klerksdorp", "Polokwane", "Nelspruit",
        "Kimberley", "Uitenhage", "Rustenburg", "Welkom", "Potchefstroom",
        "George", "Kroonstad", "Oudtshoorn", "Upington", "Grahamstown"
    ],
    "Nigeria": [
        "Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City",
        "Kaduna", "Maiduguri", "Zaria", "Aba", "Jos", "Ilorin", "Oyo", "Enugu",
        "Abeokuta", "Onitsha", "Warri", "Calabar", "Uyo", "Akure", "Bauchi",
        "Katsina", "Ado-Ekiti", "Makurdi", "Minna", "Sokoto", "Gombe", "Owerri"
    ],
    "Kenya": [
        "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi",
        "Kitale", "Garissa", "Kakamega", "Nyeri", "Meru", "Machakos", "Embu",
        "Narok", "Kericho", "Bungoma", "Busia", "Homa Bay", "Kilifi", "Lamu"
    ],
    "Morocco": [
        "Casablanca", "Rabat", "Fes", "Marrakech", "Tangier", "Agadir",
        "Meknes", "Oujda", "Kenitra", "Tetouan", "Safi", "Mohammedia",
        "Khouribga", "El Jadida", "Beni Mellal", "Taza", "Nador", "Settat",
        "Larache", "Ksar el-Kebir", "Guelmim", "Errachidia", "Tiznit", "Azrou"
    ],
    "Tunisia": [
        "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana",
        "Gafsa", "Monastir", "Ben Arous", "Kasserine", "Medenine", "Béja",
        "Jendouba", "Kélibia", "Zarzis", "Mahdia", "Tozeur", "Tataouine", "Siliana"
    ],
    "Ghana": [
        "Accra", "Kumasi", "Tamale", "Takoradi", "Ashaiman", "Sunyani",
        "Cape Coast", "Obuasi", "Teshie", "Tema", "Koforidua", "Sekondi",
        "Techiman", "Ho", "Wa", "Bolgatanga", "Bawku", "Nkawkaw", "Aflao",
        "Elmina", "Winneba", "Hohoe", "Yendi", "Berekum", "Dunkwa-on-Offin"
    ],
    "Ethiopia": [
        "Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Awassa", "Bahir Dar",
        "Dessie", "Jimma", "Jijiga", "Shashamane", "Bishoftu", "Arba Minch",
        "Hosaena", "Harar", "Dila", "Nekemte", "Goba", "Sodo", "Debre Markos",
        "Asella", "Gode", "Yirgalem", "Dembi Dolo", "Gambela", "Moyale"
    ],
    "UAE": [
        "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah",
        "Fujairah", "Umm Al Quwain", "Khor Fakkan", "Dibba Al-Fujairah", "Madinat Zayed"
    ],
    "Saudi Arabia": [
        "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Taif",
        "Abha", "Tabuk", "Buraydah", "Khamis Mushait", "Hail", "Najran",
        "Al Jubail", "Hafr Al Batin", "Al Qatif", "Yanbu", "Arar", "Sakaka",
        "Jizan", "Al Bahah", "Tarut", "Unaizah", "Al Kharj", "Qatif"
    ],
    "Israel": [
        "Tel Aviv", "Jerusalem", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod",
        "Netanya", "Beer Sheva", "Holon", "Bnei Brak", "Ramat Gan", "Rehovot",
        "Bat Yam", "Ashkelon", "Herzliya", "Kfar Saba", "Hadera", "Modiin",
        "Raanana", "Givatayim", "Nahariya", "Lod", "Ramla", "Eilat", "Acre"
    ],
    "Turkey": [
        "Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Gaziantep",
        "Konya", "Mersin", "Diyarbakır", "Kayseri", "Eskişehir", "Urfa", "Malatya",
        "Erzurum", "Van", "Batman", "Elazığ", "Denizli", "Samsun", "Kahramanmaraş",
        "Şanlıurfa", "Adapazarı", "Trabzon", "Ordu", "Aydın", "Balıkesir", "Manisa",
        "Tekirdağ", "Osmaniye", "Çorum", "Afyonkarahisar", "Isparta", "Aksaray"
    ],
    "Russia": [
        "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan",
        "Nizhny Novgorod", "Chelyabinsk", "Samara", "Omsk", "Rostov-on-Don",
        "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd", "Krasnodar",
        "Saratov", "Tyumen", "Tolyatti", "Izhevsk", "Barnaul", "Ulyanovsk",
        "Irkutsk", "Khabarovsk", "Yaroslavl", "Vladivostok", "Makhachkala",
        "Tomsk", "Orenburg", "Kemerovo", "Novokuznetsk", "Ryazan", "Naberezhnye Chelny",
        "Astrakhan", "Penza", "Lipetsk", "Kirov", "Cheboksary", "Kaliningrad", "Tula",
        "Kursk", "Stavropol", "Sochi", "Ulan-Ude", "Chita", "Arkhangelsk", "Belgorod"
    ]
}

def generate_cities_file():
    """Generate cities.txt file with all cities formatted for scraper"""
    output_lines = []
    total_unique = 0
    total_duplicates = 0
    
    for country, cities in cities_data.items():
        # Remove duplicates while preserving order
        seen = set()
        unique_cities = []
        for city in cities:
            if city not in seen:
                seen.add(city)
                unique_cities.append(city)
            else:
                total_duplicates += 1
        
        output_lines.append(f"# {country}")
        for city in unique_cities:
            output_lines.append(f"dentists {city}, {country}")
        output_lines.append("")
        total_unique += len(unique_cities)
    
    return "\n".join(output_lines), total_unique, total_duplicates

if __name__ == "__main__":
    content, total, duplicates = generate_cities_file()
    with open("cities.txt", "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated cities.txt with {total} unique cities (removed {duplicates} duplicates)")
