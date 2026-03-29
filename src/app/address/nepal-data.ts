export interface NepalProvince {
    name: string;
    districts: NepalDistrict[];
}

export interface NepalDistrict {
    name: string;
    municipalities: string[];
}

export const NEPAL_DATA: NepalProvince[] = [
    {
        name: "Koshi",
        districts: [
            { name: "Bhojpur", municipalities: ["Bhojpur", "Shadanand", "Hatuwagadhi", "Ramprasad Rai", "Aamchok", "Tyamke Maiyum", "Arun", "Pauwadunma", "Salpasilichho"] },
            { name: "Dhankuta", municipalities: ["Dhankuta", "Pakhribas", "Mahalaxmi", "Sangurigadhi", "Sahidbhumi", "Chhathar Jorpati", "Chaubisay"] },
            { name: "Ilam", municipalities: ["Ilam", "Deumai", "Mai", "Suryodaya", "Fakphokthum", "Chulachuli", "Mai Jogmai", "Mangsebung", "Rong", "Sandakphu"] },
            { name: "Jhapa", municipalities: ["Mechinagar", "Bhadrapur", "Birtamod", "Damak", "Gauradaha", "Shivasatakshi", "Arjundhara", "Kankai", "Kamal", "Buddhashanti", "Jhapa", "Kachankawal", "Gauriganj", "Barhadashi", "Haldibari"] },
            { name: "Morang", municipalities: ["Biratnagar", "Belbari", "Letang", "Pathari-Shanischare", "Rangeli", "Ratannagar", "Sunawarshi", "Urlabari", "Sundar Haraicha", "Budhiganga", "Dhanpalthan", "Gramthan", "Jahada", "Kanepokhari", "Katahari", "Kerabari", "Miklayung"] },
            { name: "Sunsari", municipalities: ["Itahari", "Dharan", "Inaruwa", "Duhabi", "Ramdhuni", "Barahachhetra", "Dewanganj", "Gadhi", "Jagannathpur", "Koshi", "Bhokraha", "Harinagar"] },
            { name: "Khotang", municipalities: ["Diktel Rupakot Majhuwagadhi", "Halesi Tuwachung", "Aiselukharka", "Barehopokhari", "Diprung Chuichumma", "Khotehang", "Kepilasgadhi", "Jante Dhunga", "Rawabesi", "Sakela"] },
            { name: "Okhaldhunga", municipalities: ["Siddhicharan", "Ghyalchok", "Khajidehi", "Manebhanjyang", "Mole"] },
            { name: "Panchthar", municipalities: ["Phidim", "Phalelung", "Phalgunanda", "Hilihang", "Kummayak", "Miklajung", "Tumbewa", "Yangwarak"] },
            { name: "Sankhuwasabha", municipalities: ["Khandbari", "Chainpur", "Dharmadevi", "Madi", "Panchkhapan", "Bhotkhola", "Chichila", "Makalu", "Sabahpokhari", "Silichong"] },
            { name: "Solukhumbu", municipalities: ["Solu Dudhkunda", "Dudhkoshi", "Dudhkunda", "Khumbu Pasanglhamu", "Mahakulung", "Mapya Dudhkoshi", "Necha Salyan", "Sotang"] },
            { name: "Taplejung", municipalities: ["Phungling", "Aathrai Tribeni", "Maiwakhola", "Meringden", "Mikwakhola", "Phaktanglung", "Sidingba", "Sirijangha", "Pathibhara Yangwarak"] },
            { name: "Terhathum", municipalities: ["Myanglung", "Laligurans", "Aathrai", "Chhathar", "Phedap", "Menchayayem"] },
            { name: "Udayapur", municipalities: ["Triyuga", "Katari", "Chaudandigadhi", "Belaka", "Udayapurgadhi", "Rautamai", "Tapli", "Limchungbung"] }
        ]
    },
    {
        name: "Madhesh",
        districts: [
            { name: "Bara", municipalities: ["Kalaiya", "Jeetpur Simara", "Nijgadh", "Kolhabi", "Simroungadh", "Mahagadhimai", "Pacharauta", "Adarsh Kotwal", "Baragadhi", "Devtal", "Karaiya Mai", "Parwanipur", "Prasauka", "Pheta", "Suwarna"] },
            { name: "Dhanusa", municipalities: ["Janakpur", "Chhireshwornath", "Ganeshman Charnath", "Dhanusadham", "Nagarain", "Videha", "Mithila", "Sahidnagar", "Sabaila", "Kamala", "Mithila Bihari", "Hansapur"] },
            { name: "Parsa", municipalities: ["Birgunj", "Bahudarmai", "Parsagadhi", "Pokhariya", "Bindabasini", "Dhobini", "Jagarnathpur", "Jirabhawani", "Kalikamai", "Chipaharmai", "Pakahamainpur", "Sakhuwa Prasauni", "Thori"] },
            { name: "Saptari", municipalities: ["Rajbiraj", "Kanchanrup", "Hanumannagar Kankalini", "Shambhunath", "Surunga", "Bodebarsain", "Dakneshwori", "Khumbhakarna", "Chinnamasta", "Rupani"] },
            { name: "Siraha", municipalities: ["Siraha", "Lahan", "Mirchaiya", "Golbazar", "Dhangadhimai", "Kalyanpur", "Karjanha", "Sukhipur"] },
            { name: "Mahottari", municipalities: ["Jaleshwor", "Bardibas", "Gaushala", "Loharpatti", "Ramgopalpur", "Manra Siswa", "Mattihari", "Bhangaha", "Balwa"] },
            { name: "Sarlahi", municipalities: ["Malangwa", "Hariyon", "Bagmati", "Barathawa", "Godaita", "Ishworpur", "Kabilasi", "Lalbandi"] },
            { name: "Rautahat", municipalities: ["Gaur", "Chandrapur", "Garuda", "Ishnath", "Katariya", "Madhav Narayan", "Maulapur", "Phatuwa Bijayapur"] }
        ]
    },
    {
        name: "Bagmati",
        districts: [
            { name: "Bhaktapur", municipalities: ["Bhaktapur", "Madhyapur Thimi", "Changunarayan", "Suryabinayak"] },
            { name: "Chitwan", municipalities: ["Bharatpur", "Ratnanagar", "Khairahani", "Rapti", "Kalika", "Madi", "Ichchhakamana"] },
            { name: "Kathmandu", municipalities: ["Kathmandu Metro", "Budhanilkantha", "Tarakeshwar", "Gokarneshwar", "Chandragiri", "Tokha", "Kageshwori Manohara", "Nagarjun", "Kirtipur", "Shankharapur", "Dakshinkali"] },
            { name: "Lalitpur", municipalities: ["Lalitpur", "Mahalaxmi", "Godawari", "Konjyosom", "Bagmati", "Mahankal"] },
            { name: "Kavrepalanchok", municipalities: ["Dhulikhel", "Banepa", "Panauti", "Panchkhal", "Namobuddha", "Mandandeupur", "Roshi", "Temal", "Chauri Deurali", "Bhumlu", "Mahabharat", "Khanikhola"] },
            { name: "Dhading", municipalities: ["Nilkantha", "Dhunibesi", "Gajuri", "Galchhi", "Gangajamuna", "Jwalamukhi", "Khaniyabas", "Netrawati Dabjong", "Ruby Valley", "Siddhalek", "Thakre", "Tripurasundari"] },
            { name: "Dolakha", municipalities: ["Bhimeshwor", "Jiri", "Baiteshwor", "Gaurishankar", "Kalinchok", "Melung", "Sailung", "Tamakoshi", "Bigu"] },
            { name: "Makwanpur", municipalities: ["Hetauda", "Thaha", "Bagmati", "Bakaiya", "Bhimphedi", "Indrasarowar", "Kailash", "Manhari", "Raksirang", "Makwanpurgadhi"] },
            { name: "Nuwakot", municipalities: ["Bidur", "Belkotgadhi", "Kakani", "Kispang", "Likhu", "Myagang", "Panchakanya", "Shivapuri", "Suryagadhi", "Tadi", "Tarkeshwar"] },
            { name: "Ramechhap", municipalities: ["Manthali", "Ramechhap", "Umakunda", "Khandadevi", "Gokulganga", "Doramba", "Likhu Tamakoshi", "Sunapati"] },
            { name: "Rasuwa", municipalities: ["Dhunche", "Gosaikunda", "Kalika", "Naukunda", "Parbikunda", "Uttargaya"] },
            { name: "Sindhupalchok", municipalities: ["Chautara Sangachokgadhi", "Melamchi", "Bahrabise", "Bhotekoshi", "Helambu", "Indrawati", "Jugal", "Lisankhu Pakhar", "Panchpokhari Thangpal", "Tripurasundari"] },
            { name: "Sindhuli", municipalities: ["Kamalamai", "Dudhauli", "Golanjor", "Hariharpurgadhi", "Marin", "Phikkal", "Tinpatan", "Sunkoshi"] }
        ]
    },
    {
        name: "Gandaki",
        districts: [
            { name: "Kaski", municipalities: ["Pokhara", "Annapurna", "Machhapuchchhre", "Madi", "Rupa"] },
            { name: "Gorkha", municipalities: ["Gorkha", "Palungtar", "Barpak Sulikot", "Siranchok", "Ajirkot", "Aarughat", "Gandaki", "Dharche", "Bhimsen Thapa", "Chumanubri"] },
            { name: "Nawalpur", municipalities: ["Kawardaswoti", "Gaidakot", "Devchuli", "Madhyabindu", "Binayi Tribeni", "Bulingtar", "Baudikali", "Hupsekot"] },
            { name: "Tanahu", municipalities: ["Byas", "Shuklagandaki", "Bhanu", "Bhimad", "Anbu Khaireni", "Bandipur", "Devghat", "Myagde", "Rishing", "Ghiring"] },
            { name: "Syangja", municipalities: ["Putalibazar", "Waling", "Chapakot", "Bhirkot", "Galyang", "Arjun Chaupari", "Kaligandaki", "Phedikhola"] },
            { name: "Baglung", municipalities: ["Baglung", "Galkot", "Jaimini", "Dhorpatan", "Bareng", "Kanthekhola", "Nisikhola", "Taman Khola", "Tara Khola"] },
            { name: "Lamjung", municipalities: ["Besishahar", "Madhyanepal", "Rainas", "Sundarbazar", "Dordi", "Dudhpokhari", "Kwolasothar", "Marsyangdi"] },
            { name: "Manang", municipalities: ["Chame", "Narpa Bhumi", "Naspa", "Manang Ngisyang"] },
            { name: "Mustang", municipalities: ["Gharpajhong", "Thasang", "Baragung Muktichhetra", "Lomanthang", "Lo-Ghekar Damodarkunda"] },
            { name: "Myagdi", municipalities: ["Beni", "Annapurna", "Dhaulagiri", "Mangala", "Malika", "Raghuganga"] },
            { name: "Parbat", municipalities: ["Kushma", "Phalebas", "Bihadi", "Mahashila", "Modi", "Paiyu", "Jaljala"] }
        ]
    },
    {
        name: "Lumbini",
        districts: [
            { name: "Rupandehi", municipalities: ["Butwal", "Siddharthanagar", "Tillottama", "Devdaha", "Lumbini Sanskritik", "Sainamaina", "Gaidahawa", "Kanchan", "Kotahimai", "Marchawari", "Mayadevi", "Omshatiya", "Rohini", "Sammarimai", "Shuddhodhan", "Siyari"] },
            { name: "Banke", municipalities: ["Nepalgunj", "Kohalpur", "Rapti Sonari", "Narainapur", "Duduwa", "Khajura", "Janaki", "Baijanath"] },
            { name: "Bardiya", municipalities: ["Gulariya", "Rajapur", "Madhuwan", "Thakurbaba", "Bansgadhi", "Barbardiya", "Geruwa", "Badhaiyatal"] },
            { name: "Dang", municipalities: ["Ghorahi", "Tulsipur", "Lamahi", "Banglachuli", "Babai", "Dangisharan", "Gadawa", "Rajpur", "Rapti", "Shantinagar"] },
            { name: "Kapilvastu", municipalities: ["Kapilvastu", "Banganga", "Buddhabhumi", "Shivraj", "Krishnanagar", "Maharajgunj", "Bijaynagar", "Mayadevi", "Suddhodhan", "Yashodhara"] },
            { name: "Arghakhanchi", municipalities: ["Sandhikharka", "Sitganga", "Bhumikasthan", "Chhatradev", "Panini", "Malarani"] },
            { name: "Gulmi", municipalities: ["Resunga", "Muskot", "Isma", "Kaligandaki", "Gulmi Darbar", "Satyawati", "Chandrakot", "Ruru", "Chhatrakot", "Madane", "Dhurkot"] },
            { name: "Palpa", municipalities: ["Tansen", "Rampur", "Rainadevi Chhahara", "Ribdikot", "Bagnascali", "Pyukhola", "Mathagadhi", "Nisdi", "Purakhola", "Tinau"] },
            { name: "Pyuthan", municipalities: ["Pyuthan", "Sworgadwari", "Gaumukhi", "Mandavi", "Sarumarani", "Mallarani", "Naubahini", "Jhimruk", "Airawati"] },
            { name: "Rolpa", municipalities: ["Liwang", "Pariwartan", "Lungri", "Sunchhari", "Madi", "Ganga Dev", "Thabang", "Runtigadhi", "Triveni"] },
            { name: "Rukum East", municipalities: ["Sisne", "Bhume", "Putha Uttarganga"] },
            { name: "Parasi", municipalities: ["Ramgram", "Sunwal", "Bardaghat", "Sarawal", "Palhinandan", "Pratappur", "Susta"] }
        ]
    },
    {
        name: "Karnali",
        districts: [
            { name: "Surkhet", municipalities: ["Birendranagar", "Gurbhakot", "Panchapuri", "Bheriganga", "Lekhbeshi", "Barahatal", "Chaukune", "Chingad"] },
            { name: "Dailekh", municipalities: ["Narayan", "Dullu", "Aathbis", "Chamunda Bindrasaini", "Bhairabi", "Mahabu", "Naumule", "Dungeshwar", "Gurans", "Thantikandh"] },
            { name: "Dolpa", municipalities: ["Thuli Bheri", "Tripurasundari", "Dolpo Buddha", "She Phoksundo", "Jagadulla", "Mudkechula", "Kaike", "Chharka Tangsong"] },
            { name: "Humla", municipalities: ["Simikot", "Namkha", "Kharpunath", "Sarkegad", "Chankheli", "Adanchuli", "Tanjakot"] },
            { name: "Jajarkot", municipalities: ["Bheri", "Chhedagad", "Nalgad", "Barekot", "Kushe", "Junichande", "Shivalaya"] },
            { name: "Jumla", municipalities: ["Chandannath", "Kanakasundari", "Sinja", "Huma", "Tatopani", "Patarasi", "Tila", "Guthichaur"] },
            { name: "Kalikot", municipalities: ["Khandachakra", "Rashi Kot", "Tilagufa", "Pachaljharana", "Sanni Triveni", "Naraharinath", "Shubha Kalika", "Mahawai", "Palata"] },
            { name: "Mugu", municipalities: ["Chhayanath Rara", "Mugum Karmarong", "Soru", "Khatyad"] },
            { name: "Salyan", municipalities: ["Sharada", "Bagchaur", "Bangad Kupinde", "Kalimati", "Triveni", "Kapurkot", "Chatreshwari", "Kumakh", "Darma", "Siddha Kumakh"] },
            { name: "Rukum West", municipalities: ["Musikot", "Chaurjahari", "Aathbiskot", "Banfikot", "Sanibheri", "Triveni"] }
        ]
    },
    {
        name: "Sudurpashchim",
        districts: [
            { name: "Kailali", municipalities: ["Dhangadhi", "Tikapur", "Ghodaghodi", "Lamki Chuha", "Bhajani", "Godawari", "Gauriganga", "Janaki", "Bardagoriya", "Mohanyal", "Chure", "Kailari", "Joshipur"] },
            { name: "Kanchanpur", municipalities: ["Bhimdatta", "Bedkot", "Belauri", "Beldandi", "Dodhara Chandani", "Krishnapur", "Punarnaba", "Shuklaphanta", "Laljhari"] },
            { name: "Achham", municipalities: ["Mangalsen", "Sanphebagar", "Kamalbazar", "Panchaladwal", "Bannigadhi Jayagadh", "Chaurpati", "Dhakari", "Mellekh", "Ramaroshan", "Turmakhand"] },
            { name: "Baitadi", municipalities: ["Dasharathchand", "Patan", "Melauli", "Purchaudi", "Dogadakedar", "Dilasaini", "Sigas", "Pancheshwar", "Sunarya", "Shivanath"] },
            { name: "Bajhang", municipalities: ["Jaya Prithvi", "Bungal", "Talkot", "Masta", "Khaptad Chhanna", "Thalara", "Bitthadchir", "Surma", "Chhalis", "Durgathali", "Kedarsyun"] },
            { name: "Bajura", municipalities: ["Badimalika", "Triveni", "Budhiganga", "Budhinanda", "Chededaha", "Dogadi", "Pandavgufa", "Swamikartik Khapar", "Himali"] },
            { name: "Dadeldhura", municipalities: ["Amargadhi", "Parashuram", "Alital", "Bhageshwar", "Navadurga", "Ajayameru", "Ganyapadhura"] },
            { name: "Darchula", municipalities: ["Mahakali", "Shailyashikhar", "Malikarjun", "Apihimal", "Duhun", "Naugad", "Marma", "Lekam", "Vyans"] },
            { name: "Doti", municipalities: ["Dipayal Silgadhi", "Shikhar", "Purbi Chowki", "Badikedar", "Bogtan Phunjil", "Jorayal", "Sayal", "Adarsha", "Kedar Syu"] }
        ]
    }
];
