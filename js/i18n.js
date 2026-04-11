// =====================================================
// i18n.js — Dutch / English translations
// =====================================================

const translations = {
  nl: {
    // Navigation
    nav_home: "Regio's",
    nav_exercises: 'Oefeningen',
    nav_advice: 'Advies',
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
    no_items: 'Geen items gevonden.',

    // Home / Region browser
    home_title: "Regio's",
    all_workouts: 'Alle workouts',
    all_workouts_sub: 'Bekijk alle workouts',
    no_workouts_in_region: 'Geen workouts in deze regio.',
    no_regions: "Geen regio's. Voeg regio's toe via Instellingen.",

    // Exercises
    exercises_title: 'Oefeningen',
    add_exercise: 'Oefening toevoegen',
    edit_exercise: 'Oefening bewerken',
    send_exercise: 'Oefening versturen',
    exercises_empty: 'Nog geen oefeningen. Tik + om te beginnen.',
    exercise_name_nl: 'Naam (Nederlands)',
    exercise_name_en: 'Naam (Engels)',
    exercise_desc_nl: 'Instructies (Nederlands)',
    exercise_desc_en: 'Instructies (Engels)',
    exercise_default_sets: 'Standaard sets',
    exercise_default_reps: 'Standaard herhalingen',
    exercise_default_freq: 'Standaard frequentie',
    exercise_url: 'Link (instructiepagina / video)',
    exercise_region: 'Regio',
    exercise_info: 'Oefening info',
    exercise_defaults: 'Standaard waarden',
    region_label: 'Regio',

    // Workouts
    workouts_title: 'Workouts',
    add_workout: 'Workout toevoegen',
    edit_workout: 'Workout bewerken',
    workouts_empty: 'Nog geen workouts. Tik + om te beginnen.',
    workout_name: 'Naam workout',
    workout_region: 'Regio',
    workout_exercises: 'Oefeningen',
    workout_detail_title: 'Workout samenstellen',
    no_exercises_added: 'Nog geen oefeningen.',
    add_exercise_btn: 'Oefening toevoegen',
    sets: 'Sets',
    reps: 'Herh.',
    exercise_count: (n) => `${n} oefening${n !== 1 ? 'en' : ''}`,
    select_exercise: 'Kies een oefening',
    no_exercises_available: 'Geen oefeningen beschikbaar. Voeg eerst oefeningen toe.',

    // Frequency
    frequency_label: 'Frequentie',
    frequency_daily: 'Elke dag',
    frequency_weekly: (n) => `${n}x per week`,
    frequency_per_week: 'per week',
    frequency_daily_short: 'Dagelijks',

    // Session (send page)
    session_exercises_title: 'Oefeningen',
    session_advice_title: 'Advies',
    add_to_session: 'Toevoegen aan bericht',
    session_exercises_hint: 'Aanpassingen worden niet opgeslagen in de workout.',
    add_advice_btn: 'Advies toevoegen',
    no_advice_added: 'Nog geen advies toegevoegd.',
    select_advice: 'Kies advies',
    no_advice_available: 'Geen standaard advies beschikbaar. Voeg advies toe via het Advies tabblad.',

    // Message
    whatsapp_preview_title: 'Berichtvoorbeeld',
    copy_message: 'Bericht kopiëren',
    message_copied: 'Gekopieerd!',
    copy_failed: 'Kopiëren mislukt — selecteer de tekst handmatig.',
    msg_lang_label: 'Berichttaal',
    generate_message: 'Bericht genereren',

    // Message content (professional, no emoji)
    wa_sets: 'sets',
    wa_reps: 'herhalingen',
    wa_link_label: 'Instructies',
    wa_freq_daily: 'Elke dag',
    wa_freq_weekly: (n) => `${n}x per week`,

    // Advice
    advice_title: 'Standaard advies',
    add_advice: 'Advies toevoegen',
    edit_advice: 'Advies bewerken',
    advice_empty: 'Nog geen standaard advies. Tik + om te beginnen.',
    advice_region: 'Regio',
    advice_title_nl: 'Titel (Nederlands) *',
    advice_title_en: 'Titel (Engels) *',
    advice_text_nl: 'Advies tekst (Nederlands)',
    advice_text_en: 'Advies tekst (Engels)',
    advice_info: 'Advies info',

    // Settings
    settings_title: 'Instellingen',
    language_section: 'Taal',
    language_label: 'Taal',
    appearance_section: 'Weergave',
    dark_mode_label: 'Donkere modus',
    msg_config_section: 'Berichtinstellingen',
    msg_greeting_label: 'Aanhef',
    msg_greeting_placeholder: 'Bijv. Beste cliënt,',
    msg_closing_label: 'Afsluiting',
    msg_closing_placeholder: 'Bijv. Met vriendelijke groet,',
    msg_show_desc_label: 'Instructies opnemen in bericht',
    data_section: 'Data',
    export_db: 'Database exporteren',
    export_db_sub: 'Sla alle oefeningen, workouts en advies op als bestand',
    import_db: 'Database importeren',
    import_db_sub: 'Herstel of deel een eerder geëxporteerde database',
    import_confirm: 'Dit overschrijft alle huidige data. Doorgaan?',
    import_success: 'Database geïmporteerd!',
    import_error: 'Importeren mislukt. Controleer het bestand.',
    export_success: 'Database geëxporteerd!',
    regions_section: "Regio's",
    regions_sub: "Beheer regio's voor oefeningen en workouts",
    add_region: 'Toevoegen',
    region_placeholder: "Nieuwe regio...",
    about_section: 'Over',
    about_label: 'FysioApp',
    about_sub: 'Versie 2.0 — Gemaakt voor fysiotherapeuten',
  },

  en: {
    // Navigation
    nav_home: 'Regions',
    nav_exercises: 'Exercises',
    nav_advice: 'Advice',
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
    no_items: 'No items found.',

    // Home / Region browser
    home_title: 'Regions',
    all_workouts: 'All workouts',
    all_workouts_sub: 'Browse all workouts',
    no_workouts_in_region: 'No workouts in this region.',
    no_regions: 'No regions. Add regions via Settings.',

    // Exercises
    exercises_title: 'Exercises',
    add_exercise: 'Add exercise',
    edit_exercise: 'Edit exercise',
    send_exercise: 'Send exercise',
    exercises_empty: 'No exercises yet. Tap + to get started.',
    exercise_name_nl: 'Name (Dutch)',
    exercise_name_en: 'Name (English)',
    exercise_desc_nl: 'Instructions (Dutch)',
    exercise_desc_en: 'Instructions (English)',
    exercise_default_sets: 'Default sets',
    exercise_default_reps: 'Default reps',
    exercise_default_freq: 'Default frequency',
    exercise_url: 'Link (instruction page / video)',
    exercise_region: 'Region',
    exercise_info: 'Exercise info',
    exercise_defaults: 'Default values',
    region_label: 'Region',

    // Workouts
    workouts_title: 'Workouts',
    add_workout: 'Add workout',
    edit_workout: 'Edit workout',
    workouts_empty: 'No workouts yet. Tap + to get started.',
    workout_name: 'Workout name',
    workout_region: 'Region',
    workout_exercises: 'Exercises',
    workout_detail_title: 'Compose message',
    no_exercises_added: 'No exercises added.',
    add_exercise_btn: 'Add exercise',
    sets: 'Sets',
    reps: 'Reps',
    exercise_count: (n) => `${n} exercise${n !== 1 ? 's' : ''}`,
    select_exercise: 'Select an exercise',
    no_exercises_available: 'No exercises available. Add some exercises first.',

    // Frequency
    frequency_label: 'Frequency',
    frequency_daily: 'Every day',
    frequency_weekly: (n) => `${n}x per week`,
    frequency_per_week: 'per week',
    frequency_daily_short: 'Daily',

    // Session (send page)
    session_exercises_title: 'Exercises',
    session_advice_title: 'Advice',
    add_to_session: 'Add to message',
    session_exercises_hint: 'Changes are not saved to the workout.',
    add_advice_btn: 'Add advice',
    no_advice_added: 'No advice added yet.',
    select_advice: 'Select advice',
    no_advice_available: 'No standard advice available. Add advice in the Advice tab.',

    // Message
    whatsapp_preview_title: 'Message preview',
    copy_message: 'Copy message',
    message_copied: 'Copied!',
    copy_failed: 'Copy failed — please select the text manually.',
    msg_lang_label: 'Message language',
    generate_message: 'Generate message',

    // Message content
    wa_sets: 'sets',
    wa_reps: 'reps',
    wa_link_label: 'Instructions',
    wa_freq_daily: 'Every day',
    wa_freq_weekly: (n) => `${n}x per week`,

    // Advice
    advice_title: 'Standard advice',
    add_advice: 'Add advice',
    edit_advice: 'Edit advice',
    advice_empty: 'No standard advice yet. Tap + to get started.',
    advice_region: 'Region',
    advice_title_nl: 'Title (Dutch) *',
    advice_title_en: 'Title (English) *',
    advice_text_nl: 'Advice text (Dutch)',
    advice_text_en: 'Advice text (English)',
    advice_info: 'Advice info',

    // Settings
    settings_title: 'Settings',
    language_section: 'Language',
    language_label: 'Language',
    appearance_section: 'Appearance',
    dark_mode_label: 'Dark mode',
    msg_config_section: 'Message settings',
    msg_greeting_label: 'Greeting',
    msg_greeting_placeholder: 'E.g. Dear client,',
    msg_closing_label: 'Closing',
    msg_closing_placeholder: 'E.g. Kind regards,',
    msg_show_desc_label: 'Include instructions in message',
    data_section: 'Data',
    export_db: 'Export database',
    export_db_sub: 'Save all exercises, workouts and advice as a file',
    import_db: 'Import database',
    import_db_sub: 'Restore or share a previously exported database',
    import_confirm: 'This will overwrite all current data. Continue?',
    import_success: 'Database imported!',
    import_error: 'Import failed. Please check the file.',
    export_success: 'Database exported!',
    regions_section: 'Regions',
    regions_sub: 'Manage regions for exercises and workouts',
    add_region: 'Add',
    region_placeholder: 'New region...',
    about_section: 'About',
    about_label: 'FysioApp',
    about_sub: 'Version 2.0 — Built for physiotherapists',
  },
};

let _lang = 'nl';

export function t(key, ...args) {
  const val = translations[_lang]?.[key] ?? translations['en']?.[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

// Translate using a specific language (e.g. for message in client's language)
export function tLang(key, lang, ...args) {
  const val = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

export function setLang(lang) {
  if (translations[lang]) { _lang = lang; document.documentElement.lang = lang; }
}

export function getLang() { return _lang; }
