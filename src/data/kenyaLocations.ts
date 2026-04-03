export interface Ward {
  name: string;
  estates: string[];
}

export interface SubCounty {
  name: string;
  wards: Ward[];
}

export interface County {
  name: string;
  subcounties: SubCounty[];
  // Flat estates list for backward compatibility
  estates: string[];
}

export const kenyaLocations: County[] = [
  {
    name: "Nairobi",
    estates: ["Westlands", "Kilimani", "Lavington", "Karen", "Kileleshwa", "South B", "South C", "Eastleigh", "Roysambu", "Kasarani", "Embakasi", "Langata", "Dagoretti", "Ruaraka", "Pangani", "Parklands", "Spring Valley", "Runda", "Muthaiga", "Gigiri"],
    subcounties: [
      {
        name: "Westlands",
        wards: [
          { name: "Kitisuru", estates: ["Kitisuru", "Loresho", "Runda", "Muthaiga"] },
          { name: "Parklands/Highridge", estates: ["Parklands", "Highridge", "Westlands", "Spring Valley"] },
          { name: "Karura", estates: ["Gigiri", "Village Market", "New Muthaiga"] },
          { name: "Kangemi", estates: ["Kangemi", "Mountain View"] },
          { name: "Mountain View", estates: ["Lavington", "Valley Arcade", "Muthangari"] },
        ],
      },
      {
        name: "Dagoretti North",
        wards: [
          { name: "Kilimani", estates: ["Kilimani", "Hurlingham", "Yaya"] },
          { name: "Kawangware", estates: ["Kawangware", "Gatina"] },
          { name: "Gatina", estates: ["Riara Ridge", "Uthiru"] },
          { name: "Kileleshwa", estates: ["Kileleshwa", "Riverside"] },
          { name: "Kabiro", estates: ["Kabiro"] },
        ],
      },
      {
        name: "Dagoretti South",
        wards: [
          { name: "Mutu-ini", estates: ["Dagoretti Corner", "Mutuini"] },
          { name: "Ngando", estates: ["Ngando", "Riruta"] },
          { name: "Riruta", estates: ["Satellite", "Riruta"] },
          { name: "Uthiru/Ruthimitu", estates: ["Uthiru", "Ruthimitu"] },
          { name: "Waithaka", estates: ["Waithaka"] },
        ],
      },
      {
        name: "Lang'ata",
        wards: [
          { name: "Karen", estates: ["Karen", "Hardy", "Bogani"] },
          { name: "Nairobi West", estates: ["Nairobi West", "South C"] },
          { name: "Mugumo-ini", estates: ["Langata", "Otiende"] },
          { name: "South C", estates: ["South C", "Madaraka"] },
          { name: "Nyayo Highrise", estates: ["Nyayo Highrise"] },
        ],
      },
      {
        name: "Kibra",
        wards: [
          { name: "Woodley/Kenyatta Golf Course", estates: ["Woodley", "Jamhuri"] },
          { name: "Sarangombe", estates: ["Olympic", "Kibera"] },
          { name: "Laini Saba", estates: ["Kibera"] },
          { name: "Lindi", estates: ["Kibera"] },
          { name: "Makina", estates: ["Kibera"] },
        ],
      },
      {
        name: "Roysambu",
        wards: [
          { name: "Githurai", estates: ["Githurai 44", "Githurai 45"] },
          { name: "Kahawa West", estates: ["Kahawa West", "Kahawa Wendani"] },
          { name: "Zimmerman", estates: ["Zimmerman", "Roysambu"] },
          { name: "Roysambu", estates: ["Roysambu", "Garden Estate", "Mirema"] },
          { name: "Kahawa", estates: ["Kahawa Sukari", "Kahawa Barracks"] },
        ],
      },
      {
        name: "Kasarani",
        wards: [
          { name: "Clay City", estates: ["Clay City", "Kasarani"] },
          { name: "Mwiki", estates: ["Mwiki", "Kasarani"] },
          { name: "Kasarani", estates: ["Kasarani", "Seasons"] },
          { name: "Njiru", estates: ["Njiru", "Ruai"] },
          { name: "Ruai", estates: ["Ruai", "Kamulu"] },
        ],
      },
      {
        name: "Starehe",
        wards: [
          { name: "Nairobi Central", estates: ["CBD", "City Centre"] },
          { name: "Ngara", estates: ["Ngara", "Pangani"] },
          { name: "Ziwani/Kariokor", estates: ["Ziwani", "Kariokor"] },
          { name: "Landimawe", estates: ["Landimawe"] },
          { name: "Nairobi South", estates: ["Industrial Area", "South B"] },
        ],
      },
      {
        name: "Makadara",
        wards: [
          { name: "Maringo/Hamza", estates: ["Maringo", "South B", "Hamza"] },
          { name: "Viwandani", estates: ["Industrial Area"] },
          { name: "Harambee", estates: ["Harambee", "Jericho"] },
          { name: "Makongeni", estates: ["Makongeni", "Bahati"] },
        ],
      },
      {
        name: "Embakasi South",
        wards: [
          { name: "Imara Daima", estates: ["Imara Daima", "Pipeline"] },
          { name: "Kwa Njenga", estates: ["Kwa Njenga", "Mukuru"] },
          { name: "Kwa Reuben", estates: ["Kwa Reuben"] },
          { name: "Pipeline", estates: ["Pipeline", "Fedha"] },
          { name: "Kware", estates: ["Kware"] },
        ],
      },
      {
        name: "Ruaraka",
        wards: [
          { name: "Babadogo", estates: ["Baba Dogo"] },
          { name: "Utalii", estates: ["Utalii", "Mathare North"] },
          { name: "Mathare North", estates: ["Mathare North", "Huruma"] },
          { name: "Lucky Summer", estates: ["Lucky Summer"] },
          { name: "Korogocho", estates: ["Korogocho"] },
        ],
      },
    ],
  },
  {
    name: "Mombasa",
    estates: ["Nyali", "Bamburi", "Shanzu", "Kizingo", "Tudor", "Likoni", "Changamwe", "Kisauni", "Mvita", "Jomvu"],
    subcounties: [
      { name: "Nyali", wards: [{ name: "Nyali", estates: ["Nyali", "Mkomani"] }, { name: "Frere Town", estates: ["Frere Town"] }, { name: "Ziwa la Ng'ombe", estates: ["Ziwa la Ng'ombe"] }, { name: "Mkomani", estates: ["Mkomani", "Ratna Square"] }, { name: "Kongowea", estates: ["Kongowea", "Bamburi"] }] },
      { name: "Kisauni", wards: [{ name: "Mjambere", estates: ["Bamburi", "Mtopanga"] }, { name: "Junda", estates: ["Junda"] }, { name: "Bamburi", estates: ["Bamburi", "Shanzu"] }, { name: "Mwakirunge", estates: ["Mwakirunge"] }, { name: "Mtopanga", estates: ["Mtopanga"] }, { name: "Magogoni", estates: ["Magogoni"] }] },
      { name: "Mvita", wards: [{ name: "Mji wa Kale/Makadara", estates: ["Old Town", "Makadara"] }, { name: "Tudor", estates: ["Tudor"] }, { name: "Tononoka", estates: ["Tononoka"] }, { name: "Shimanzi/Ganjoni", estates: ["Shimanzi", "Ganjoni", "Kizingo"] }, { name: "Majengo", estates: ["Majengo"] }] },
      { name: "Likoni", wards: [{ name: "Likoni", estates: ["Likoni"] }, { name: "Timbwani", estates: ["Timbwani", "Shelly Beach"] }, { name: "Mtongwe", estates: ["Mtongwe"] }, { name: "Bofu", estates: ["Bofu"] }, { name: "Shika Adabu", estates: ["Shika Adabu"] }] },
      { name: "Changamwe", wards: [{ name: "Port Reitz", estates: ["Port Reitz"] }, { name: "Kipevu", estates: ["Kipevu"] }, { name: "Airport", estates: ["Airport"] }, { name: "Changamwe", estates: ["Changamwe"] }, { name: "Chaani", estates: ["Chaani"] }] },
      { name: "Jomvu", wards: [{ name: "Jomvu Kuu", estates: ["Jomvu"] }, { name: "Miritini", estates: ["Miritini"] }, { name: "Mikindani", estates: ["Mikindani"] }] },
    ],
  },
  { name: "Kisumu", estates: ["Milimani", "Tom Mboya", "Kondele", "Mamboleo", "Nyalenda", "Lolwe"], subcounties: [{ name: "Kisumu Central", wards: [{ name: "Milimani", estates: ["Milimani"] }, { name: "Kondele", estates: ["Kondele", "Nyalenda"] }, { name: "Railways", estates: ["Tom Mboya", "Lolwe"] }] }, { name: "Kisumu East", wards: [{ name: "Kajulu", estates: ["Kajulu"] }, { name: "Kolwa East", estates: ["Mamboleo", "Nyamasaria"] }] }] },
  { name: "Nakuru", estates: ["Milimani", "Section 58", "London", "Shabab", "Naka", "Lanet"], subcounties: [{ name: "Nakuru Town East", wards: [{ name: "Biashara", estates: ["Section 58", "Shabab"] }, { name: "Kivumbini", estates: ["London", "Flamingo"] }] }, { name: "Nakuru Town West", wards: [{ name: "Kaptembwo", estates: ["Kaptembwo"] }, { name: "Rhonda", estates: ["Milimani", "Naka"] }] }] },
  { name: "Kiambu", estates: ["Thika", "Juja", "Ruiru", "Kikuyu", "Limuru", "Kiambu Town", "Banana", "Ruaka", "Two Rivers"], subcounties: [{ name: "Ruiru", wards: [{ name: "Ruiru", estates: ["Ruiru", "Membley", "Kamakis"] }] }, { name: "Juja", wards: [{ name: "Juja", estates: ["Juja", "JKUAT"] }] }, { name: "Kiambaa", wards: [{ name: "Ndenderu", estates: ["Ruaka", "Two Rivers", "Banana"] }] }, { name: "Kikuyu", wards: [{ name: "Kikuyu", estates: ["Kikuyu", "Ondiri"] }] }] },
  { name: "Machakos", estates: ["Syokimau", "Athi River", "Mlolongo", "Kitengela", "Gateway"], subcounties: [{ name: "Athi River", wards: [{ name: "Athi River", estates: ["Athi River", "Syokimau", "Mlolongo", "Gateway"] }] }] },
  { name: "Kajiado", estates: ["Kitengela", "Ongata Rongai", "Ngong", "Kiserian", "Magadi"], subcounties: [{ name: "Kajiado North", wards: [{ name: "Ongata Rongai", estates: ["Ongata Rongai", "Rimpa"] }, { name: "Ngong", estates: ["Ngong", "Matasia"] }] }, { name: "Kajiado East", wards: [{ name: "Kitengela", estates: ["Kitengela", "Yukos", "EPZ"] }, { name: "Kiserian", estates: ["Kiserian"] }] }] },
  { name: "Uasin Gishu", estates: ["Eldoret Town", "Langas", "Kapseret", "Pioneer"], subcounties: [{ name: "Ainabkoi", wards: [{ name: "Ainabkoi", estates: ["Pioneer", "Langas"] }] }, { name: "Kapseret", wards: [{ name: "Kapseret", estates: ["Kapseret", "Eldoret Town"] }] }] },
  { name: "Nyeri", estates: ["Nyeri Town", "Karatina", "Othaya"], subcounties: [{ name: "Nyeri Town", wards: [{ name: "Rware", estates: ["Nyeri Town"] }] }] },
  { name: "Kilifi", estates: ["Malindi", "Watamu", "Kilifi Town", "Mtwapa"], subcounties: [{ name: "Kilifi North", wards: [{ name: "Mtwapa", estates: ["Mtwapa"] }, { name: "Kilifi", estates: ["Kilifi Town"] }] }, { name: "Malindi", wards: [{ name: "Malindi", estates: ["Malindi", "Watamu"] }] }] },
  { name: "Kwale", estates: ["Diani", "Ukunda", "Msambweni"], subcounties: [{ name: "Msambweni", wards: [{ name: "Diani", estates: ["Diani", "Ukunda"] }] }] },
  { name: "Laikipia", estates: ["Nanyuki", "Naro Moru", "Rumuruti"], subcounties: [{ name: "Laikipia East", wards: [{ name: "Nanyuki", estates: ["Nanyuki"] }] }] },
  { name: "Nyandarua", estates: ["Ol Kalou", "Engineer", "Nyahururu"], subcounties: [] },
  { name: "Murang'a", estates: ["Murang'a Town", "Kenol", "Maragua"], subcounties: [] },
  { name: "Embu", estates: ["Embu Town", "Runyenjes"], subcounties: [] },
  { name: "Meru", estates: ["Meru Town", "Nkubu", "Maua"], subcounties: [] },
  { name: "Trans Nzoia", estates: ["Kitale", "Endebess"], subcounties: [] },
  { name: "Bungoma", estates: ["Bungoma Town", "Webuye"], subcounties: [] },
  { name: "Kakamega", estates: ["Kakamega Town", "Mumias"], subcounties: [] },
  { name: "Siaya", estates: ["Siaya Town", "Bondo"], subcounties: [] },
  { name: "Migori", estates: ["Migori Town", "Rongo"], subcounties: [] },
  { name: "Homa Bay", estates: ["Homa Bay Town", "Oyugis"], subcounties: [] },
  { name: "Kericho", estates: ["Kericho Town", "Litein"], subcounties: [] },
  { name: "Bomet", estates: ["Bomet Town", "Sotik"], subcounties: [] },
  { name: "Narok", estates: ["Narok Town", "Maasai Mara"], subcounties: [] },
  { name: "Nandi", estates: ["Kapsabet", "Nandi Hills"], subcounties: [] },
  { name: "Baringo", estates: ["Kabarnet", "Eldama Ravine"], subcounties: [] },
  { name: "Elgeyo-Marakwet", estates: ["Iten", "Kapsowar"], subcounties: [] },
  { name: "West Pokot", estates: ["Kapenguria"], subcounties: [] },
  { name: "Turkana", estates: ["Lodwar", "Kakuma"], subcounties: [] },
  { name: "Samburu", estates: ["Maralal"], subcounties: [] },
  { name: "Marsabit", estates: ["Marsabit Town", "Moyale"], subcounties: [] },
  { name: "Isiolo", estates: ["Isiolo Town"], subcounties: [] },
  { name: "Tharaka-Nithi", estates: ["Chuka", "Marimanti"], subcounties: [] },
  { name: "Kitui", estates: ["Kitui Town", "Mwingi"], subcounties: [] },
  { name: "Makueni", estates: ["Wote", "Sultan Hamud"], subcounties: [] },
  { name: "Taita-Taveta", estates: ["Voi", "Taveta", "Wundanyi"], subcounties: [] },
  { name: "Tana River", estates: ["Hola", "Garsen"], subcounties: [] },
  { name: "Lamu", estates: ["Lamu Town", "Mpeketoni"], subcounties: [] },
  { name: "Garissa", estates: ["Garissa Town"], subcounties: [] },
  { name: "Wajir", estates: ["Wajir Town"], subcounties: [] },
  { name: "Mandera", estates: ["Mandera Town"], subcounties: [] },
  { name: "Nyamira", estates: ["Nyamira Town"], subcounties: [] },
  { name: "Kisii", estates: ["Kisii Town", "Ogembo"], subcounties: [] },
  { name: "Vihiga", estates: ["Mbale"], subcounties: [] },
  { name: "Busia", estates: ["Busia Town", "Malaba"], subcounties: [] },
  { name: "Kirinyaga", estates: ["Kerugoya", "Kutus", "Sagana"], subcounties: [] },
];

export const landmarks = [
  "Yaya Centre", "Junction Mall", "Sarit Centre", "Westgate", "The Hub Karen",
  "Garden City Mall", "Two Rivers Mall", "Village Market", "Capital Centre",
  "Prestige Plaza", "T-Mall", "Galleria", "TRM", "JKIA",
  "Kenyatta University", "USIU", "UoN", "JKUAT", "Strathmore",
  "Nairobi Hospital", "Aga Khan Hospital", "Mater Hospital", "MP Shah",
  "Nairobi National Park", "Uhuru Gardens", "Karura Forest",
  "City Mall Nyali", "Nyali Beach", "Diani Beach", "Mombasa Marine Park",
  "Kisumu Airport", "Lake Victoria", "Nakuru National Park",
];
