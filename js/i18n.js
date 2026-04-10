// =====================================================
// i18n.js — Dutch / English translations
// =====================================================

const translations = {
  nl: {
    // Nav
    nav_exercises: 'Oefeningen',
    nav_workouts: 'Workouts',
    nav_settings: 'Instellingen',

    // Common
    save: 'Opslaan',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    back: 'Terug',
    add: 'Toevoegen',
    search: 'Zoeken...',
    confirm_delete: 'Weet je zeker dat je dit wilt verwijderen?',
    required_field: 'Dit veld is verplicht.',
    yes: 'Ja',
    no: 'Nee',

    // Exercises
    exercises_title: 'Oefeningen',
    add_exercise: 'Oefening toevoegen',
    edit_exercise: 'Oefening bewerken',
    exercises_empty: 'Nog geen oefeningen. Tik + om te beginnen.',
    exercise_name_nl: 'Naam (Nederlands)',
    exercise_name_en: 'Naam (Engels)',
    exercise_desc_nl: 'Instructies (Nederlands)',
    exercise_desc_en: 'Instructies (Engels)',
    exercise_default_sets: 'Standaard sets',
    exercise_default_reps: 'Standaard herhalingen',
    exercise_url: 'Link (YouTube / website)',
    exercise_category: 'Categorie',
    exercise_info: 'Oefening info',
    exercise_defaults: 'Standaard waarden',
    exercise_categories: ['Rug', 'Benen', 'Armen', 'Schouders', 'Core', 'Borst', 'Overig'],
    category_label: 'Categorie',

    // Workouts
    workouts_title: 'Workouts',
    add_workout: 'Workout toevoegen',
    edit_workout: 'Workout bewerken',
    workouts_empty: 'Nog geen workouts. Tik + om te beginnen.',
    workout_name: 'Naam workout',
    workout_exercises: 'Oefeningen',
    no_exercises_added: 'Nog geen oefeningen toegevoegd.',
    add_exercise_btn: 'Oefening toevoegen',
    sets: 'Sets',
    reps: 'Herh.',
    exercise_count: (n) => `${n} oefening${n !== 1 ? 'en' : ''}`,
    select_exercise: 'Kies een oefening',
    no_exercises_available: 'Geen oefeningen beschikbaar. Voeg eerst oefeningen toe.',
    workout_detail_title: 'Workout detail',

    // WhatsApp
    generate_whatsapp: 'WhatsApp bericht genereren',
    whatsapp_preview_title: 'Berichtvoorvertoning',
    copy_message: 'Kopiëren',
    message_copied: '✓ Gekopieerd!',
    copy_failed: 'Kopiëren mislukt — selecteer de tekst handmatig.',
    wa_header: (name) => `💪 *${name}*\n\nJouw oefeningen voor vandaag:`,
    wa_sets: 'sets',
    wa_reps: 'herhalingen',
    wa_link_label: 'Instructies',
    wa_footer: 'Veel succes! Heb je vragen, laat het me weten. 🙌',

    // Settings
    settings_title: 'Instellingen',
    language_section: 'Taal',
    language_label: 'Taal',
    appearance_section: 'Weergave',
    dark_mode_label: 'Donkere modus',
    data_section: 'Data',
    export_db: 'Database exporteren',
    export_db_sub: 'Sla alle oefeningen en workouts op als bestand',
    import_db: 'Database importeren',
    import_db_sub: 'Herstel of deel een eerder geëxporteerde database',
    import_confirm: 'Dit overschrijft alle huidige data. Doorgaan?',
    import_success: '✓ Database geïmporteerd!',
    import_error: 'Importeren mislukt. Controleer het bestand.',
    export_success: '✓ Database geëxporteerd!',
    categories_section: 'Categorieën',
    categories_sub: 'Beheer categorieën voor oefeningen',
    add_category: 'Toevoegen',
    category_placeholder: 'Nieuwe categorie...',
    about_section: 'Over',
    about_label: 'FysioApp',
    about_sub: 'Versie 1.0 — Gemaakt voor fysiotherapeuten',

    // Workout detail — message language
    msg_lang_label: 'Berichttaal',
  },

  en: {
    // Nav
    nav_exercises: 'Exercises',
    nav_workouts: 'Workouts',
    nav_settings: 'Settings',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    add: 'Add',
    search: 'Search...',
    confirm_delete: 'Are you sure you want to delete this?',
    required_field: 'This field is required.',
    yes: 'Yes',
    no: 'No',

    // Exercises
    exercises_title: 'Exercises',
    add_exercise: 'Add exercise',
    edit_exercise: 'Edit exercise',
    exercises_empty: 'No exercises yet. Tap + to get started.',
    exercise_name_nl: 'Name (Dutch)',
    exercise_name_en: 'Name (English)',
    exercise_desc_nl: 'Instructions (Dutch)',
    exercise_desc_en: 'Instructions (English)',
    exercise_default_sets: 'Default sets',
    exercise_default_reps: 'Default reps',
    exercise_url: 'Link (YouTube / website)',
    exercise_category: 'Category',
    exercise_info: 'Exercise info',
    exercise_defaults: 'Default values',
    exercise_categories: ['Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Chest', 'Other'],
    category_label: 'Category',

    // Workouts
    workouts_title: 'Workouts',
    add_workout: 'Add workout',
    edit_workout: 'Edit workout',
    workouts_empty: 'No workouts yet. Tap + to get started.',
    workout_name: 'Workout name',
    workout_exercises: 'Exercises',
    no_exercises_added: 'No exercises added yet.',
    add_exercise_btn: 'Add exercise',
    sets: 'Sets',
    reps: 'Reps',
    exercise_count: (n) => `${n} exercise${n !== 1 ? 's' : ''}`,
    select_exercise: 'Select an exercise',
    no_exercises_available: 'No exercises available. Add some exercises first.',
    workout_detail_title: 'Workout detail',

    // WhatsApp
    generate_whatsapp: 'Generate WhatsApp message',
    whatsapp_preview_title: 'Message preview',
    copy_message: 'Copy',
    message_copied: '✓ Copied!',
    copy_failed: 'Copy failed — please select the text manually.',
    wa_header: (name) => `💪 *${name}*\n\nYour exercises for today:`,
    wa_sets: 'sets',
    wa_reps: 'reps',
    wa_link_label: 'Instructions',
    wa_footer: 'Good luck! If you have any questions, let me know. 🙌',

    // Settings
    settings_title: 'Settings',
    language_section: 'Language',
    language_label: 'Language',
    appearance_section: 'Appearance',
    dark_mode_label: 'Dark mode',
    data_section: 'Data',
    export_db: 'Export database',
    export_db_sub: 'Save all exercises and workouts as a file',
    import_db: 'Import database',
    import_db_sub: 'Restore or share a previously exported database',
    import_confirm: 'This will overwrite all current data. Continue?',
    import_success: '✓ Database imported!',
    import_error: 'Import failed. Please check the file.',
    export_success: '✓ Database exported!',
    categories_section: 'Categories',
    categories_sub: 'Manage exercise categories',
    add_category: 'Add',
    category_placeholder: 'New category...',
    about_section: 'About',
    about_label: 'FysioApp',
    about_sub: 'Version 1.0 — Built for physiotherapists',

    // Workout detail — message language
    msg_lang_label: 'Message language',
  },
};

let _lang = 'nl';

export function t(key, ...args) {
  const val = translations[_lang]?.[key] ?? translations['en']?.[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

// Translate using a specific language (e.g. for WhatsApp message in client's language)
export function tLang(key, lang, ...args) {
  const val = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

export function setLang(lang) {
  if (translations[lang]) {
    _lang = lang;
    document.documentElement.lang = lang;
  }
}

export function getLang() { return _lang; }
