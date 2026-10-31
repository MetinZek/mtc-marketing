import type { RoomKind, OutdoorKind, UnitType } from "./data/plans";
import type { Status } from "./data/inventory";

/**
 * The site's copy, in Albanian (the default, at /troy) and English (at
 * /troy/en). Facts about the project come from Troy's own page and films:
 * three towers in central Mitrovica, the Ibar river and mountain views, over
 * 30,000 m² of structural works by March 2024, the construction stages, the
 * address and contacts. In headings, *asterisks* mark the key words, set
 * bold (see Rich).
 */

export type Lang = "sq" | "en";

type Availability = { available: number; reserved: number };

export const CONTACT = {
  phone: "+383 44 222 282",
  phoneHref: "tel:+38344222282",
  whatsapp: "38344222282",
  email: "info@troyresidence.com",
  maps: "https://maps.google.com/maps?q=42.89380916%2C20.87273598&hl=en",
  lat: 42.89380916,
  lon: 20.87273598,
} as const;

export const whatsappUrl = (text: string) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;

const sq = {
  meta: {
    title: "Troy Residence | Kryevepra e Qytetit",
    description:
      "Tri kulla banimi në qendër të Mitrovicës. Zgjidhni bllokun, katin dhe banesën tuaj në modelin interaktiv.",
  },
  nav: {
    homes: "Banesat",
    project: "Projekti",
    gallery: "Galeria",
    construction: "Ndërtimi",
    location: "Lokacioni",
    contact: "Kontakti",
    cta: "Na kontaktoni",
    skip: "Kalo te përmbajtja",
    menu: "Menyja",
  },
  hero: {
    eyebrow: "Troy Residence",
    title: "*Kryevepra* e Qytetit",
    leadStrong: "Tri kulla banimi në qendër të Mitrovicës.",
    lead: "Zgjidhni bllokun, katin dhe banesën tuaj.",
    cta: "Zgjidhni banesën",
    scroll: "Lëvizni poshtë",
  },
  pick: {
    eyebrow: "Banesat",
    title: "Zgjidhni *bllokun*",
    hint: "Klikoni mbi një kullë për të parë katet.",
    nudge: "Zgjidhni një bllok",
  },
  block: (id: string) => `Blloku ${id}`,
  floors: (n: number) => `${n} kate`,
  floorName: (n: number, top: boolean) => (top ? "Penthouse" : `Kati ${n}`),
  floorWord: "Kati",
  homes: (n: number) => (n === 1 ? "1 banesë" : `${n} banesa`),
  available: (c: Availability) =>
    c.available === 1 ? "1 e lirë" : c.available > 0 ? `${c.available} të lira` : c.reserved > 0 ? "Asnjë e lirë" : "Të shitura",
  explorer: {
    label: "Modeli interaktiv i Troy Residence",
    allBlocks: "Të gjitha blloqet",
    chooseFloor: "Zgjidhni katin",
    chooseFloorHint: "Kaloni mbi fasadë ose zgjidhni nga lista.",
    stepInside: "Hyni brenda",
    chooseHome: "Zgjidhni banesën",
    chooseHomeHint: "Klikoni një banesë në model ose në listë.",
    floorAbove: "Kati sipër",
    floorBelow: "Kati poshtë",
    dragHint: "Tërhiqni për ta rrotulluar",
    loading: "Po ngarkohet modeli…",
    view: "Pamja",
    back: "Kthehu",
    ground: "Përdhesa · lokale afariste",
    prevHome: "Banesa e mëparshme",
    nextHome: "Banesa tjetër",
    front: "Fasada kryesore",
  },
  status: { available: "E lirë", reserved: "E rezervuar", sold: "E shitur" } satisfies Record<Status, string>,
  unit: {
    word: "Banesa",
    type: (t: UnitType) => (t === "PH" ? "Penthouse 3+1" : t),
    net: "Sipërfaqja neto",
    balcony: "Ballkoni",
    terrace: "Tarraca",
    total: "Gjithsej",
    bedrooms: "Dhoma gjumi",
    bathrooms: "Banjo",
    price: "Çmimi",
    priceValue: "Sipas kërkesës",
    rooms: "Hapësirat",
    plan: "Planimetria",
    illustrative: "Planimetri ilustruese",
    whatsapp: "Pyetni në WhatsApp",
    call: "Telefononi",
    offer: "Kërkoni ofertë",
    sold: "Kjo banesë është shitur. Shikoni banesat e lira në këtë kat, ose na kontaktoni për banesa të ngjashme.",
    reserved: "Kjo banesë është e rezervuar. Na kontaktoni për t'u futur në listën e pritjes.",
    message: (code: string, type: string, area: string) =>
      `Përshëndetje! Dëshiroj më shumë informata për banesën ${code} (${type}, ${area} m²) në Troy Residence.`,
  },
  room: {
    living: "Dhoma e ndenjes",
    kitchen: "Kuzhina",
    bedroom: "Dhoma e gjumit",
    master: "Dhoma kryesore",
    bath: "Banjo",
    hall: "Hyrja",
    passage: "Korridori",
    balcony: "Ballkoni",
    terrace: "Tarraca",
  } satisfies Record<RoomKind | OutdoorKind | "master", string>,
  roomShort: {
    living: "D. ndenjes",
    kitchen: "Kuzhina",
    bedroom: "D. gjumit",
    master: "D. kryesore",
    bath: "Banjo",
    hall: "Hyrja",
    passage: "Korridori",
    balcony: "Ballkoni",
    terrace: "Tarraca",
  } satisfies Record<RoomKind | OutdoorKind | "master", string>,
  story: {
    eyebrow: "Projekti",
    title: "Tri *kulla*. Një *adresë*.",
    river: "Kullat e Troy Residence përtej lumit, në renderin 3D",
    statement:
      "*Troy Residence* sjell në qendër të Mitrovicës *tri kulla banimi* me ballkone të gjelbra, pamje nga *lumi Ibër* dhe malet përreth, të ndërtuara me shpejtësi, siguri dhe profesionalizëm.",
    chapters: [
      { title: "*Ballkone* të gjelbra", text: "Bimësi në çdo kat dhe drurë në tarraca: kullat marrin frymë bashkë me qytetin." },
      { title: "*Penthouse* me tarraca", text: "Në majë të blloqeve A dhe C, penthouse me tarraca private dhe pamje nga i gjithë qyteti." },
      { title: "*Lokale* në përdhesë", text: "Kati përdhesë hapet nga rruga me lokale afariste, nën pemë dhe gjelbërim." },
    ],
  },
  gallery: {
    eyebrow: "Galeria",
    title: "Hapësira për *jetën tuaj*",
    items: [
      { src: "garden", alt: "Kopshti me kënd lojërash dhe kalin e Trojës", caption: "Kopsht me kënd lojërash" },
      { src: "interior", alt: "Dhoma e ndenjes me dritare deri në tavan", caption: "Dritare të mëdha, dritë natyrale" },
      { src: "morning", alt: "Një vajzë zgjohet në një dhomë plot dritë", caption: "Mëngjese plot dritë" },
      { src: "family", alt: "Fëmijët dalin me vrap nga shtëpia", caption: "Hapësirë për familjen" },
      { src: "evening", alt: "Kafe në mbrëmje, me dritat e qytetit pas xhamit", caption: "Mbrëmje me pamje nga qyteti" },
    ],
  },
  construction: {
    eyebrow: "Ndërtimi",
    title: "Ndërtimi ecën me *hapa të shpejtë*",
    lead: "Nga themelet deri në majë: punimet në Troy Residence, hap pas hapi.",
    steps: [
      { src: "build-1", title: "Gërmimi dhe mbushja" },
      { src: "build-2", title: "Rrafshimi dhe ngjeshja e tamponit" },
      { src: "build-3", title: "Shtresa e parë e betonit të varfër" },
      { src: "build-4", title: "Izolimi i themelpllakës së Kullës A" },
    ],
  },
  numbers: [
    { value: "3", label: "blloqe banimi" },
    { value: "32", label: "kate banimi" },
    { value: "30 000+", label: "m² punime të vrazhda deri në mars 2024" },
  ],
  location: {
    eyebrow: "Lokacioni",
    title: "Në zemër të *Mitrovicës*",
    photo: "Kullat e Troy Residence përtej lumit",
    text: "Troy Residence ngrihet në rrugën Agim Ramadani, në Katana, në qendër të qytetit, me pamje nga lumi Ibër dhe malet përreth.",
    address: ["Rr. Agim Ramadani – Katana", "Mitrovicë 40000, Kosovë"],
    maps: "Hapni në Google Maps",
    mapTitle: "Harta e lokacionit të Troy Residence",
  },
  contact: {
    eyebrow: "Kontakti",
    title: "Le ta gjejmë *banesën tuaj*.",
    lead: "Na shkruani ose na telefononi. Ekipi i shitjes përgjigjet në telefon, Viber dhe WhatsApp.",
    name: "Emri dhe mbiemri",
    phone: "Telefoni",
    unit: "Banesa që ju intereson",
    unitPlaceholder: "p.sh. A-702",
    message: "Mesazhi",
    messagePlaceholder: "Kur ju përshtatet një takim?",
    submit: "Dërgo në WhatsApp",
    or: "ose",
    email: "dërgoni email",
    note: "Mesazhi hapet në WhatsApp, gati për t'u dërguar. Kjo faqe nuk ruan asnjë të dhënë.",
    hello: "Përshëndetje Troy Residence!",
    phoneLabel: "Telefon · Viber · WhatsApp",
    emailLabel: "Email",
    addressLabel: "Adresa",
    unitLine: (code: string) => `Banesa: ${code}`,
    nameLine: (name: string) => `Emri: ${name}`,
    phoneLine: (phone: string) => `Telefoni: ${phone}`,
  },
  footer: {
    rights: "© 2026 Troy Construction L.L.C.",
    concept: "Koncept prezantimi. Planimetritë, sipërfaqet dhe statuset e banesave janë ilustruese.",
    credit: "Dizajn dhe zhvillim: MTC",
    top: "Kthehu lart",
  },
};

export type Dict = typeof sq;

const en: Dict = {
  meta: {
    title: "Troy Residence | The masterpiece of the city",
    description: "Three residential towers in the centre of Mitrovica. Choose your block, floor and home in the interactive model.",
  },
  nav: {
    homes: "Residences",
    project: "Project",
    gallery: "Gallery",
    construction: "Construction",
    location: "Location",
    contact: "Contact",
    cta: "Contact us",
    skip: "Skip to content",
    menu: "Menu",
  },
  hero: {
    eyebrow: "Troy Residence",
    title: "The *masterpiece* of the city",
    leadStrong: "Three residential towers in the heart of Mitrovica.",
    lead: "Choose your block, your floor and your home.",
    cta: "Find your home",
    scroll: "Scroll",
  },
  pick: {
    eyebrow: "Residences",
    title: "Choose a *block*",
    hint: "Click a tower to see its floors.",
    nudge: "Choose a block",
  },
  block: (id: string) => `Block ${id}`,
  floors: (n: number) => `${n} floors`,
  floorName: (n: number, top: boolean) => (top ? "Penthouse" : `Floor ${n}`),
  floorWord: "Floor",
  homes: (n: number) => (n === 1 ? "1 residence" : `${n} residences`),
  available: (c: Availability) => (c.available > 0 ? `${c.available} available` : c.reserved > 0 ? "None available" : "Sold out"),
  explorer: {
    label: "Troy Residence interactive model",
    allBlocks: "All blocks",
    chooseFloor: "Choose a floor",
    chooseFloorHint: "Hover the facade or pick from the list.",
    stepInside: "Step inside",
    chooseHome: "Choose a residence",
    chooseHomeHint: "Click a residence in the model or the list.",
    floorAbove: "Floor above",
    floorBelow: "Floor below",
    dragHint: "Drag to rotate",
    loading: "Loading the model…",
    view: "View",
    back: "Back",
    ground: "Ground floor · shops",
    prevHome: "Previous residence",
    nextHome: "Next residence",
    front: "Main facade",
  },
  status: { available: "Available", reserved: "Reserved", sold: "Sold" },
  unit: {
    word: "Residence",
    type: (t: UnitType) => (t === "PH" ? "Penthouse 3+1" : t),
    net: "Net area",
    balcony: "Balcony",
    terrace: "Terrace",
    total: "Total",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    price: "Price",
    priceValue: "On request",
    rooms: "Rooms",
    plan: "Floor plan",
    illustrative: "Illustrative plan",
    whatsapp: "Ask on WhatsApp",
    call: "Call",
    offer: "Request an offer",
    sold: "This residence has been sold. See the available ones on this floor, or contact us about similar homes.",
    reserved: "This residence is reserved. Contact us to join the waiting list.",
    message: (code: string, type: string, area: string) =>
      `Hello! I would like more information about residence ${code} (${type}, ${area} m²) at Troy Residence.`,
  },
  room: {
    living: "Living room",
    kitchen: "Kitchen",
    bedroom: "Bedroom",
    master: "Main bedroom",
    bath: "Bathroom",
    hall: "Entrance",
    passage: "Hallway",
    balcony: "Balcony",
    terrace: "Terrace",
  },
  roomShort: {
    living: "Living",
    kitchen: "Kitchen",
    bedroom: "Bedroom",
    master: "Main bed",
    bath: "Bath",
    hall: "Entry",
    passage: "Hall",
    balcony: "Balcony",
    terrace: "Terrace",
  },
  story: {
    eyebrow: "The project",
    title: "Three *towers*. One *address*.",
    river: "The Troy Residence towers across the river, in the 3D render",
    statement:
      "*Troy Residence* brings *three residential towers* to the centre of Mitrovica, with green balconies and views of the *Ibar river* and the surrounding mountains, built with speed, safety and professionalism.",
    chapters: [
      { title: "*Green* balconies", text: "Planting on every floor and trees on the terraces: the towers breathe with the city." },
      { title: "*Penthouses* with terraces", text: "Crowning blocks A and C, penthouses with private terraces and views across the whole city." },
      { title: "*Shops* at street level", text: "The ground floor opens onto the street with shops, under trees and greenery." },
    ],
  },
  gallery: {
    eyebrow: "Gallery",
    title: "Room for *your life*",
    items: [
      { src: "garden", alt: "The garden with a playground and the Trojan horse", caption: "A garden with a playground" },
      { src: "interior", alt: "A living room with floor-to-ceiling windows", caption: "Large windows, natural light" },
      { src: "morning", alt: "A girl wakes up in a bright room", caption: "Mornings full of light" },
      { src: "family", alt: "Children running out of the home", caption: "Room for the family" },
      { src: "evening", alt: "Coffee in the evening, the city lights behind the glass", caption: "Evenings with a city view" },
    ],
  },
  construction: {
    eyebrow: "Construction",
    title: "Building at a *fast pace*",
    lead: "From the foundations up: the works at Troy Residence, step by step.",
    steps: [
      { src: "build-1", title: "Excavation and backfill" },
      { src: "build-2", title: "Levelling and compacting the base" },
      { src: "build-3", title: "First layer of lean concrete" },
      { src: "build-4", title: "Waterproofing Tower A's foundation slab" },
    ],
  },
  numbers: [
    { value: "3", label: "residential blocks" },
    { value: "32", label: "residential floors" },
    { value: "30,000+", label: "m² of structural works by March 2024" },
  ],
  location: {
    eyebrow: "Location",
    title: "In the heart of *Mitrovica*",
    photo: "The Troy Residence towers across the river",
    text: "Troy Residence rises on Agim Ramadani street in Katana, in the city centre, with views of the Ibar river and the surrounding mountains.",
    address: ["Rr. Agim Ramadani – Katana", "Mitrovica 40000, Kosovo"],
    maps: "Open in Google Maps",
    mapTitle: "Map of the Troy Residence location",
  },
  contact: {
    eyebrow: "Contact",
    title: "Let's find *your home*.",
    lead: "Write or call us. The sales team answers by phone, Viber and WhatsApp.",
    name: "Full name",
    phone: "Phone",
    unit: "Residence of interest",
    unitPlaceholder: "e.g. A-702",
    message: "Message",
    messagePlaceholder: "When would suit you for a visit?",
    submit: "Send on WhatsApp",
    or: "or",
    email: "send an email",
    note: "The message opens in WhatsApp, ready to send. This page stores nothing.",
    hello: "Hello Troy Residence!",
    phoneLabel: "Phone · Viber · WhatsApp",
    emailLabel: "Email",
    addressLabel: "Address",
    unitLine: (code: string) => `Residence: ${code}`,
    nameLine: (name: string) => `Name: ${name}`,
    phoneLine: (phone: string) => `Phone: ${phone}`,
  },
  footer: {
    rights: "© 2026 Troy Construction L.L.C.",
    concept: "Presentation concept. Floor plans, areas and availability are illustrative.",
    credit: "Design and development: MTC",
    top: "Back to top",
  },
};

export const DICTS: Record<Lang, Dict> = { sq, en };

/** One decimal, with a decimal comma in Albanian ("64,6"). By hand: some
 * browsers ship without Albanian number data. */
export function formatArea(value: number, lang: Lang): string {
  const s = value.toFixed(1);
  return lang === "sq" ? s.replace(".", ",") : s;
}

export const HOME_PATH: Record<Lang, string> = { sq: "/troy", en: "/troy/en" };
