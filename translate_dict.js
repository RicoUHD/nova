const fs = require('fs');
const path = './assets/languages/en.json';

const en = JSON.parse(fs.readFileSync(path, 'utf8'));

// Provide full english translations
const dict = {
  "Profilbild": "Profile Picture",
  "JPG, PNG, HEIC – wird als 256×256 JPEG gespeichert.": "JPG, PNG, HEIC - saved as 256x256 JPEG.",
  "Design": "Design",
  "Farbschema": "Color Scheme",
  "Monatliche Beiträge": "Monthly Contributions",
  "Vollverdiener (€)": "Full Earner (€)",
  "Geringverdiener (€)": "Low Earner (€)",
  "Keinverdiener (€)": "Non-Earner (€)",
  "Berichtszeitraum": "Reporting Period",
  "Startdatum für Berechnung": "Start date for calculation",
  "Registrierungscode": "Registration Code",
  "Aktueller Code": "Current Code",
  "Neu": "New",
  "Sicherheit & Benachrichtigungen": "Security & Notifications",
  "E-Mail Benachrichtigungen bei Anfragen": "Email Notifications for Requests",
  "Passwort ändern": "Change Password",
  "Alle Einstellungen Speichern": "Save All Settings",
  "Benutzerrechte verwalten": "Manage User Roles",
  "Aktiviert nur normale Admin-/Supervisor-Rechte (kein Super-Admin).": "Enables only normal admin/supervisor rights (no super-admin).",
  "System / SMTP konfigurieren": "Configure System / SMTP",
  "Server & E-Mail Einstellungen anpassen": "Adjust Server & Email Settings",
  "Erweiterte KI-Konfiguration": "Advanced AI Configuration",
  "KI-Funktionen und OpenAI Schlüssel verwalten": "Manage AI Features and OpenAI Key",
  "Name": "Name",
  "Status": "Status",
  "Beitrittsdatum": "Join Date",
  "Statusänderung vormerken": "Schedule Status Change",
  "Aktueller Status": "Current Status",
  "Ab diesem Datum werden Beiträge berechnet.": "Contributions are calculated from this date.",
  "E-Mail / Benutzername": "Email / Username",
  "Mit Benutzer-Account verknüpfen": "Link with User Account",
  "Speichern": "Save",
  "Abbrechen": "Cancel",
  "Löschen": "Delete",
  "Einloggen": "Log in",
  "Fehler": "Error",
  "Speichern...": "Saving...",
  "App-Name": "App Name",
  "Ihre erste App-Einrichtung.": "Your first app setup.",
  "Weiter": "Next",
  "Absenden": "Submit",
  "Zahlung": "Payment",
  "Spende": "Donation",
  "Beenden / Speichern": "Finish / Save",
  "Schließen": "Close",
  "Bearbeiten": "Edit",
  "Datum": "Date",
  "Betrag": "Amount",
  "Beschreibung": "Description",
  "Beleg": "Receipt",
  "Anfrage": "Request",
  "Personendetails": "Person Details",
  "Fehler beim Laden der Daten. Bitte Seite neu laden.": "Error loading data. Please reload the page.",
  "KI-Support": "AI Support",
  "Systemeinstellungen": "System Settings",
  "Mitglieder": "Members",
  "Überfällig": "Overdue",
  "Verlauf (90 Tage)": "History (90 days)",
  "Hinzufügen": "Add",
  "Noch keine Mitglieder.": "No members yet.",
  "Bezahlt bis": "Paid until",
  "Monate überfällig": "months overdue",
  "Monat überfällig": "month overdue",
  "noch": "remaining",
  "Monat": "month",
  "Monate": "months",
  "Keine Zahlungen": "No payments",
  "Alles in Ordnung": "All good",
  "Zahlung überfällig": "Payment overdue",
  "läuft diesen Monat ab": "expires this month",
  "läuft nächsten Monat ab": "expires next month",
  "Ersteinrichtung": "Initial Setup",
  "Nova richtet PocketBase automatisch im Docker-Container ein.": "Nova automatically configures PocketBase in the Docker container.",
  "1. Allgemeine Informationen": "1. General Information",
  "Name der Anwendung": "Application Name",
  "z.B. Nova...": "e.g. Nova...",
  "Dieser Name wird in der App und in E-Mails angezeigt.": "This name will be displayed in the app and in emails.",
  "Eigenes Logo (SVG, optional)": "Custom Logo (SVG, optional)",
  "Optional können Sie direkt in der Ersteinrichtung ein eigenes SVG-Logo speichern.": "Optionally, you can save a custom SVG logo during the initial setup.",
  "App installieren": "Install App",
  "Lade Daten...": "Loading data...",
  "Startseite": "Home",
  "Personen": "People",
  "Historie": "History",
  "Einstellungen": "Settings",
  "Anfragen": "Requests",
  "Abmelden": "Logout",
  "Aktueller Kassenstand": "Current Balance",
  "Tippen für Details": "Tap for details",
  "Einnahmen": "Income",
  "Ausgaben": "Expenses",
  "Mitglieder suchen": "Search members",

  // adding other missed strings from index.html
  "6-stelliger Code": "6-digit Code",
  "API-Schlüssel": "API Key",
  "Altes Passwort": "Old Password",
  "Basis-URL": "Base URL",
  "Benutzer / E-Mail": "User / Email",
  "Betrag (€)": "Amount (€)",
  "Bild hochladen": "Upload Image",
  "Bild verschieben und zoomen, um den Bildausschnitt zu wählen": "Move and zoom image to select crop area",
  "Bitte geben Sie den aktuellen 6-stelligen Registrierungscode ein.": "Please enter the current 6-digit registration code.",
  "Datum (Standard: Heute)": "Date (Default: Today)",
  "Geringverdiener": "Low Earner",
  "Gleiches Passwort nochmals": "Same password again",
  "Ja": "Yes",
  "Keinverdiener": "Non-Earner",
  "Neuer Code": "New Code",
  "Neues Passwort": "New Password",
  "Nova": "Nova",
  "Optionale Beschreibung (z.B. Monat/Zweck)": "Optional description (e.g. month/purpose)",
  "Optionale Beschreibung / Zweck": "Optional description / purpose",
  "Passwort": "Password",
  "Rolle": "Role",
  "Spende": "Donation",
  "Spenden": "Donations",
  "Typ": "Type",
  "Vollverdiener": "Full Earner",
  "Zahlung": "Payment",
  "Ändern": "Change",
  "Übernehmen": "Apply",

  // setup.html missed
  "2. Admin Zugang": "2. Admin Access",
  "3. E-Mail & System (Optional)": "3. Email & System (Optional)",
  "Absender-E-Mail (z.B. noreply@nova.local)": "Sender Email (e.g. noreply@nova.local)",
  "App-URL (z.B. https://nova.meinedomain.de)": "App URL (e.g. https://nova.mydomain.com)",
  "Basis-Einstellungen erfolgreich gespeichert.": "Base settings saved successfully.",
  "Das erste Admin-Konto für den Zugang.": "The first admin account for access.",
  "E-Mail Adresse": "Email Address",
  "Für Einladungen und Benachrichtigungen.": "For invitations and notifications.",
  "Ihr erstes Admin-Passwort (mind. 6 Zeichen)": "Your first admin password (min. 6 chars)",
  "Muss 6-stellig sein (z.B. 123456)": "Must be 6 digits (e.g. 123456)",
  "Passwort bestätigen": "Confirm Password",
  "Passwörter stimmen nicht überein.": "Passwords do not match.",
  "Registrierungscode (für neue User)": "Registration Code (for new users)",
  "SMTP Benutzer": "SMTP User",
  "SMTP Host (z.B. mail.gmx.net)": "SMTP Host (e.g. mail.gmx.net)",
  "SMTP Passwort": "SMTP Password",
  "SMTP Port (z.B. 465)": "SMTP Port (e.g. 465)",
  "Speichern & Starten": "Save & Start",
  "Zurück": "Back",
};

// Merge all translated strings
Object.keys(en).forEach(k => {
    if (dict[k]) {
        en[k] = dict[k];
    } else if (en[k] === k) {
        // Find if we have unhandled ones
        // Try exact match or very close match
        if (dict[k.trim()]) {
             en[k] = dict[k.trim()];
        }
    }
});

fs.writeFileSync(path, JSON.stringify(en, null, 2));

const dePath = './assets/languages/de.json';
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
// Merge missing
Object.keys(dict).forEach(k => {
    if (!de[k]) {
        de[k] = k;
        en[k] = dict[k];
    }
});
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
fs.writeFileSync(path, JSON.stringify(en, null, 2));

console.log("English language dictionary completely updated.");
