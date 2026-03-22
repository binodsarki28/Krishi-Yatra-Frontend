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
            { name: "Sunsari", municipalities: ["Itahari", "Dharan", "Inaruwa", "Duhabi", "Ramdhuni", "Barahachhetra", "Dewanganj", "Gadhi", "Jagannathpur", "Koshi", "Bhokraha", "Harinagar"] }
        ]
    },
    {
        name: "Madhesh",
        districts: [
            { name: "Bara", municipalities: ["Kalaiya", "Jeetpur Simara", "Nijgadh", "Kolhabi", "Simroungadh", "Mahagadhimai", "Pacharauta", "Adarsh Kotwal", "Baragadhi", "Devtal", "Karaiya Mai", "Parwanipur", "Prasauka", "Pheta", "Suwarna"] },
            { name: "Dhanusa", municipalities: ["Janakpur", "Chhireshwornath", "Ganeshman Charnath", "Dhanusadham", "Nagarain", "Videha", "Mithila", "Sahidnagar", "Sabaila", "Kamala", "Mithila Bihari", "Hansapur"] },
            { name: "Parsa", municipalities: ["Birgunj", "Bahudarmai", "Parsagadhi", "Pokhariya", "Bindabasini", "Dhobini", "Jagarnathpur", "Jirabhawani", "Kalikamai", "Chipaharmai", "Pakahamainpur", "Sakhuwa Prasauni", "Thori"] }
        ]
    },
    {
        name: "Bagmati",
        districts: [
            { name: "Bhaktapur", municipalities: ["Bhaktapur", "Madhyapur Thimi", "Changunarayan", "Suryabinayak"] },
            { name: "Chitwan", municipalities: ["Bharatpur", "Ratnanagar", "Khairahani", "Rapti", "Kalika", "Madi", "Ichchhakamana"] },
            { name: "Kathmandu", municipalities: ["Kathmandu Metro", "Budhanilkantha", "Tarakeshwar", "Gokarneshwar", "Chandragiri", "Tokha", "Kageshwori Manohara", "Nagarjun", "Kirtipur", "Shankharapur", "Dakshinkali"] },
            { name: "Lalitpur", municipalities: ["Lalitpur", "Mahalaxmi", "Godawari", "Konjyosom", "Bagmati", "Mahankal"] },
            { name: "Kavrepalanchok", municipalities: ["Dhulikhel", "Banepa", "Panauti", "Panchkhal", "Namobuddha", "Mandandeupur", "Roshi", "Temal", "Chauri Deurali", "Bhumlu", "Mahabharat", "Khanikhola"] }
        ]
    },
    {
        name: "Gandaki",
        districts: [
            { name: "Kaski", municipalities: ["Pokhara", "Annapurna", "Machhapuchchhre", "Madi", "Rupa"] },
            { name: "Nawalpur", municipalities: ["Kawardaswoti", "Gaidakot", "Devchuli", "Madhyabindu", "Binayi Tribeni", "Bulingtar", "Baudikali", "Hupsekot"] }
        ]
    },
    {
        name: "Lumbini",
        districts: [
            { name: "Rupandehi", municipalities: ["Butwal", "Siddharthanagar", "Tillottama", "Devdaha", "Lumbini Sanskritik", "Sainamaina", "Gaidahawa", "Kanchan", "Kotahimai", "Marchawari", "Mayadevi", "Omshatiya", "Rohini", "Sammarimai", "Shuddhodhan", "Siyari"] }
        ]
    },
    {
        name: "Karnali",
        districts: [
            { name: "Surkhet", municipalities: ["Birendranagar", "Gurbhakot", "Panchapuri", " भेरीगंगा", "Lekhbeshi", "Barahatal", "Chaukune", "Chingad"] }
        ]
    },
    {
        name: "Sudurpashchim",
        districts: [
            { name: "Kailali", municipalities: ["Dhangadhi", "Tikapur", "Ghodaghodi", "Lamki Chuha", "Bhajani", "Godawari", "Gauriganga", "Janaki", "Bardagoriya", "Mohanyal", "Chure", "Kailari", "Joshipur"] }
        ]
    }
];
