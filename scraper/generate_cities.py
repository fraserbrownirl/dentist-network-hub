#!/usr/bin/env python3
"""
Generate cities.txt with all major cities worldwide (500k+ population)
Large cities are split into neighborhoods for comprehensive coverage.
"""

# Megacities (10M+) - split into many neighborhoods
megacities = {
    "Tokyo, Japan": [
        "Shinjuku", "Shibuya", "Ginza", "Roppongi", "Akihabara", "Ikebukuro",
        "Ueno", "Asakusa", "Odaiba", "Harajuku", "Meguro", "Shinagawa",
        "Nakano", "Kichijoji", "Shimokitazawa"
    ],
    "Delhi, India": [
        "Connaught Place", "South Delhi", "North Delhi", "East Delhi", "West Delhi",
        "Dwarka", "Rohini", "Karol Bagh", "Lajpat Nagar", "Greater Kailash",
        "Vasant Kunj", "Saket", "Nehru Place"
    ],
    "Shanghai, China": [
        "Pudong", "Jing'an", "Huangpu", "Xuhui", "Hongkou", "Putuo",
        "Changning", "Yangpu", "Minhang", "Baoshan", "Lujiazui"
    ],
    "São Paulo, Brazil": [
        "Paulista", "Pinheiros", "Vila Madalena", "Moema", "Itaim Bibi",
        "Jardins", "Consolação", "Liberdade", "Santana", "Tatuapé",
        "Vila Mariana", "Brooklin", "Campo Belo"
    ],
    "Mexico City, Mexico": [
        "Polanco", "Condesa", "Roma Norte", "Coyoacán", "Santa Fe",
        "Centro Histórico", "Zona Rosa", "Del Valle", "Narvarte",
        "Tlalpan", "Xochimilco", "Iztapalapa"
    ],
    "Cairo, Egypt": [
        "Downtown Cairo", "Zamalek", "Maadi", "Heliopolis", "Nasr City",
        "New Cairo", "6th of October City", "Giza", "Dokki", "Mohandessin"
    ],
    "Mumbai, India": [
        "South Mumbai", "Bandra", "Andheri", "Juhu", "Powai", "Worli",
        "Lower Parel", "Kurla", "Dadar", "Malad", "Borivali", "Thane"
    ],
    "Beijing, China": [
        "Dongcheng", "Xicheng", "Chaoyang", "Haidian", "Fengtai",
        "Shijingshan", "Tongzhou", "Shunyi", "Wangjing", "Sanlitun"
    ],
    "Dhaka, Bangladesh": [
        "Gulshan", "Banani", "Dhanmondi", "Uttara", "Mirpur", "Mohammadpur",
        "Bashundhara", "Motijheel", "Tejgaon", "Badda"
    ],
    "Osaka, Japan": [
        "Umeda", "Namba", "Shinsaibashi", "Tennoji", "Shinsekai",
        "Dotonbori", "Kitashinchi", "Abeno", "Tsuruhashi"
    ],
    "New York, USA": [
        "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island",
        "Midtown Manhattan", "Upper East Side", "Upper West Side",
        "Lower Manhattan", "Harlem", "Chelsea", "Greenwich Village",
        "SoHo", "Tribeca", "East Village", "Williamsburg Brooklyn",
        "Park Slope Brooklyn", "Astoria Queens", "Flushing Queens",
        "Long Island City"
    ],
    "Karachi, Pakistan": [
        "Clifton", "Defence", "Gulshan-e-Iqbal", "North Nazimabad", "PECHS",
        "Saddar", "Korangi", "Malir", "Nazimabad", "Gulistan-e-Jauhar"
    ],
    "Buenos Aires, Argentina": [
        "Palermo", "Recoleta", "San Telmo", "Puerto Madero", "Belgrano",
        "Caballito", "Villa Crespo", "Almagro", "Núñez", "Colegiales"
    ],
    "Istanbul, Turkey": [
        "Beyoğlu", "Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Fatih",
        "Bakırköy", "Ataşehir", "Sarıyer", "Maltepe", "Kartal", "Pendik"
    ],
    "Lagos, Nigeria": [
        "Victoria Island", "Ikoyi", "Lekki", "Ikeja", "Surulere", "Yaba",
        "Apapa", "Ajah", "Gbagada", "Maryland", "Festac Town"
    ],
    "Manila, Philippines": [
        "Makati", "Bonifacio Global City", "Ortigas", "Quezon City",
        "Pasig", "Mandaluyong", "Parañaque", "Taguig", "Pasay", "San Juan"
    ],
    "Rio de Janeiro, Brazil": [
        "Copacabana", "Ipanema", "Leblon", "Botafogo", "Barra da Tijuca",
        "Centro", "Lapa", "Santa Teresa", "Tijuca", "Flamengo", "Lagoa"
    ],
    "Guangzhou, China": [
        "Tianhe", "Yuexiu", "Liwan", "Haizhu", "Baiyun", "Panyu",
        "Huangpu", "Zengcheng", "Nansha"
    ],
    "Los Angeles, USA": [
        "Downtown LA", "Hollywood", "Beverly Hills", "Santa Monica",
        "Venice", "Westwood", "Pasadena", "Glendale", "Burbank",
        "Long Beach", "Culver City", "West Hollywood", "Silver Lake",
        "Echo Park", "Koreatown", "Brentwood", "Century City"
    ],
    "Moscow, Russia": [
        "Central Moscow", "Arbat", "Tverskaya", "Kitay-gorod", "Zamoskvorechye",
        "Khamovniki", "Presnensky", "Basmanny", "Taganka", "Sokolniki"
    ],
    "Shenzhen, China": [
        "Futian", "Luohu", "Nanshan", "Bao'an", "Longgang", "Longhua",
        "Pingshan", "Yantian", "Shekou"
    ],
    "London, UK": [
        "Central London", "Westminster", "City of London", "Kensington",
        "Chelsea", "Camden", "Islington", "Hackney", "Southwark",
        "Greenwich", "Tower Hamlets", "Hammersmith", "Fulham",
        "Richmond", "Wandsworth", "Lambeth", "Lewisham", "Croydon"
    ],
    "Paris, France": [
        "1st arrondissement", "2nd arrondissement", "3rd arrondissement",
        "4th arrondissement", "5th arrondissement", "6th arrondissement",
        "7th arrondissement", "8th arrondissement", "9th arrondissement",
        "10th arrondissement", "11th arrondissement", "12th arrondissement",
        "13th arrondissement", "14th arrondissement", "15th arrondissement",
        "16th arrondissement", "17th arrondissement", "18th arrondissement",
        "La Défense"
    ],
    "Jakarta, Indonesia": [
        "Central Jakarta", "South Jakarta", "North Jakarta", "East Jakarta",
        "West Jakarta", "Menteng", "Kemang", "Senayan", "Kuningan",
        "Kelapa Gading", "Pluit", "Pantai Indah Kapuk"
    ],
    "Seoul, South Korea": [
        "Gangnam", "Jongno", "Jung-gu", "Mapo", "Yongsan", "Songpa",
        "Seocho", "Seongdong", "Dongdaemun", "Gwangjin", "Yeongdeungpo",
        "Itaewon", "Hongdae", "Myeongdong", "Sinchon"
    ],
    "Bangkok, Thailand": [
        "Sukhumvit", "Silom", "Sathorn", "Siam", "Chatuchak", "Thonglor",
        "Ekkamai", "Ari", "Ratchada", "Rama 9", "Bang Na", "Phra Khanong"
    ],
    "Chicago, USA": [
        "Downtown Chicago", "Loop", "River North", "Lincoln Park",
        "Wicker Park", "Lakeview", "Gold Coast", "Old Town",
        "West Loop", "South Loop", "Andersonville", "Wrigleyville"
    ],
    "Lima, Peru": [
        "Miraflores", "San Isidro", "Barranco", "Surco", "La Molina",
        "San Borja", "Magdalena", "Jesús María", "Lince", "Centro de Lima"
    ],
    "Bogotá, Colombia": [
        "Chapinero", "Usaquén", "Zona Rosa", "La Candelaria", "Teusaquillo",
        "Suba", "Kennedy", "Engativá", "Fontibón", "Barrios Unidos"
    ],
    "Ho Chi Minh City, Vietnam": [
        "District 1", "District 2", "District 3", "District 7", "District 10",
        "Binh Thanh", "Phu Nhuan", "Tan Binh", "Go Vap", "Thu Duc"
    ],
    "Hong Kong": [
        "Central", "Causeway Bay", "Tsim Sha Tsui", "Mong Kok", "Wan Chai",
        "Admiralty", "Sheung Wan", "Kennedy Town", "Happy Valley",
        "Quarry Bay", "Tai Koo", "Kowloon City", "Sham Shui Po"
    ],
    "Singapore": [
        "Orchard", "Marina Bay", "Raffles Place", "Bugis", "Chinatown",
        "Clarke Quay", "Tanjong Pagar", "Tiong Bahru", "Holland Village",
        "Dempsey Hill", "Novena", "Bukit Timah", "Jurong", "Tampines"
    ],
    "Toronto, Canada": [
        "Downtown Toronto", "Yorkville", "Queen West", "Liberty Village",
        "King West", "Financial District", "The Annex", "Rosedale",
        "North York", "Scarborough", "Etobicoke", "Mississauga"
    ],
    "Johannesburg, South Africa": [
        "Sandton", "Rosebank", "Braamfontein", "Melville", "Parkhurst",
        "Fourways", "Midrand", "Randburg", "Centurion", "Pretoria"
    ],
    "Sydney, Australia": [
        "CBD Sydney", "Bondi", "Surry Hills", "Newtown", "Paddington",
        "Manly", "Parramatta", "Chatswood", "North Sydney", "Mosman",
        "Double Bay", "Darlinghurst", "Pyrmont", "Ultimo"
    ],
    "Melbourne, Australia": [
        "CBD Melbourne", "Southbank", "St Kilda", "Fitzroy", "Carlton",
        "South Yarra", "Richmond", "Brunswick", "Prahran", "Toorak",
        "Docklands", "Collingwood", "Hawthorn"
    ],
    "Berlin, Germany": [
        "Mitte", "Prenzlauer Berg", "Kreuzberg", "Friedrichshain",
        "Charlottenburg", "Schöneberg", "Neukölln", "Wedding",
        "Wilmersdorf", "Steglitz", "Spandau", "Tempelhof"
    ],
    "Madrid, Spain": [
        "Centro Madrid", "Salamanca", "Chamberí", "Retiro", "Chamartín",
        "Arganzuela", "Malasaña", "Chueca", "La Latina", "Lavapiés",
        "Moncloa", "Tetuán"
    ],
    "Barcelona, Spain": [
        "Eixample", "Gràcia", "Born", "Gothic Quarter", "Barceloneta",
        "Poble Sec", "Sant Martí", "Les Corts", "Sarrià", "Horta"
    ]
}

# Large cities (2M-10M) - split into fewer neighborhoods
large_cities = {
    "Houston, USA": ["Downtown Houston", "Midtown", "Montrose", "Heights", "Galleria", "Memorial", "Rice Village"],
    "Phoenix, USA": ["Downtown Phoenix", "Scottsdale", "Tempe", "Mesa", "Chandler", "Gilbert"],
    "Philadelphia, USA": ["Center City", "University City", "Fishtown", "Manayunk", "Old City", "South Philly"],
    "San Antonio, USA": ["Downtown San Antonio", "Alamo Heights", "Stone Oak", "Medical Center", "Southtown"],
    "San Diego, USA": ["Downtown San Diego", "La Jolla", "Pacific Beach", "Hillcrest", "North Park", "Gaslamp"],
    "Dallas, USA": ["Downtown Dallas", "Uptown", "Deep Ellum", "Bishop Arts", "Preston Hollow", "Oak Lawn"],
    "San Francisco, USA": ["Downtown SF", "Marina", "Mission", "Castro", "SOMA", "Nob Hill", "Haight-Ashbury"],
    "Miami, USA": ["Downtown Miami", "Brickell", "South Beach", "Wynwood", "Coral Gables", "Coconut Grove"],
    "Atlanta, USA": ["Downtown Atlanta", "Midtown", "Buckhead", "Virginia-Highland", "Decatur", "East Atlanta"],
    "Boston, USA": ["Downtown Boston", "Back Bay", "Beacon Hill", "Cambridge", "South End", "Brookline"],
    "Seattle, USA": ["Downtown Seattle", "Capitol Hill", "Ballard", "Fremont", "Queen Anne", "Bellevue"],
    "Denver, USA": ["Downtown Denver", "LoDo", "Cherry Creek", "Highlands", "RiNo", "Capitol Hill"],
    "Washington DC, USA": ["Downtown DC", "Georgetown", "Dupont Circle", "Capitol Hill", "Adams Morgan", "Foggy Bottom"],
    "Dubai, UAE": ["Downtown Dubai", "Dubai Marina", "Jumeirah", "Deira", "Business Bay", "JBR", "DIFC"],
    "Riyadh, Saudi Arabia": ["Olaya", "Malaz", "Al Sahafa", "Al Nakheel", "Al Muruj", "Al Rawdah"],
    "Jeddah, Saudi Arabia": ["Al Balad", "Al Hamra", "Al Rawdah", "Al Shati", "Al Nahda"],
    "Tel Aviv, Israel": ["Central Tel Aviv", "Florentin", "Neve Tzedek", "Rothschild", "Ramat Aviv", "Jaffa"],
    "Kuala Lumpur, Malaysia": ["KLCC", "Bukit Bintang", "Bangsar", "Mont Kiara", "Damansara", "Petaling Jaya"],
    "Nairobi, Kenya": ["CBD Nairobi", "Westlands", "Karen", "Kilimani", "Lavington", "Gigiri"],
    "Cape Town, South Africa": ["CBD Cape Town", "Sea Point", "Camps Bay", "Claremont", "Constantia", "Green Point"],
    "Casablanca, Morocco": ["Centre Ville", "Maarif", "Anfa", "Ain Diab", "Bourgogne", "Gauthier"],
    "Vancouver, Canada": ["Downtown Vancouver", "Yaletown", "Gastown", "Kitsilano", "West End", "Mount Pleasant"],
    "Montreal, Canada": ["Downtown Montreal", "Plateau", "Old Montreal", "Mile End", "Griffintown", "Westmount"],
    "Rome, Italy": ["Centro Storico", "Trastevere", "Testaccio", "Prati", "Monti", "EUR", "Parioli"],
    "Milan, Italy": ["Centro Milano", "Brera", "Navigli", "Porta Nuova", "Isola", "Porta Romana"],
    "Amsterdam, Netherlands": ["Centrum", "Jordaan", "De Pijp", "Oud-West", "Oost", "Noord", "Zuid"],
    "Munich, Germany": ["Altstadt", "Schwabing", "Maxvorstadt", "Glockenbachviertel", "Haidhausen", "Sendling"],
    "Vienna, Austria": ["Innere Stadt", "Leopoldstadt", "Neubau", "Josefstadt", "Margareten", "Mariahilf"],
    "Warsaw, Poland": ["Śródmieście", "Mokotów", "Wola", "Żoliborz", "Praga", "Ochota"],
    "Prague, Czech Republic": ["Prague 1", "Prague 2", "Prague 3", "Prague 5", "Prague 6", "Prague 7"],
    "Budapest, Hungary": ["District V", "District VI", "District VII", "District XI", "District XIII", "Buda"],
    "Hanoi, Vietnam": ["Hoan Kiem", "Ba Dinh", "Tay Ho", "Dong Da", "Hai Ba Trung", "Cau Giay"],
    "Bangalore, India": ["Indiranagar", "Koramangala", "Whitefield", "MG Road", "Jayanagar", "HSR Layout", "Electronic City"],
    "Hyderabad, India": ["Banjara Hills", "Jubilee Hills", "Hitech City", "Madhapur", "Gachibowli", "Secunderabad"],
    "Chennai, India": ["T Nagar", "Anna Nagar", "Adyar", "Velachery", "Nungambakkam", "Mylapore"],
    "Kolkata, India": ["Park Street", "Salt Lake", "Ballygunge", "South Kolkata", "Howrah", "Rajarhat"]
}

# Medium cities - use as single queries with higher depth
medium_cities = {
    "USA": [
        "Phoenix", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus",
        "Charlotte", "Indianapolis", "Nashville", "Portland", "Las Vegas",
        "Detroit", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque",
        "Tucson", "Fresno", "Sacramento", "Minneapolis", "New Orleans", "Cleveland",
        "Pittsburgh", "St. Louis", "Tampa", "Orlando", "Honolulu", "Salt Lake City",
        "Kansas City", "Raleigh", "Virginia Beach", "Omaha", "Oakland", "Tulsa",
        "Buffalo", "Riverside", "Cincinnati", "St. Paul", "Newark", "Anchorage",
        "Stockton", "Toledo", "Greensboro", "Jersey City", "Norfolk", "Durham",
        "Madison", "Lubbock", "Irvine", "Winston-Salem", "Garland", "Hialeah", "Reno",
        "Chesapeake", "Baton Rouge", "Irving", "Scottsdale", "Fremont", "Boise",
        "Richmond", "San Bernardino", "Birmingham", "Spokane", "Rochester",
        "Des Moines", "Modesto", "Fayetteville", "Tacoma", "Fontana", "Montgomery",
        "Shreveport", "Yonkers", "Akron", "Huntington Beach", "Little Rock", "Augusta",
        "Amarillo", "Mobile", "Grand Rapids", "Tallahassee", "Knoxville", "Worcester",
        "Brownsville", "Newport News", "Santa Clarita", "Providence", "Fort Lauderdale",
        "Chattanooga", "Oceanside", "Cape Coral", "Santa Rosa", "Sioux Falls",
        "Jackson", "Eugene", "Fort Collins", "Savannah", "Syracuse", "McAllen",
        "Dayton", "Waco", "Charleston", "Colorado Springs", "Lexington", "Henderson"
    ],
    "Canada": [
        "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton",
        "Halifax", "London", "Victoria", "Saskatoon", "Regina", "St. John's",
        "Kitchener", "Windsor", "Kelowna", "Kingston"
    ],
    "Mexico": [
        "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez",
        "Querétaro", "San Luis Potosí", "Mérida", "Aguascalientes", "Cancún",
        "Chihuahua", "Morelia", "Veracruz", "Oaxaca"
    ],
    "UK": [
        "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh", "Bristol",
        "Leeds", "Cardiff", "Belfast", "Newcastle", "Sheffield", "Leicester",
        "Nottingham", "Southampton", "Brighton", "Cambridge", "Oxford", "York"
    ],
    "Germany": [
        "Frankfurt", "Hamburg", "Cologne", "Düsseldorf", "Stuttgart", "Dortmund",
        "Essen", "Leipzig", "Bremen", "Dresden", "Hannover", "Nuremberg",
        "Bonn", "Mannheim", "Karlsruhe", "Wiesbaden"
    ],
    "France": [
        "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg",
        "Montpellier", "Bordeaux", "Lille", "Rennes"
    ],
    "Spain": [
        "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Bilbao",
        "Alicante", "Granada", "Palma"
    ],
    "Italy": [
        "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence",
        "Bari", "Venice", "Verona"
    ],
    "Netherlands": [
        "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen"
    ],
    "Belgium": [
        "Brussels", "Antwerp", "Ghent", "Bruges", "Liège"
    ],
    "Switzerland": [
        "Zurich", "Geneva", "Basel", "Bern", "Lausanne"
    ],
    "Portugal": [
        "Lisbon", "Porto", "Braga", "Coimbra"
    ],
    "Ireland": [
        "Dublin", "Cork", "Galway", "Limerick"
    ],
    "Sweden": [
        "Stockholm", "Gothenburg", "Malmö", "Uppsala"
    ],
    "Norway": [
        "Oslo", "Bergen", "Trondheim", "Stavanger"
    ],
    "Denmark": [
        "Copenhagen", "Aarhus", "Odense"
    ],
    "Finland": [
        "Helsinki", "Espoo", "Tampere", "Oulu"
    ],
    "Poland": [
        "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin"
    ],
    "Czech Republic": [
        "Brno", "Ostrava", "Plzeň"
    ],
    "Greece": [
        "Athens", "Thessaloniki", "Patras"
    ],
    "Romania": [
        "Bucharest", "Cluj-Napoca", "Timișoara", "Iași"
    ],
    "Japan": [
        "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kawasaki",
        "Kyoto", "Saitama", "Hiroshima", "Sendai"
    ],
    "South Korea": [
        "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan"
    ],
    "China": [
        "Chengdu", "Chongqing", "Hangzhou", "Wuhan", "Xi'an", "Suzhou",
        "Tianjin", "Nanjing", "Zhengzhou", "Changsha", "Dongguan", "Qingdao",
        "Kunming", "Dalian", "Shenyang", "Xiamen", "Jinan", "Harbin", "Foshan",
        "Hefei", "Changzhou", "Ningbo", "Shijiazhuang", "Nanning", "Fuzhou",
        "Wenzhou", "Taiyuan", "Nanchang", "Guiyang"
    ],
    "India": [
        "Ahmedabad", "Pune", "Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
        "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara"
    ],
    "Indonesia": [
        "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang",
        "Tangerang", "Depok", "Bekasi"
    ],
    "Thailand": [
        "Chiang Mai", "Pattaya", "Phuket", "Nonthaburi", "Nakhon Ratchasima"
    ],
    "Philippines": [
        "Quezon City", "Davao", "Cebu", "Zamboanga"
    ],
    "Australia": [
        "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra"
    ],
    "New Zealand": [
        "Auckland", "Wellington", "Christchurch", "Hamilton"
    ],
    "Brazil": [
        "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus",
        "Curitiba", "Recife", "Porto Alegre", "Goiânia", "Belém"
    ],
    "Argentina": [
        "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán", "Mar del Plata"
    ],
    "Chile": [
        "Santiago", "Valparaíso", "Concepción"
    ],
    "Colombia": [
        "Medellín", "Cali", "Barranquilla", "Cartagena"
    ],
    "Peru": [
        "Arequipa", "Trujillo", "Chiclayo", "Cusco"
    ],
    "Venezuela": [
        "Caracas", "Maracaibo", "Valencia", "Barquisimeto"
    ],
    "Egypt": [
        "Alexandria", "Giza", "Shubra El Kheima", "Port Said"
    ],
    "South Africa": [
        "Durban", "Pretoria", "Port Elizabeth"
    ],
    "Nigeria": [
        "Kano", "Ibadan", "Abuja", "Port Harcourt"
    ],
    "Kenya": [
        "Mombasa", "Kisumu", "Nakuru"
    ],
    "Morocco": [
        "Rabat", "Fes", "Marrakech", "Tangier"
    ],
    "UAE": [
        "Abu Dhabi", "Sharjah", "Al Ain"
    ],
    "Saudi Arabia": [
        "Mecca", "Medina", "Dammam", "Khobar"
    ],
    "Turkey": [
        "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya"
    ],
    "Russia": [
        "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan",
        "Nizhny Novgorod", "Chelyabinsk", "Samara", "Omsk", "Rostov-on-Don",
        "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd"
    ],
    "Pakistan": [
        "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Peshawar", "Islamabad"
    ],
    "Bangladesh": [
        "Chittagong", "Khulna", "Rajshahi", "Sylhet"
    ]
}


def generate_cities_file():
    """Generate cities.txt file with all cities formatted for scraper"""
    output_lines = []
    total_queries = 0
    
    # Add megacity neighborhoods
    output_lines.append("# MEGACITIES (10M+ population) - Neighborhoods for comprehensive coverage")
    output_lines.append("")
    for city, neighborhoods in megacities.items():
        output_lines.append(f"# {city}")
        seen = set()
        for neighborhood in neighborhoods:
            if neighborhood not in seen:
                seen.add(neighborhood)
                output_lines.append(f"dentists {neighborhood}, {city}")
                total_queries += 1
        output_lines.append("")
    
    # Add large city neighborhoods
    output_lines.append("# LARGE CITIES (2M-10M population) - Key neighborhoods")
    output_lines.append("")
    for city, neighborhoods in large_cities.items():
        output_lines.append(f"# {city}")
        seen = set()
        for neighborhood in neighborhoods:
            if neighborhood not in seen:
                seen.add(neighborhood)
                output_lines.append(f"dentists {neighborhood}, {city}")
                total_queries += 1
        output_lines.append("")
    
    # Add medium cities (single query each)
    output_lines.append("# MEDIUM CITIES (500k-2M population) - Single query each")
    output_lines.append("")
    for country, cities in medium_cities.items():
        output_lines.append(f"# {country}")
        seen = set()
        for city in cities:
            if city not in seen:
                seen.add(city)
                output_lines.append(f"dentists {city}, {country}")
                total_queries += 1
        output_lines.append("")
    
    return "\n".join(output_lines), total_queries


if __name__ == "__main__":
    content, total = generate_cities_file()
    with open("cities.txt", "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated cities.txt with {total} queries (neighborhoods + cities)")
