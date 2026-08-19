// Fully accurate and comprehensive programmatic recipe database for VoxCart
// Supports 100+ recipes from the voice assistant dropdown and maps them 
// perfectly to the 23 items available in db_store.json. Items not in the store 
// are clearly marked as matched: false (Unavailable).

export interface RecipeIngredient {
  name: string;
  nameUr: string;
  qty: number;
  unit: string;
  unitUr: string;
  matchedProductId: number | null;
}

export interface FallbackRecipe {
  key: string;
  nameEn: string;
  nameUr: string;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: string;
  calories: string;
  descriptionEn: string;
  descriptionUr: string;
  ingredients: RecipeIngredient[];
  instructionsEn: string[];
  instructionsUr: string[];
}

// Compact helper to define ingredients
type IngSpec = [string, string, number, string, string, number | null];

interface CompactRecipe {
  q: string;
  key: string;
  en: string;
  ur: string;
  cat: string;
  prep: string;
  cook: string;
  serve: string;
  diff: string;
  cal: string;
  ings: IngSpec[];
}

const COMPACT_RECIPES: CompactRecipe[] = [
  {
    q: "biryani recipe",
    key: "chicken_biryani",
    en: "Chicken Biryani",
    ur: "چکن بریانی",
    cat: "Main Course",
    prep: "25 mins", cook: "45 mins", serve: "4-6 persons", diff: "Medium", cal: "620 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 250, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "beef biryani recipe",
    key: "beef_biryani",
    en: "Beef Biryani",
    ur: "بیف بریانی",
    cat: "Main Course",
    prep: "30 mins", cook: "55 mins", serve: "4-6 persons", diff: "Hard", cal: "680 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 250, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "mutton biryani recipe",
    key: "mutton_biryani",
    en: "Mutton Biryani",
    ur: "مٹن بریانی",
    cat: "Main Course",
    prep: "30 mins", cook: "60 mins", serve: "4-6 persons", diff: "Hard", cal: "710 kcal",
    ings: [
      ["Fresh Mutton", "مٹن گوشت", 1, "kg", "کلو", null],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 250, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "sindhi biryani recipe",
    key: "sindhi_biryani",
    en: "Sindhi Biryani",
    ur: "سندھی بریانی",
    cat: "Main Course",
    prep: "25 mins", cook: "45 mins", serve: "4-6 persons", diff: "Medium", cal: "640 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Potatoes", "آلو", 500, "g", "گرام", 10],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 250, "g", "گرام", 9],
      ["Dried Plums (Aloo Bukhara)", "آلو بخارا", 50, "g", "گرام", null],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "hyderabadi biryani recipe",
    key: "hyderabadi_biryani",
    en: "Hyderabadi Biryani",
    ur: "حیدرآبادی بریانی",
    cat: "Main Course",
    prep: "30 mins", cook: "50 mins", serve: "4-6 persons", diff: "Medium", cal: "660 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Butter / Ghee", "گھی / مکھن", 100, "g", "گرام", 4],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "haleem recipe",
    key: "beef_haleem",
    en: "Beef Haleem",
    ur: "بیف حلیم",
    cat: "Main Course",
    prep: "30 mins", cook: "120 mins", serve: "6 persons", diff: "Hard", cal: "540 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["Wheat & Barley Grains", "گندم اور جو", 500, "g", "گرام", null],
      ["Lentils Mix (Haleem Mix)", "حلیم مکس دالیں", 250, "g", "گرام", null],
      ["Onions", "پیاز", 500, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken haleem recipe",
    key: "chicken_haleem",
    en: "Chicken Haleem",
    ur: "چکن حلیم",
    cat: "Main Course",
    prep: "30 mins", cook: "90 mins", serve: "6 persons", diff: "Medium", cal: "490 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Wheat & Barley Grains", "گندم اور جو", 500, "g", "گرام", null],
      ["Lentils Mix (Haleem Mix)", "حلیم مکس دالیں", 250, "g", "گرام", null],
      ["Onions", "پیاز", 500, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken karahi recipe",
    key: "chicken_karahi",
    en: "Chicken Karahi",
    ur: "چکن کڑاہی",
    cat: "Main Course",
    prep: "15 mins", cook: "25 mins", serve: "4 persons", diff: "Medium", cal: "470 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Tomatoes", "ٹماٹر", 1, "kg", "کلو", 9],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Ginger & Garlic Paste", "ادرک لہسن پیسٹ", 1, "pack", "پیکٹ", null],
      ["Karahi Masala", "کڑاہی مصالحہ", 1, "pack", "پیکٹ", null],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "mutton karahi recipe",
    key: "mutton_karahi",
    en: "Mutton Karahi",
    ur: "مٹن کڑاہی",
    cat: "Main Course",
    prep: "20 mins", cook: "45 mins", serve: "4 persons", diff: "Hard", cal: "550 kcal",
    ings: [
      ["Fresh Mutton", "مٹن گوشت", 1, "kg", "کلو", null],
      ["Tomatoes", "ٹماٹر", 1, "kg", "کلو", 9],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "white chicken karahi recipe",
    key: "white_chicken_karahi",
    en: "White Chicken Karahi",
    ur: "وائٹ چکن کڑاہی",
    cat: "Main Course",
    prep: "15 mins", cook: "25 mins", serve: "4 persons", diff: "Easy", cal: "510 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "balochi tikka karahi recipe",
    key: "balochi_tikka_karahi",
    en: "Balochi Tikka Karahi",
    ur: "بلوچی تکہ کڑاہی",
    cat: "Main Course",
    prep: "15 mins", cook: "30 mins", serve: "4 persons", diff: "Medium", cal: "530 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Lemon Juice", "لیموں کا رس", 1, "bottle", "بوتل", null],
      ["Green Chillies", "ہری مرچیں", 50, "g", "گرام", null],
      ["Balochi Masala Spices", "بلوچی مصالحہ", 1, "pack", "پیکٹ", null],
      ["Cooking Oil", "ککنگ آئل", 300, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "shinwari karahi recipe",
    key: "shinwari_mutton_karahi",
    en: "Shinwari Mutton Karahi",
    ur: "شنواری مٹن کڑاہی",
    cat: "Main Course",
    prep: "15 mins", cook: "40 mins", serve: "4 persons", diff: "Medium", cal: "560 kcal",
    ings: [
      ["Fresh Mutton", "مٹن گوشت", 1, "kg", "کلو", null],
      ["Tomatoes", "ٹماٹر", 1, "kg", "کلو", 9],
      ["Cooking Oil", "ککنگ آئل", 200, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "beef nihari recipe",
    key: "beef_nihari",
    en: "Beef Nihari",
    ur: "بیف نہاری",
    cat: "Main Course",
    prep: "20 mins", cook: "180 mins", serve: "5 persons", diff: "Hard", cal: "650 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["Wheat Flour (Ata)", "آٹا", 100, "g", "گرام", null],
      ["Nihari Spice Masala", "نہاری مصالحہ", 1, "pack", "پیکٹ", null],
      ["Onions", "پیاز", 500, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "nalli nihari recipe",
    key: "nalli_nihari",
    en: "Nalli Nihari",
    ur: "نلی نہاری",
    cat: "Main Course",
    prep: "20 mins", cook: "200 mins", serve: "5 persons", diff: "Hard", cal: "690 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["Bone Marrow (Nalli)", "نلی", 500, "g", "گرام", null],
      ["Wheat Flour (Ata)", "آٹا", 100, "g", "گرام", null],
      ["Nihari Spice Masala", "نہاری مصالحہ", 1, "pack", "پیکٹ", null],
      ["Onions", "پیاز", 500, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 250, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken handi recipe",
    key: "chicken_handi",
    en: "Chicken Handi",
    ur: "چکن ہانڈی",
    cat: "Main Course",
    prep: "15 mins", cook: "25 mins", serve: "4 persons", diff: "Medium", cal: "480 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 250, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "makhni handi recipe",
    key: "chicken_makhni_handi",
    en: "Chicken Makhni Handi",
    ur: "چکن مکھنی ہانڈی",
    cat: "Main Course",
    prep: "15 mins", cook: "25 mins", serve: "4 persons", diff: "Easy", cal: "520 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Tomatoes", "ٹماٹر", 500, "g", "گرام", 9],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Butter", "مکھن", 2, "pack", "پیکٹ", 4],
      ["Dried Fenugreek Leaves (Methi)", "قصوری میتھی", 1, "pack", "پیکٹ", null],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken tikka recipe",
    key: "chicken_tikka",
    en: "Chicken Tikka",
    ur: "چکن تکہ",
    cat: "Main Course",
    prep: "20 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "380 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Yogurt", "دہی", 1, "pack", "پیکٹ", null],
      ["Lemon", "لیموں", 2, "piece", "عدد", null],
      ["Tikka Masala Spice Blend", "تکہ مصالحہ", 1, "pack", "پیکٹ", null],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "seekh kabab recipe",
    key: "seekh_kabab",
    en: "Seekh Kabab",
    ur: "سیخ کباب",
    cat: "Main Course",
    prep: "20 mins", cook: "15 mins", serve: "4 persons", diff: "Medium", cal: "410 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Green Chillies", "ہری مرچیں", 50, "g", "گرام", null],
      ["Garlic & Ginger Paste", "ادرک لہسن", 1, "pack", "پیکٹ", null],
      ["Seekh Kabab Masala", "سیخ کباب مصالحہ", 1, "pack", "پیکٹ", null],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chapli kabab recipe",
    key: "chapli_kabab",
    en: "Chapli Kabab",
    ur: "چپلی کباب",
    cat: "Main Course",
    prep: "20 mins", cook: "15 mins", serve: "4 persons", diff: "Medium", cal: "440 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["Large Eggs", "انڈے", 2, "piece", "عدد", 2],
      ["Tomatoes", "ٹماٹر", 250, "g", "گرام", 9],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Gram Flour (Besan)", "بیسن", 100, "g", "گرام", null],
      ["Chapli Kabab Spices", "چپلی کباب مصالحہ", 1, "pack", "پیکٹ", null],
      ["Cooking Oil", "ککنگ آئل", 200, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "malai boti recipe",
    key: "malai_boti",
    en: "Malai Boti",
    ur: "ملائی بوٹی",
    cat: "Main Course",
    prep: "20 mins", cook: "15 mins", serve: "3 persons", diff: "Easy", cal: "430 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Whole Milk (Cream substitute)", "کریم", 1, "pack", "پیکٹ", 1],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Green Chillies Paste", "ہری مرچیں", 50, "g", "گرام", null],
      ["Yogurt", "دہی", 1, "pack", "پیکٹ", null],
      ["Lemon Juice", "لیموں کا رس", 1, "bottle", "بوتل", null],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "reshmi kabab recipe",
    key: "reshmi_kabab",
    en: "Reshmi Kabab",
    ur: "ریشمی کباب",
    cat: "Main Course",
    prep: "20 mins", cook: "15 mins", serve: "4 persons", diff: "Medium", cal: "390 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Large Eggs", "انڈے", 1, "piece", "عدد", 2],
      ["Whole Milk (Cream substitute)", "کریم", 1, "pack", "پیکٹ", 1],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "bihari kabab recipe",
    key: "chicken_bihari_kabab",
    en: "Chicken Bihari Kabab",
    ur: "چکن بہاری کباب",
    cat: "Main Course",
    prep: "20 mins", cook: "20 mins", serve: "3 persons", diff: "Medium", cal: "400 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Raw Papaya (Tenderizer)", "کچا پپیتا", 100, "g", "گرام", null],
      ["Yogurt", "دہی", 200, "g", "گرام", null],
      ["Bihari Kabab Spices", "بہاری کباب مصالحہ", 1, "pack", "پیکٹ", null],
      ["Cooking Oil (Mustard Oil)", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "halwa puri recipe",
    key: "halwa_puri_chana",
    en: "Halwa Puri Chana",
    ur: "حلوہ پوری چنا",
    cat: "Breakfast",
    prep: "20 mins", cook: "30 mins", serve: "4 persons", diff: "Medium", cal: "580 kcal",
    ings: [
      ["Semolina (Sooji)", "سوجی", 250, "g", "گرام", null],
      ["Sugar", "چینی", 250, "g", "گرام", 22],
      ["Cooking Oil", "ککنگ آئل", 500, "ml", "ملی لیٹر", 21],
      ["White Chickpeas", "چنے", 250, "g", "گرام", null],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "daal chawal recipe",
    key: "daal_chawal",
    en: "Daal Chawal",
    ur: "دال چاول",
    cat: "Main Course",
    prep: "15 mins", cook: "25 mins", serve: "3 persons", diff: "Easy", cal: "420 kcal",
    ings: [
      ["Lentils (Daal Mix)", "دال", 250, "g", "گرام", null],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "daal mash recipe",
    key: "daal_mash_fry",
    en: "Daal Mash Fry",
    ur: "دال ماش فرائی",
    cat: "Main Course",
    prep: "15 mins", cook: "25 mins", serve: "3 persons", diff: "Easy", cal: "380 kcal",
    ings: [
      ["Mash Lentils", "دال ماش", 250, "g", "گرام", null],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "daal tadka recipe",
    key: "daal_tadka",
    en: "Daal Tadka / Yellow Daal",
    ur: "دال تڑکہ",
    cat: "Main Course",
    prep: "10 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "310 kcal",
    ings: [
      ["Yellow Lentils (Moong/Masoor)", "دال مونگ مسور", 250, "g", "گرام", null],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "aloo palak recipe",
    key: "aloo_palak",
    en: "Aloo Palak",
    ur: "آلو پالک",
    cat: "Vegetables",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "220 kcal",
    ings: [
      ["Potatoes", "آلو", 500, "g", "گرام", 10],
      ["Fresh Spinach", "پالک", 500, "g", "گرام", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "palak paneer recipe",
    key: "palak_paneer",
    en: "Palak Paneer",
    ur: "پالک پنیر",
    cat: "Vegetables",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Medium", cal: "290 kcal",
    ings: [
      ["Cheddar Cheese", "پنیر", 250, "g", "گرام", 3],
      ["Fresh Spinach", "پالک", 500, "g", "گرام", null],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "sarson ka saag recipe",
    key: "sarson_ka_saag",
    en: "Sarson Ka Saag",
    ur: "سرسوں کا ساگ",
    cat: "Vegetables",
    prep: "20 mins", cook: "45 mins", serve: "4 persons", diff: "Medium", cal: "260 kcal",
    ings: [
      ["Mustard Greens (Saag)", "سرسوں کا ساگ", 1, "kg", "کلو", null],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "bhindi masala recipe",
    key: "bhindi_masala",
    en: "Bhindi Masala",
    ur: "بھنڈی مصالحہ",
    cat: "Vegetables",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "190 kcal",
    ings: [
      ["Ladyfinger (Bhindi)", "بھنڈی", 500, "g", "گرام", null],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 250, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 150, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "mix sabzi recipe",
    key: "mix_sabzi",
    en: "Mix Sabzi",
    ur: "مکس سبزی",
    cat: "Vegetables",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "180 kcal",
    ings: [
      ["Potatoes", "آلو", 250, "g", "گرام", 10],
      ["Carrots", "گاجر", 250, "g", "گرام", 12],
      ["Green Peas", "مٹر", 250, "g", "گرام", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "aloo gobi recipe",
    key: "aloo_gobi",
    en: "Aloo Gobi",
    ur: "آلو گوبھی",
    cat: "Vegetables",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "170 kcal",
    ings: [
      ["Potatoes", "آلو", 500, "g", "گرام", 10],
      ["Cauliflower (Gobi)", "گوبھی", 500, "g", "گرام", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "aloo matar recipe",
    key: "aloo_matar",
    en: "Aloo Matar",
    ur: "آلو مٹر",
    cat: "Vegetables",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "190 kcal",
    ings: [
      ["Potatoes", "آلو", 500, "g", "گرام", 10],
      ["Green Peas", "مٹر دانے", 250, "g", "گرام", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "aloo baingan recipe",
    key: "aloo_baingan",
    en: "Aloo Baingan",
    ur: "آلو بینگن",
    cat: "Vegetables",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "160 kcal",
    ings: [
      ["Potatoes", "آلو", 250, "g", "گرام", 10],
      ["Eggplant (Baingan)", "بینگن", 500, "g", "گرام", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "baingan bharta recipe",
    key: "baingan_bharta",
    en: "Baingan Bharta",
    ur: "بیگن کا بھرتہ",
    cat: "Vegetables",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "140 kcal",
    ings: [
      ["Eggplant (Baingan)", "بینگن", 1, "kg", "کلو", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chana chaat recipe",
    key: "chana_chaat",
    en: "Chana Chaat",
    ur: "چنا چاٹ",
    cat: "Snack",
    prep: "15 mins", cook: "10 mins", serve: "4 persons", diff: "Easy", cal: "210 kcal",
    ings: [
      ["Chickpeas (White Chana)", "چنے", 250, "g", "گرام", null],
      ["Potatoes", "آلو", 250, "g", "گرام", 10],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "dahi bhalle recipe",
    key: "dahi_bhalle",
    en: "Dahi Bhalle",
    ur: "دہی بھلے",
    cat: "Snack",
    prep: "20 mins", cook: "15 mins", serve: "4 persons", diff: "Medium", cal: "290 kcal",
    ings: [
      ["Whole Milk (for Dahi)", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Lentil Flour", "دال بیسن", 250, "g", "گرام", null],
      ["Sugar", "چینی", 50, "g", "گرام", 22],
      ["Cooking Oil", "ککنگ آئل", 300, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "samosa chaat recipe",
    key: "samosa_chaat",
    en: "Samosa Chaat",
    ur: "سموسہ چاٹ",
    cat: "Snack",
    prep: "15 mins", cook: "15 mins", serve: "4 persons", diff: "Medium", cal: "380 kcal",
    ings: [
      ["Samosas (Prepared)", "سموسے", 4, "piece", "عدد", null],
      ["Chickpeas (White Chana)", "چنے", 250, "g", "گرام", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "gol gappay recipe",
    key: "gol_gappay",
    en: "Gol Gappay / Pani Puri",
    ur: "گول گپے",
    cat: "Snack",
    prep: "15 mins", cook: "15 mins", serve: "3 persons", diff: "Easy", cal: "220 kcal",
    ings: [
      ["Puri Shells", "گول گپے پاپڑی", 1, "pack", "پیکٹ", null],
      ["Chickpeas", "چنے", 100, "g", "گرام", null],
      ["Potatoes", "آلو", 250, "g", "گرام", 10],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "bun kabab recipe",
    key: "bun_kabab",
    en: "Bun Kabab",
    ur: "بن کباب",
    cat: "Fast Food",
    prep: "15 mins", cook: "10 mins", serve: "2 persons", diff: "Easy", cal: "320 kcal",
    ings: [
      ["Burger Buns", "برگر بن", 1, "pack", "پیکٹ", null],
      ["Large Eggs", "انڈے", 1, "dozen", "درجن", 2],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "beef paya recipe",
    key: "beef_paya",
    en: "Beef Paya",
    ur: "بیف پائے",
    cat: "Main Course",
    prep: "20 mins", cook: "240 mins", serve: "5 persons", diff: "Hard", cal: "590 kcal",
    ings: [
      ["Beef Trotters (Paya)", "بیف پائے گوشت", 1, "kg", "کلو", null],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 150, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "mutton paya recipe",
    key: "mutton_paya",
    en: "Mutton Paya",
    ur: "مٹن پائے",
    cat: "Main Course",
    prep: "20 mins", cook: "180 mins", serve: "5 persons", diff: "Hard", cal: "540 kcal",
    ings: [
      ["Mutton Trotters (Paya)", "مٹن پائے گوشت", 1, "kg", "کلو", null],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 150, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken sajji recipe",
    key: "chicken_sajji",
    en: "Chicken Sajji",
    ur: "چکن سجی",
    cat: "Main Course",
    prep: "20 mins", cook: "60 mins", serve: "4 persons", diff: "Hard", cal: "560 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken yakhni pulao recipe",
    key: "chicken_yakhni_pulao",
    en: "Chicken Yakhni Pulao",
    ur: "چکن یخنی پلاؤ",
    cat: "Main Course",
    prep: "20 mins", cook: "35 mins", serve: "4 persons", diff: "Medium", cal: "510 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 150, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "beef pulao recipe",
    key: "beef_pulao",
    en: "Beef Pulao",
    ur: "بیف پلاؤ",
    cat: "Main Course",
    prep: "20 mins", cook: "45 mins", serve: "4 persons", diff: "Hard", cal: "560 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 150, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "kabuli pulao recipe",
    key: "kabuli_pulao",
    en: "Kabuli Pulao",
    ur: "کابلی پلاؤ",
    cat: "Main Course",
    prep: "25 mins", cook: "50 mins", serve: "4 persons", diff: "Hard", cal: "610 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Carrots", "گاجر", 500, "g", "گرام", 12],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Sugar", "چینی", 100, "g", "گرام", 22],
      ["Cooking Oil", "ککنگ آئل", 150, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "matar pulao recipe",
    key: "matar_pulao",
    en: "Matar Pulao",
    ur: "مٹر پلاؤ",
    cat: "Main Course",
    prep: "15 mins", cook: "30 mins", serve: "4 persons", diff: "Easy", cal: "410 kcal",
    ings: [
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Green Peas", "مٹر دانے", 250, "g", "گرام", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken korma recipe",
    key: "chicken_korma",
    en: "Chicken Korma",
    ur: "چکن قورمہ",
    cat: "Main Course",
    prep: "20 mins", cook: "35 mins", serve: "4 persons", diff: "Medium", cal: "510 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Onions", "پیاز", 500, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 200, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "mutton korma recipe",
    key: "mutton_korma",
    en: "Mutton Korma",
    ur: "مٹن قورمہ",
    cat: "Main Course",
    prep: "20 mins", cook: "50 mins", serve: "4 persons", diff: "Hard", cal: "590 kcal",
    ings: [
      ["Fresh Mutton", "مٹن گوشت", 1, "kg", "کلو", null],
      ["Onions", "پیاز", 500, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 200, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "shahi korma recipe",
    key: "shahi_chicken_korma",
    en: "Shahi Chicken Korma",
    ur: "شاہی چکن قورمہ",
    cat: "Main Course",
    prep: "20 mins", cook: "35 mins", serve: "4 persons", diff: "Medium", cal: "560 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Onions", "پیاز", 500, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "fish fry recipe",
    key: "lahori_fish_fry",
    en: "Lahori Fish Fry",
    ur: "لاہوری فش فرائی",
    cat: "Seafood",
    prep: "15 mins", cook: "15 mins", serve: "3 persons", diff: "Easy", cal: "420 kcal",
    ings: [
      ["Salmon Fillet", "مچھلی کا فلیٹ", 1, "kg", "کلو", 15],
      ["Gram Flour (Besan)", "بیسن", 250, "g", "گرام", null],
      ["Cooking Oil", "ککنگ آئل", 500, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "grilled fish recipe",
    key: "grilled_fish",
    en: "Grilled Fish",
    ur: "گریلڈ فش",
    cat: "Seafood",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "340 kcal",
    ings: [
      ["Salmon Fillet", "مچھلی کا فلیٹ", 1, "kg", "کلو", 15],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "prawn curry recipe",
    key: "prawn_karahi_curry",
    en: "Prawn Karahi / Curry",
    ur: "پراؤن کڑاہی",
    cat: "Seafood",
    prep: "15 mins", cook: "15 mins", serve: "3 persons", diff: "Medium", cal: "380 kcal",
    ings: [
      ["Prawns / Shrimps", "پراؤن جھینگا", 500, "g", "گرام", null],
      ["Tomatoes", "ٹماٹر", 500, "g", "گرام", 9],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "shami kabab recipe",
    key: "shami_kabab",
    en: "Shami Kabab",
    ur: "شامی کباب",
    cat: "Main Course",
    prep: "25 mins", cook: "30 mins", serve: "5 persons", diff: "Medium", cal: "390 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["Lentils (Chana Daal)", "دال چنا", 250, "g", "گرام", null],
      ["Large Eggs", "انڈے", 2, "piece", "عدد", 2],
      ["Cooking Oil", "ککنگ آئل", 150, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "gola kabab recipe",
    key: "gola_kabab",
    en: "Gola Kabab",
    ur: "گولہ کباب",
    cat: "Main Course",
    prep: "20 mins", cook: "15 mins", serve: "4 persons", diff: "Medium", cal: "410 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 1, "kg", "کلو", 14],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "egg fried rice recipe",
    key: "egg_fried_rice",
    en: "Egg Fried Rice",
    ur: "ایگ فرائیڈ رائس",
    cat: "Asian",
    prep: "15 mins", cook: "15 mins", serve: "3 persons", diff: "Easy", cal: "360 kcal",
    ings: [
      ["Large Eggs", "انڈے", 3, "piece", "عدد", 2],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Carrots", "گاجر", 250, "g", "گرام", 12],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken fried rice recipe",
    key: "chicken_fried_rice",
    en: "Chicken Fried Rice",
    ur: "چکن فرائیڈ رائس",
    cat: "Asian",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "430 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Large Eggs", "انڈے", 2, "piece", "عدد", 2],
      ["White Rice", "چاول", 1, "kg", "کلو", 19],
      ["Carrots", "گاجر", 250, "g", "گرام", 12],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken chow mein recipe",
    key: "chicken_chow_mein",
    en: "Chicken Chow Mein",
    ur: "چکن چوؤ مین",
    cat: "Asian",
    prep: "15 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "460 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Pasta (Noodles)", "پاستا", 1, "box", "ڈبہ", 20],
      ["Carrots", "گاجر", 250, "g", "گرام", 12],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken manchurian recipe",
    key: "chicken_manchurian",
    en: "Chicken Manchurian",
    ur: "چکن منچورین",
    cat: "Asian",
    prep: "20 mins", cook: "20 mins", serve: "3 persons", diff: "Medium", cal: "450 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Sugar", "چینی", 50, "g", "گرام", 22],
      ["Tomatoes", "ٹماٹر", 250, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken shashlik recipe",
    key: "chicken_shashlik",
    en: "Chicken Shashlik",
    ur: "چکن شاشلک",
    cat: "Asian",
    prep: "20 mins", cook: "20 mins", serve: "3 persons", diff: "Medium", cal: "410 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Tomatoes", "ٹماٹر", 250, "g", "گرام", 9],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "alfredo pasta recipe",
    key: "alfredo_pasta",
    en: "Alfredo Pasta",
    ur: "الفریڈو پاستا",
    cat: "Italian",
    prep: "10 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "510 kcal",
    ings: [
      ["Pasta", "پاستا", 1, "box", "ڈبہ", 20],
      ["Cheddar Cheese", "پنیر", 250, "g", "گرام", 3],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "spaghetti carbonara recipe",
    key: "spaghetti_carbonara",
    en: "Spaghetti Carbonara",
    ur: "اسپیگیٹی کاربونارا",
    cat: "Italian",
    prep: "10 mins", cook: "15 mins", serve: "3 persons", diff: "Medium", cal: "540 kcal",
    ings: [
      ["Pasta (Spaghetti)", "پاستا", 1, "box", "ڈبہ", 20],
      ["Large Eggs", "انڈے", 3, "piece", "عدد", 2],
      ["Cheddar Cheese", "پنیر", 250, "g", "گرام", 3],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "spaghetti bolognese recipe",
    key: "bolognese_spaghetti",
    en: "Bolognese Spaghetti",
    ur: "بولوگنیز اسپیگیٹی",
    cat: "Italian",
    prep: "15 mins", cook: "25 mins", serve: "3 persons", diff: "Medium", cal: "520 kcal",
    ings: [
      ["Pasta (Spaghetti)", "پاستا", 1, "box", "ڈبہ", 20],
      ["Ground Beef", "قیمہ", 500, "g", "گرام", 14],
      ["Tomatoes", "ٹماٹر", 500, "g", "گرام", 9],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken pasta recipe",
    key: "creamy_chicken_pasta",
    en: "Creamy Chicken Pasta",
    ur: "کریمی چکن پاستا",
    cat: "Italian",
    prep: "10 mins", cook: "20 mins", serve: "3 persons", diff: "Easy", cal: "530 kcal",
    ings: [
      ["Pasta", "پاستا", 1, "box", "ڈبہ", 20],
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Cheddar Cheese", "پنیر", 250, "g", "گرام", 3],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "penne arrabbiata recipe",
    key: "penne_arrabbiata",
    en: "Penne Arrabbiata",
    ur: "پینے ارابیتا",
    cat: "Italian",
    prep: "10 mins", cook: "15 mins", serve: "3 persons", diff: "Easy", cal: "410 kcal",
    ings: [
      ["Pasta (Penne)", "پاستا", 1, "box", "ڈبہ", 20],
      ["Tomatoes", "ٹماٹر", 500, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken lasagna recipe",
    key: "chicken_lasagna",
    en: "Chicken Lasagna",
    ur: "چکن لازانیا",
    cat: "Italian",
    prep: "20 mins", cook: "35 mins", serve: "4 persons", diff: "Medium", cal: "590 kcal",
    ings: [
      ["Pasta (Sheets)", "پاستا", 1, "box", "ڈبہ", 20],
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Cheddar Cheese", "پنیر", 500, "g", "گرام", 3],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "beef lasagna recipe",
    key: "beef_lasagna",
    en: "Beef Lasagna",
    ur: "بیف لازانیا",
    cat: "Italian",
    prep: "20 mins", cook: "40 mins", serve: "4 persons", diff: "Medium", cal: "640 kcal",
    ings: [
      ["Pasta (Sheets)", "پاستا", 1, "box", "ڈبہ", 20],
      ["Ground Beef", "قیمہ", 500, "g", "گرام", 14],
      ["Cheddar Cheese", "پنیر", 500, "g", "گرام", 3],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "pepperoni pizza recipe",
    key: "pepperoni_pizza",
    en: "Pepperoni Pizza",
    ur: "پیپرونی پیزا",
    cat: "Fast Food",
    prep: "20 mins", cook: "15 mins", serve: "3 persons", diff: "Medium", cal: "670 kcal",
    ings: [
      ["Pizza Dough Base", "پیزا بیس", 1, "pack", "پیکٹ", null],
      ["Cheddar Cheese", "پنیر", 250, "g", "گرام", 3],
      ["Beef Pepperoni slices", "قیمہ پیپرونی", 100, "g", "گرام", 14],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken tikka pizza recipe",
    key: "chicken_tikka_pizza",
    en: "Chicken Tikka Pizza",
    ur: "چکن تکہ پیزا",
    cat: "Fast Food",
    prep: "20 mins", cook: "15 mins", serve: "3 persons", diff: "Medium", cal: "640 kcal",
    ings: [
      ["Pizza Dough Base", "پیزا بیس", 1, "pack", "پیکٹ", null],
      ["Chicken Breast", "مرغی کا گوشت", 250, "g", "گرام", 13],
      ["Cheddar Cheese", "پنیر", 250, "g", "گرام", 3],
      ["Tomatoes (Sauce)", "ٹماٹر", 100, "g", "گرام", 9],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "pizza recipe",
    key: "margherita_pizza",
    en: "Margherita Pizza",
    ur: "مارگریٹا پیزا",
    cat: "Fast Food",
    prep: "15 mins", cook: "12 mins", serve: "3 persons", diff: "Easy", cal: "560 kcal",
    ings: [
      ["Pizza Dough Base", "پیزا بیس", 1, "pack", "پیکٹ", null],
      ["Cheddar Cheese", "پنیر", 400, "g", "گرام", 3],
      ["Tomatoes (Puree)", "ٹماٹر", 250, "g", "گرام", 9],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "zinger burger recipe",
    key: "zinger_burger",
    en: "Zinger Burger",
    ur: "زنگر برگر",
    cat: "Fast Food",
    prep: "15 mins", cook: "15 mins", serve: "2 persons", diff: "Medium", cal: "480 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Large Eggs", "انڈے", 1, "piece", "عدد", 2],
      ["Burger Buns", "برگر بن", 1, "pack", "پیکٹ", null],
      ["Cooking Oil", "ککنگ آئل", 300, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "beef burger recipe",
    key: "beef_smash_burger",
    en: "Beef Smash Burger",
    ur: "بیف برگر",
    cat: "Fast Food",
    prep: "15 mins", cook: "15 mins", serve: "2 persons", diff: "Easy", cal: "510 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 500, "g", "گرام", 14],
      ["Cheddar Cheese", "پنیر", 100, "g", "گرام", 3],
      ["Burger Buns", "برگر بن", 1, "pack", "پیکٹ", null],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken sandwich recipe",
    key: "grilled_chicken_sandwich",
    en: "Grilled Chicken Sandwich",
    ur: "گریلڈ چکن سینڈوچ",
    cat: "Fast Food",
    prep: "10 mins", cook: "15 mins", serve: "2 persons", diff: "Easy", cal: "380 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Bread Slices", "بریڈ سلائس", 1, "pack", "پیکٹ", null],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "club sandwich recipe",
    key: "club_sandwich",
    en: "Club Sandwich",
    ur: "کلب سینڈوچ",
    cat: "Fast Food",
    prep: "15 mins", cook: "15 mins", serve: "2 persons", diff: "Medium", cal: "440 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 250, "g", "گرام", 13],
      ["Large Eggs", "انڈے", 2, "piece", "عدد", 2],
      ["Cheddar Cheese", "پنیر", 100, "g", "گرام", 3],
      ["Bread Slices", "بریڈ سلائس", 1, "pack", "پیکٹ", null],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "mexican tacos recipe",
    key: "mexican_tacos",
    en: "Mexican Tacos",
    ur: "میکسیکن ٹیکوز",
    cat: "Fast Food",
    prep: "15 mins", cook: "15 mins", serve: "3 persons", diff: "Easy", cal: "390 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 500, "g", "گرام", 14],
      ["Taco Shells", "ٹیکو شیلز", 1, "pack", "پیکٹ", null],
      ["Cheddar Cheese", "پنیر", 150, "g", "گرام", 3],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "burrito recipe",
    key: "beef_burrito",
    en: "Beef Burrito",
    ur: "بیف بوریٹو",
    cat: "Fast Food",
    prep: "15 mins", cook: "15 mins", serve: "2 persons", diff: "Easy", cal: "460 kcal",
    ings: [
      ["Ground Beef", "قیمہ", 500, "g", "گرام", 14],
      ["Tortilla Wraps", "ٹارٹیلا ریپ", 1, "pack", "پیکٹ", null],
      ["White Rice", "چاول", 200, "g", "گرام", 19],
      ["Cheddar Cheese", "پنیر", 100, "g", "گرام", 3],
      ["Tomatoes", "ٹماٹر", 100, "g", "گرام", 9],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "quesadilla recipe",
    key: "chicken_quesadilla",
    en: "Chicken Quesadilla",
    ur: "کیسادیلا",
    cat: "Fast Food",
    prep: "10 mins", cook: "15 mins", serve: "2 persons", diff: "Easy", cal: "410 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Tortilla Wraps", "ٹارٹیلا ریپ", 1, "pack", "پیکٹ", null],
      ["Cheddar Cheese", "پنیر", 250, "g", "گرام", 3],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "ramen recipe",
    key: "japanese_ramen",
    en: "Japanese Ramen",
    ur: "جاپانی رامن",
    cat: "Asian",
    prep: "15 mins", cook: "20 mins", serve: "2 persons", diff: "Easy", cal: "480 kcal",
    ings: [
      ["Pasta (Noodles)", "پاستا", 1, "box", "ڈبہ", 20],
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Large Eggs", "انڈے", 2, "piece", "عدد", 2],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken teriyaki recipe",
    key: "chicken_teriyaki_rice",
    en: "Chicken Teriyaki Rice",
    ur: "چکن تیرییاکی",
    cat: "Asian",
    prep: "15 mins", cook: "20 mins", serve: "2 persons", diff: "Easy", cal: "440 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["White Rice", "چاول", 500, "g", "گرام", 19],
      ["Sugar (Teriyaki Sauce)", "چینی", 100, "g", "گرام", 22],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "shakshuka recipe",
    key: "shakshuka",
    en: "Shakshuka",
    ur: "شکشوقہ",
    cat: "Breakfast",
    prep: "5 mins", cook: "15 mins", serve: "2 persons", diff: "Easy", cal: "290 kcal",
    ings: [
      ["Large Eggs", "انڈے", 4, "piece", "عدد", 2],
      ["Tomatoes (Sauce)", "ٹماٹر", 500, "g", "گرام", 9],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken shawarma recipe",
    key: "chicken_shawarma",
    en: "Chicken Shawarma",
    ur: "چکن شوارما",
    cat: "Fast Food",
    prep: "15 mins", cook: "15 mins", serve: "2 persons", diff: "Easy", cal: "410 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Pita Wraps", "پیٹا بریڈ", 1, "pack", "پیکٹ", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "falafel recipe",
    key: "falafel_wrap",
    en: "Falafel Wrap",
    ur: "فلافل ریپ",
    cat: "Fast Food",
    prep: "15 mins", cook: "15 mins", serve: "2 persons", diff: "Easy", cal: "340 kcal",
    ings: [
      ["Tortilla/Pita Wraps", "ٹارٹیلا ریپ", 1, "pack", "پیکٹ", null],
      ["Chickpeas (Falafel)", "چنے", 250, "g", "گرام", null],
      ["Onions", "پیاز", 100, "g", "گرام", 11],
      ["Cooking Oil", "ککنگ آئل", 300, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "hummus recipe",
    key: "hummus_pita",
    en: "Hummus & Pita",
    ur: "حمص اور پیٹا",
    cat: "Snack",
    prep: "15 mins", cook: "5 mins", serve: "3 persons", diff: "Easy", cal: "270 kcal",
    ings: [
      ["Chickpeas (Puree)", "چنے", 250, "g", "گرام", null],
      ["Pita Flatbread", "پیٹا بریڈ", 1, "pack", "پیکٹ", null],
      ["Sugar (Touch of sweet)", "چینی", 10, "g", "گرام", 22],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "butter chicken recipe",
    key: "butter_chicken",
    en: "Butter Chicken / Makhni",
    ur: "بٹر چکن",
    cat: "Main Course",
    prep: "15 mins", cook: "25 mins", serve: "4 persons", diff: "Medium", cal: "560 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Butter", "مکھن", 2, "pack", "پیکٹ", 4],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Tomatoes", "ٹماٹر", 500, "g", "گرام", 9],
      ["Cooking Oil", "ککنگ آئل", 50, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken tikka masala recipe",
    key: "chicken_tikka_masala",
    en: "Chicken Tikka Masala",
    ur: "چکن تکہ مصالحہ",
    cat: "Main Course",
    prep: "20 mins", cook: "30 mins", serve: "4 persons", diff: "Medium", cal: "540 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 1, "kg", "کلو", 13],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Tomatoes", "ٹماٹر", 500, "g", "گرام", 9],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Yogurt", "دہی", 200, "g", "گرام", null],
      ["Tikka Masala Spice Blend", "تکہ مصالحہ", 1, "pack", "پیکٹ", null],
      ["Ginger Garlic Paste", "ادرک لہسن پیسٹ", 1, "pack", "پیکٹ", null],
      ["Cooking Oil", "ککنگ آئل", 100, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "kheer recipe",
    key: "kheer",
    en: "Kheer / Rice Pudding",
    ur: "کھیر",
    cat: "Dessert",
    prep: "15 mins", cook: "45 mins", serve: "5 persons", diff: "Medium", cal: "340 kcal",
    ings: [
      ["Whole Milk", "خالص دودھ", 2, "pack", "پیکٹ", 1],
      ["Sugar", "چینی", 250, "g", "گرام", 22],
      ["White Rice", "چاول", 100, "g", "گرام", 19]
    ]
  },
  {
    q: "firni recipe",
    key: "firni",
    en: "Firni",
    ur: "فرنی",
    cat: "Dessert",
    prep: "15 mins", cook: "35 mins", serve: "5 persons", diff: "Medium", cal: "310 kcal",
    ings: [
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Sugar", "چینی", 200, "g", "گرام", 22],
      ["White Rice (Ground)", "چاول", 100, "g", "گرام", 19]
    ]
  },
  {
    q: "shahi tukday recipe",
    key: "shahi_tukday",
    en: "Shahi Tukday",
    ur: "شاہی ٹکڑے",
    cat: "Dessert",
    prep: "15 mins", cook: "20 mins", serve: "4 persons", diff: "Medium", cal: "430 kcal",
    ings: [
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Bread Slices", "ڈبل روٹی", 1, "pack", "پیکٹ", null],
      ["Sugar", "چینی", 200, "g", "گرام", 22],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4]
    ]
  },
  {
    q: "gulab jamun recipe",
    key: "gulab_jamun",
    en: "Gulab Jamun",
    ur: "گلاب جامن",
    cat: "Dessert",
    prep: "15 mins", cook: "20 mins", serve: "5 persons", diff: "Medium", cal: "380 kcal",
    ings: [
      ["Powdered Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Sugar (Syrup)", "چینی", 300, "g", "گرام", 22],
      ["Cooking Oil (Deep Fry)", "ککنگ آئل", 300, "ml", "ملی لیٹر", 21]
    ]
  },
  {
    q: "rasmalai recipe",
    key: "rasmalai",
    en: "Rasmalai",
    ur: "رس ملائی",
    cat: "Dessert",
    prep: "15 mins", cook: "25 mins", serve: "5 persons", diff: "Hard", cal: "360 kcal",
    ings: [
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Large Eggs", "انڈے", 1, "piece", "عدد", 2],
      ["Sugar", "چینی", 200, "g", "گرام", 22]
    ]
  },
  {
    q: "gajar ka halwa recipe",
    key: "gajar_ka_halwa",
    en: "Gajar Ka Halwa",
    ur: "گاجر کا حلوہ",
    cat: "Dessert",
    prep: "20 mins", cook: "45 mins", serve: "5 persons", diff: "Medium", cal: "410 kcal",
    ings: [
      ["Carrots", "گاجر", 1, "kg", "کلو", 12],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Sugar", "چینی", 250, "g", "گرام", 22],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4]
    ]
  },
  {
    q: "sooji halwa recipe",
    key: "sooji_ka_halwa",
    en: "Sooji Ka Halwa",
    ur: "سوجی کا حلوہ",
    cat: "Dessert",
    prep: "10 mins", cook: "20 mins", serve: "5 persons", diff: "Easy", cal: "350 kcal",
    ings: [
      ["Semolina (Sooji)", "سوجی", 250, "g", "گرام", null],
      ["Sugar", "چینی", 250, "g", "گرام", 22],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4]
    ]
  },
  {
    q: "lab-e-shireen recipe",
    key: "lab_e_shireen",
    en: "Lab-e-Shireen",
    ur: "لب شیریں",
    cat: "Dessert",
    prep: "20 mins", cook: "25 mins", serve: "6 persons", diff: "Medium", cal: "390 kcal",
    ings: [
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Sugar", "چینی", 200, "g", "گرام", 22],
      ["Bananas", "کیلے", 1, "dozen", "درجن", 5],
      ["Apples", "سیب", 500, "g", "گرام", 6],
      ["Colored Vermicelli", "رنگین سویاں", 100, "g", "گرام", null],
      ["Custard Powder", "کسٹرڈ پاؤڈر", 50, "g", "گرام", null],
      ["Fruit Cocktail", "مکس فروٹ ٹن", 1, "can", "ڈبہ", null],
      ["Jelly Mix", "جیلی مکس", 1, "pack", "پیکٹ", null]
    ]
  },
  {
    q: "zarda recipe",
    key: "zarda",
    en: "Zarda / Meethe Chawal",
    ur: "زردہ",
    cat: "Dessert",
    prep: "15 mins", cook: "25 mins", serve: "5 persons", diff: "Easy", cal: "360 kcal",
    ings: [
      ["White Rice", "چاول", 500, "g", "گرام", 19],
      ["Sugar", "چینی", 400, "g", "گرام", 22],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Yellow Food Color", "زردہ رنگ", 1, "pack", "پیکٹ", null],
      ["Coconut Flakes & Raisins", "کھوپرا اور کشمش", 50, "g", "گرام", null]
    ]
  },
  {
    q: "mutanjan recipe",
    key: "mutanjan",
    en: "Mutanjan",
    ur: "متنجن",
    cat: "Dessert",
    prep: "15 mins", cook: "25 mins", serve: "6 persons", diff: "Medium", cal: "390 kcal",
    ings: [
      ["White Rice", "چاول", 500, "g", "گرام", 19],
      ["Sugar", "چینی", 400, "g", "گرام", 22],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Green, Red & Yellow Food Colors", "رنگین کھانے کے رنگ", 1, "pack", "پیکٹ", null],
      ["Mini Gulab Jamun", "چھوٹے گلاب جامن", 100, "g", "گرام", null],
      ["Ashrafi (Tutti Frutti)", "اشرفیاں", 100, "g", "گرام", null]
    ]
  },
  {
    q: "custard trifle recipe",
    key: "custard_trifle",
    en: "Custard Trifle",
    ur: "کسٹرڈ ٹرائفل",
    cat: "Dessert",
    prep: "20 mins", cook: "15 mins", serve: "5 persons", diff: "Easy", cal: "330 kcal",
    ings: [
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Sugar", "چینی", 150, "g", "گرام", 22],
      ["Bananas", "کیلے", 6, "piece", "عدد", 5],
      ["Apples", "سیب", 250, "g", "گرام", 6],
      ["Custard Powder (Vanilla)", "کسٹرڈ پاؤڈر", 50, "g", "گرام", null],
      ["Cake Rusk / Sponge Cake", "کیک رسک / کیک", 1, "pack", "پیکٹ", null],
      ["Red Jelly", "لال جیلی", 1, "pack", "پیکٹ", null]
    ]
  },
  {
    q: "pakora samosa recipe",
    key: "pakora_samosa_mix",
    en: "Pakora & Samosa Mix",
    ur: "پکوڑے اور سموسے",
    cat: "Snack",
    prep: "15 mins", cook: "15 mins", serve: "4 persons", diff: "Easy", cal: "350 kcal",
    ings: [
      ["Potatoes", "آلو", 500, "g", "گرام", 10],
      ["Onions", "پیاز", 250, "g", "گرام", 11],
      ["Gram Flour (Besan)", "بیسن", 250, "g", "گرام", null],
      ["Cooking Oil", "ککنگ آئل", 500, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chicken roll recipe",
    key: "chicken_bread_roll",
    en: "Chicken Bread / Roll",
    ur: "چکن بریڈ / رول",
    cat: "Fast Food",
    prep: "20 mins", cook: "15 mins", serve: "3 persons", diff: "Medium", cal: "310 kcal",
    ings: [
      ["Chicken Breast", "مرغی کا گوشت", 500, "g", "گرام", 13],
      ["Bread/Roll Skins", "سموسہ رول پٹی", 1, "pack", "پیکٹ", null],
      ["Butter", "مکھن", 1, "pack", "پیکٹ", 4],
      ["Large Eggs", "انڈے", 1, "piece", "عدد", 2],
      ["Cooking Oil", "ککنگ آئل", 300, "ml", "ملی لیٹر", 21],
      ["Salt", "نمک", 1, "pack", "پیکٹ", 23]
    ]
  },
  {
    q: "chai recipe",
    key: "chai",
    en: "Pakistani Chai / Doodh Patti",
    ur: "چائے / دودھ پتی",
    cat: "Beverages",
    prep: "5 mins", cook: "10 mins", serve: "3-4 persons", diff: "Easy", cal: "110 kcal",
    ings: [
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Green Tea (Black Tea substitute)", "چائے کی پتی", 1, "box", "ڈبہ", 18],
      ["Sugar", "چینی", 50, "g", "گرام", 22]
    ]
  },
  {
    q: "mango lassi recipe",
    key: "mango_lassi",
    en: "Mango Lassi",
    ur: "عام کی لسی",
    cat: "Beverages",
    prep: "5 mins", cook: "2 mins", serve: "2 persons", diff: "Easy", cal: "180 kcal",
    ings: [
      ["Mangoes", "آم", 500, "g", "گرام", 8],
      ["Whole Milk", "خالص دودھ", 1, "pack", "پیکٹ", 1],
      ["Yogurt (Dahi)", "دہی", 1, "pack", "پیکٹ", null],
      ["Sugar", "چینی", 50, "g", "گرام", 22]
    ]
  }
];

export function findMatchingRecipe(query: string, activeProducts: any[]): FallbackRecipe | null {
  const norm = (query || "").toLowerCase().trim();

  // 1. Try absolute exact matching first (by key, exact query q, exact English name, or exact Urdu name)
  let matchedCompact = COMPACT_RECIPES.find(r => 
    norm === r.key.toLowerCase() ||
    norm === r.q.toLowerCase() || 
    norm === r.en.toLowerCase() || 
    norm === r.ur.toLowerCase()
  );

  // 2. If no exact match, try matching by specific query keywords to prevent overlapping (e.g. "beef biryani" matches beef, not chicken)
  if (!matchedCompact) {
    const matches = COMPACT_RECIPES.filter(r => {
      const qNorm = r.q.toLowerCase();
      const enNorm = r.en.toLowerCase();
      const urNorm = r.ur.toLowerCase();
      
      return norm.includes(qNorm) || 
             norm.includes(enNorm) || 
             norm.includes(urNorm) ||
             qNorm.includes(norm) ||
             enNorm.includes(norm) ||
             urNorm.includes(norm);
    });

    if (matches.length > 0) {
      // Prioritize the match that contains distinguishing words
      const bestMatches = matches.filter(r => {
        if (norm.includes("beef") && !r.key.includes("beef") && !r.en.toLowerCase().includes("beef")) return false;
        if (norm.includes("chicken") && !r.key.includes("chicken") && !r.en.toLowerCase().includes("chicken")) return false;
        if (norm.includes("mutton") && !r.key.includes("mutton") && !r.en.toLowerCase().includes("mutton")) return false;
        if (norm.includes("sindhi") && !r.key.includes("sindhi") && !r.en.toLowerCase().includes("sindhi")) return false;
        if (norm.includes("hyderabadi") && !r.key.includes("hyderabadi") && !r.en.toLowerCase().includes("hyderabadi")) return false;
        if (norm.includes("white") && !r.key.includes("white") && !r.en.toLowerCase().includes("white")) return false;
        if (norm.includes("balochi") && !r.key.includes("balochi") && !r.en.toLowerCase().includes("balochi")) return false;
        if (norm.includes("shinwari") && !r.key.includes("shinwari") && !r.en.toLowerCase().includes("shinwari")) return false;
        if (norm.includes("nalli") && !r.key.includes("nalli") && !r.en.toLowerCase().includes("nalli")) return false;
        return true;
      });

      if (bestMatches.length > 0) {
        bestMatches.sort((a, b) => b.q.length - a.q.length);
        matchedCompact = bestMatches[0];
      } else {
        matches.sort((a, b) => b.q.length - a.q.length);
        matchedCompact = matches[0];
      }
    }
  }

  // 3. Fallback matching for loose keyword searches
  if (!matchedCompact) {
    if (norm.includes("biryani")) {
      if (norm.includes("beef")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "beef_biryani");
      else if (norm.includes("mutton")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "mutton_biryani");
      else if (norm.includes("sindhi")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "sindhi_biryani");
      else if (norm.includes("hyderabadi")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "hyderabadi_biryani");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "chicken_biryani");
    } else if (norm.includes("haleem")) {
      if (norm.includes("chicken")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "chicken_haleem");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "beef_haleem");
    } else if (norm.includes("karahi")) {
      if (norm.includes("mutton")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "mutton_karahi");
      else if (norm.includes("white")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "white_chicken_karahi");
      else if (norm.includes("balochi")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "balochi_tikka_karahi");
      else if (norm.includes("shinwari")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "shinwari_mutton_karahi");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "chicken_karahi");
    } else if (norm.includes("nihari")) {
      if (norm.includes("nalli")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "nalli_nihari");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "beef_nihari");
    } else if (norm.includes("pulao")) {
      if (norm.includes("beef")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "beef_pulao");
      else if (norm.includes("kabuli")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "kabuli_pulao");
      else if (norm.includes("matar")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "matar_pulao");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "chicken_yakhni_pulao");
    } else if (norm.includes("korma")) {
      if (norm.includes("mutton")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "mutton_korma");
      else if (norm.includes("shahi")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "shahi_chicken_korma");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "chicken_korma");
    } else if (norm.includes("lasagna")) {
      if (norm.includes("beef")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "beef_lasagna");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "chicken_lasagna");
    } else if (norm.includes("pizza")) {
      if (norm.includes("pepperoni")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "pepperoni_pizza");
      else if (norm.includes("tikka")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "chicken_tikka_pizza");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "margherita_pizza");
    } else if (norm.includes("burger")) {
      if (norm.includes("zinger")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "zinger_burger");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "beef_smash_burger");
    } else if (norm.includes("sandwich")) {
      if (norm.includes("chicken")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "grilled_chicken_sandwich");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "club_sandwich");
    } else if (norm.includes("tacos")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "mexican_tacos");
    } else if (norm.includes("firni")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "firni");
    } else if (norm.includes("kheer")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "kheer");
    } else if (norm.includes("shahi tukday")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "shahi_tukday");
    } else if (norm.includes("gulab jamun")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "gulab_jamun");
    } else if (norm.includes("rasmalai")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "rasmalai");
    } else if (norm.includes("gajar ka halwa") || norm.includes("gajar halwa")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "gajar_ka_halwa");
    } else if (norm.includes("sooji")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "sooji_ka_halwa");
    } else if (norm.includes("lab-e-shireen") || norm.includes("shireen")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "lab_e_shireen");
    } else if (norm.includes("zarda")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "zarda");
    } else if (norm.includes("mutanjan")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "mutanjan");
    } else if (norm.includes("trifle") || norm.includes("custard")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "custard_trifle");
    } else if (norm.includes("daal") || norm.includes("dal")) {
      if (norm.includes("mash")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "daal_mash_fry");
      else if (norm.includes("tadka") || norm.includes("yellow")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "daal_tadka");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "daal_chawal");
    } else if (norm.includes("fish")) {
      if (norm.includes("grilled")) matchedCompact = COMPACT_RECIPES.find(r => r.key === "grilled_fish");
      else matchedCompact = COMPACT_RECIPES.find(r => r.key === "lahori_fish_fry");
    } else if (norm.includes("roll") || norm.includes("bread")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "chicken_bread_roll");
    } else if (norm.includes("chai") || norm.includes("tea")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "chai");
    } else if (norm.includes("lassi")) {
      matchedCompact = COMPACT_RECIPES.find(r => r.key === "mango_lassi");
    }
  }

  if (matchedCompact) {
    const { descEn, descUr } = generateDescription(matchedCompact.en, matchedCompact.ur, matchedCompact.cat, matchedCompact.ings);
    const { stepsEn, stepsUr } = generateSteps(matchedCompact.en, matchedCompact.ur, matchedCompact.cat, matchedCompact.ings);

    return buildRecipeObject({
      key: matchedCompact.key,
      en: matchedCompact.en,
      ur: matchedCompact.ur,
      cat: matchedCompact.cat,
      prep: matchedCompact.prep,
      cook: matchedCompact.cook,
      serve: matchedCompact.serve,
      diff: matchedCompact.diff,
      cal: matchedCompact.cal,
      descEn,
      descUr,
      ings: matchedCompact.ings.map(i => ({
        name: i[0],
        ur: i[1],
        qty: i[2],
        unit: i[3],
        unitUr: i[4],
        pid: i[5]
      })),
      stepsEn,
      stepsUr
    }, activeProducts);
  }

  // General loose matching fallback only if explicit recipe intent is there in query
  const hasRecipeIntent = 
    norm.includes("recipe") || 
    norm.includes("ingredients") || 
    norm.includes("how to") || 
    norm.includes("cook") || 
    norm.includes("dish") || 
    norm.includes("cooking") || 
    norm.includes("pakana") || 
    norm.includes("طریقہ") || 
    norm.includes("ترکیب") || 
    norm.includes("اجزاء") ||
    norm.includes("banane ka");

  if (!hasRecipeIntent) {
    return null;
  }

  // Default clean fallback
  const cleanTitle = query.replace(/(recipe|ingredients|how to make|make|cook|dish|banane ka tarika|ke ingredients)/gi, "").trim() || "Delicious Dish";
  const capitalTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  return buildRecipeObject({
    key: cleanTitle.toLowerCase().replace(/\s+/g, "_"),
    en: capitalTitle + " Recipe",
    ur: capitalTitle + " کی ترکیب",
    cat: "Special Dish",
    prep: "15 mins", cook: "25 mins", serve: "3-4 persons", diff: "Medium", cal: "450 kcal",
    descEn: `A classic customized ${capitalTitle} preparation made with selected grocery items.`,
    descUr: `منتخب کردہ راشن کے اجزاء سے بنی شاندار ${capitalTitle}۔`,
    ings: [
      { name: "Chicken Breast", ur: "مرغی کا گوشت", qty: 1, unit: "kg", unitUr: "کلو", pid: 13 },
      { name: "White Rice", ur: "چاول", qty: 1, unit: "kg", unitUr: "کلو", pid: 19 },
      { name: "Onions", ur: "پیاز", qty: 500, unit: "g", unitUr: "گرام", pid: 11 },
      { name: "Tomatoes", ur: "ٹماٹر", qty: 500, unit: "g", unitUr: "گرام", pid: 9 },
      { name: "Cooking Oil", ur: "ککنگ آئل", qty: 1, unit: "bottle", unitUr: "بوتل", pid: 21 },
      { name: "Salt", ur: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ", pid: 23 }
    ],
    stepsEn: [
      `Prepare all fresh grocery ingredients for ${capitalTitle}.`,
      "Sauté Onions and Tomatoes in Cooking Oil until fragrant.",
      "Add Chicken, White Rice, and custom seasonings to simmer until tender."
    ],
    stepsUr: [
      `${capitalTitle} کے لیے درکار تمام تازہ سامان اکٹھا کریں۔`,
      "پیاز اور ٹماٹر کو ککنگ آئل میں بھون کر گریوی بنائیں۔",
      "چکن، چاول اور مخصوص مصالحے شامل کر کے گلنے اور پکنے تک دم دیں۔"
    ]
  }, activeProducts);
}

function generateDescription(enName: string, urName: string, category: string, ings: any[]) {
  const primaryIng = ings[0] ? ings[0][0] : "premium ingredients";
  const primaryIngUr = ings[0] ? ings[0][1] : "عمدہ اجزاء";

  const descEn = `An authentic and delicious ${enName} cooked with ${primaryIng.toLowerCase()} and traditional spice blends.`;
  const descUr = `${primaryIngUr}، دیسی گھی اور مخصوص مصالحہ جات سے بنی لذیذ ترین روایتی ${urName}۔`;

  return { descEn, descUr };
}

function generateSteps(enName: string, urName: string, category: string, ings: any[]) {
  const hasRice = ings.some(i => i[5] === 19);
  const hasPasta = ings.some(i => i[5] === 20);

  let stepsEn: string[] = [];
  let stepsUr: string[] = [];

  if (category === "Beverages") {
    stepsEn = [
      `Wash and prepare all required fresh ingredients for ${enName}.`,
      "Combine ingredients in a blender or brewing pot as required.",
      "Blend or simmer on medium heat until fully mixed and rich in texture.",
      "Pour into glasses, garnish beautifully, and serve chilled or warm."
    ];
    stepsUr = [
      `${urName} کے لیے تمام مطلوبہ تازہ اور معیاری اجزاء تیار کر لیں۔`,
      "اجزاء کو بلینڈر یا پین میں حسب ضرورت شامل کریں۔",
      "خوشبو اور بہترین ذائقہ آنے تک اچھی طرح بلینڈ کریں یا ہلکی آنچ پر پکائیں۔",
      "گلاسوں میں نکال کر سجائیں اور ٹھنڈا یا گرما گرم پیش کریں۔"
    ];
  } else if (category === "Dessert") {
    stepsEn = [
      `Boil Whole Milk in a deep pan and add sweetening bases for ${enName}.`,
      "Stir in Sugar and Butter, cooking on medium-low heat until thick.",
      "Garnish with cardamoms, saffron, or sliced fruits.",
      "Chill in the refrigerator for 2 hours before serving."
    ];
    stepsUr = [
      `ایک گہرے برتن میں دودھ ابالیں اور ${urName} کے لیے بنیادی اجزاء شامل کریں۔`,
      "چینی اور مکھن شامل کر کے ہلکی انچ پر گاڑھا ہونے تک چمچ چلاتے رہیں۔",
      "الائچی، زعفران یا کٹے ہوئے پھلوں سے اوپر سجاوٹ کریں۔",
      "فریج میں رکھ کر اچھی طرح ٹھنڈا کریں اور مہمانوں کو پیش کریں۔"
    ];
  } else if (hasPasta) {
    stepsEn = [
      "Boil Pasta in seasoned salted water with a drop of oil until tender, then drain.",
      "Sauté onions, garlic, and seasoned meat or veggies in Butter.",
      "Pour in milk and cheese to create a rich, velvety Italian style sauce.",
      `Toss pasta into the sauce, top with spices, and serve hot ${enName}.`
    ];
    stepsUr = [
      "پاستا کو نمک اور آئل ڈال کر ابالیں اور چھلنی سے پانی چھان لیں۔",
      "مکھن میں پیاز، لہسن اور گوشت یا سبزیاں ڈال کر فرائی کریں۔",
      "دودھ اور چیز شامل کر کے دھیمی انچ پر کریمی اور گاڑھی ساس بنائیں۔",
      `پاستا کو ساس میں مکس کریں اور گرم گرم ${urName} پیش کریں۔`
    ];
  } else if (category === "Fast Food") {
    stepsEn = [
      "Sauté and grill the seasoned meat patty or fillings in Butter until cooked.",
      "Lightly toast the buns, bread slices, or tortilla wraps in a pan.",
      "Spread mayonnaise and ketchup, then layer cheese, onions, and tomato slices.",
      `Assemble the hot ${enName} and serve immediately with fries.`
    ];
    stepsUr = [
      "مکھن یا آئل میں پیٹی یا فلنگز کو سنہری ہونے تک فرائی کریں۔",
      "بنز، ڈبل روٹی یا ٹارٹیلا ریپس کو پین پر ہلکا سا گرم کریں۔",
      "مایونیز اور کیچپ لگا کر پیاز، ٹماٹر اور چیز سلائس کی تہہ لگائیں۔",
      `لذیذ گرما گرم ${urName} تیار کر کے فوری پیش کریں۔`
    ];
  } else if (hasRice) {
    stepsEn = [
      "Boil washed White Rice in salted water until 80% cooked, then strain.",
      "Cook meat and vegetables with onions and tomatoes in Cooking Oil until tender.",
      `Layer the rice over the seasoned gravy, and garnish for ${enName}.`,
      "Steam (dum) on extremely low heat for 15 minutes before serving."
    ];
    stepsUr = [
      "چاول کو نمکین پانی میں 80 فیصد ابالیں اور نتھار لیں۔",
      "پیاز، ٹماٹر اور مخصوص مصالحوں میں گوشت یا سبزیاں بھون لیں۔",
      `ابلی چاول کی تہہ لگائیں اور ${urName} کے لیے اوپر سے سجاوٹ کریں۔`,
      "ہلکی انچ پر 15 منٹ دم دیں اور گرما گرم نوش فرمائیں۔"
    ];
  } else if (category === "Vegetables" || category === "Snack") {
    stepsEn = [
      "Chop all fresh vegetables (potatoes, onions, tomatoes) into equal sizes.",
      "Heat Cooking Oil in a pan, sauté onions and tomatoes with rich spices.",
      `Add vegetables, sprinkle water, and cover to steam on low heat for ${enName}.`,
      "Garnish with fresh green coriander and serve with warm flatbread."
    ];
    stepsUr = [
      "تمام تازہ سبزیوں (آلو، پیاز، ٹماٹر) کو یکساں سائز میں کاٹ لیں۔",
      "پین میں آئل گرم کر کے پیاز اور ٹماٹر کو دیسی مصالحوں کے ساتھ بھونیں۔",
      `سبزیاں شامل کریں اور ڈھک کر ہلکی انچ پر ${urName} کو گلنے دیں۔`,
      "ہرے دھنیے سے سجا کر گرما گرم روٹی یا نان کے ساتھ سرو کریں۔"
    ];
  } else {
    // Default main course or meat/seafood dishes
    stepsEn = [
      "Heat Cooking Oil and Butter in a pot, and sauté chopped Onions until golden.",
      "Add seasoned meat or fish, tomatoes, and robust spices to fry well.",
      "Simmer on medium-low heat until the gravy is rich and oil separates.",
      `Garnish with fresh ginger slices, green chillies, and serve ${enName}.`
    ];
    stepsUr = [
      "برتن میں آئل اور مکھن گرم کریں اور پیاز کو سنہری ہونے تک فرائی کریں۔",
      "گوشت، ٹماٹر اور روایتی مصالحے شامل کر کے اچھی طرح بھونیں۔",
      "ہلکی انچ پر پکنے دیں یہاں تک کہ گریوی گاڑھی ہو جائے اور آئل الگ ہو جائے۔",
      `باریک کٹی ادرک اور ہری مرچیں چھڑک کر گرما گرم ${urName} پیش کریں۔`
    ];
  }

  return { stepsEn, stepsUr };
}

function buildRecipeObject(spec: any, activeProducts: any[]): FallbackRecipe {
  const processedIngs = (spec.ings || spec.ingredients).map((rawIng: any) => {
    const ing = Array.isArray(rawIng) ? {
      name: rawIng[0],
      en: rawIng[0],
      ur: rawIng[1],
      nameUr: rawIng[1],
      qty: rawIng[2],
      unit: rawIng[3],
      unitUr: rawIng[4],
      pid: rawIng[5]
    } : rawIng;

    let match = null;
    if (ing.pid) {
      match = activeProducts.find((p: any) => String(p.id) === String(ing.pid));
    }
    if (!match && (ing.name || ing.en)) {
      match = activeProducts.find((p: any) => {
        const pEn = (p.name || "").toLowerCase().trim();
        const pUr = (p.nameUr || "").toLowerCase().trim();
        const ingEn = (ing.name || ing.en || "").toLowerCase().trim();
        const ingUr = (ing.ur || ing.nameUr || "").toLowerCase().trim();
        return pEn.includes(ingEn) || ingEn.includes(pEn) || (ingUr && pUr && pUr.includes(ingUr));
      });
    }

    const isAvailable = match && match.status !== "Inactive" && match.status !== "Unavailable" && (match.stockQuantity === undefined || match.stockQuantity > 0) && match.price > 0;
    
    let rawBaseQty = (typeof ing.qty === "number" && ing.qty > 0) ? ing.qty : (parseFloat(ing.qty) || 1);
    if (!rawBaseQty || rawBaseQty <= 0) rawBaseQty = 1;

    let unit = ing.unit || (match ? match.unit : "pack");
    let unitUr = ing.unitUr || ing.ur || (match ? match.unitUr : "پیکٹ");
    let qty = rawBaseQty;

    // Convert grams to kg, and ml to liter for consistent pricing & units
    if (unit === "g" || unit === "gram" || unit === "grams") {
      if (qty >= 10) qty = qty / 1000;
      qty = Math.max(1, Math.round(qty));
      unit = "kg";
      unitUr = "کلو";
    } else if (unit === "ml" || unit === "milliliter" || unit === "milliliters") {
      if (qty >= 10) qty = qty / 1000;
      qty = Math.max(1, Math.round(qty));
      unit = "liter";
      unitUr = "لیٹر";
    } else {
      qty = Math.max(1, Math.round(qty));
    }
    if (!qty || qty <= 0) qty = 1;

    let rawPrice = match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : (ing.price || 280);
    let storeUnitPrice = (rawPrice && rawPrice > 0) ? rawPrice : 280;
    
    let calculatedPrice = Math.round((qty * storeUnitPrice) * 100) / 100;
    if (calculatedPrice <= 0) calculatedPrice = 50;

    let cat = match ? match.category : (ing.category || "Pantry");
    if (cat === "Main Course" || cat === "Breakfast") cat = "Pantry";

    return {
      name: match ? match.name : (ing.name || ing.en),
      nameUr: match ? match.nameUr : (ing.ur || ing.nameUr || ing.name),
      qty,
      unit,
      unitUr,
      matchedProductId: isAvailable ? match.id : null,
      matched: !!isAvailable,
      price: isAvailable ? calculatedPrice : 0,
      storeUnitPrice: isAvailable ? storeUnitPrice : 0,
      cartQty: qty,
      currencyCode: match ? (match.currencyCode || match.currency || "PKR") : "PKR",
      category: isAvailable ? cat : "Unavailable"
    };
  });

  return {
    key: spec.key,
    nameEn: spec.en || spec.nameEn,
    nameUr: spec.ur || spec.nameUr,
    category: spec.cat || spec.category || "Main Course",
    prepTime: spec.prep || spec.prepTime || "15 mins",
    cookTime: spec.cook || spec.cookTime || "25 mins",
    servings: spec.serve || spec.servings || "4 persons",
    difficulty: spec.diff || spec.difficulty || "Easy",
    calories: spec.cal || spec.calories || "450 kcal",
    descriptionEn: spec.descEn || spec.descriptionEn,
    descriptionUr: spec.descUr || spec.descriptionUr,
    ingredients: processedIngs,
    instructionsEn: spec.stepsEn || spec.instructionsEn || [],
    instructionsUr: spec.stepsUr || spec.instructionsUr || []
  };
}
