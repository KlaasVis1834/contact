// Toon/verberg velden op basis van verzoek-type
function toggleFields() {
    const verzoekType = document.getElementById('verzoek-type').value;
    console.log("Gekozen verzoek-type:", verzoekType); // Debug om te zien of de functie werkt
    const fieldGroups = {
        'adreswijziging': ['adreswijziging-fields-postcode', 'adreswijziging-fields-huisnummer', 'adreswijziging-fields-adres', 'adreswijziging-fields-datum'],
        'motorvoertuigwijziging': ['motorvoertuigwijziging-fields-datum', 'motorvoertuigwijziging-fields-polisnummer', 'motorvoertuigwijziging-fields-huidig-kenteken', 'motorvoertuigwijziging-fields-huidig-merk', 'motorvoertuigwijziging-fields-huidig-model', 'motorvoertuigwijziging-fields-nieuw-kenteken', 'motorvoertuigwijziging-fields-nieuw-merk', 'motorvoertuigwijziging-fields-nieuw-model'],
        'verzekering-beëindigen': ['verzekering-beëindigen-fields-datum', 'verzekering-beëindigen-fields-reden'],
        'belverzoek': ['belverzoek-fields-telefoon', 'belverzoek-fields-datum-tijd'],
        'emailwijziging': ['emailwijziging-fields-huidig', 'emailwijziging-fields-nieuw'],
        'anders': ['anders-fields']
    };

    // Verberg alle velden
    Object.values(fieldGroups).flat().forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });

    // Toon alleen relevante velden
    if (fieldGroups[verzoekType]) {
        fieldGroups[verzoekType].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.remove('hidden');
        });
    }
}

// Postcode API voor adreswijziging
async function fetchPostcodeData() {
    const postcode = document.getElementById('nieuwe-postcode').value.replace(/\s/g, '');
    const huisnummer = document.getElementById('nieuwe-huisnummer').value;
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode} ${huisnummer}&rows=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const adres = data.response.docs[0];
        document.getElementById('nieuw-adres').value = `${adres.straatnaam} ${huisnummer}, ${adres.woonplaatsnaam}`;
    } catch (error) {
        console.error('Fout bij ophalen postcodegegevens:', error);
        document.getElementById('nieuw-adres').value = '';
    }
}

// RDW API voor motorvoertuigwijziging
async function fetchRDWData(kentekenField, merkField, modelField) {
    const kenteken = document.getElementById(kentekenField).value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const url = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
            const auto = data[0];
            document.getElementById(merkField).value = auto.merk;
            document.getElementById(modelField).value = auto.handelsbenaming;
        } else {
            alert('Geen voertuig gevonden met dit kenteken.');
        }
    } catch (error) {
        alert('Fout bij ophalen RDW-gegevens: ' + error.message);
    }
}

// Formulier verzenden
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = this;
    const formData = new FormData(form);
    let email = formData.get('email') || 'rbuijs@klaasvis.nl'; // Default naar rbuijs@klaasvis.nl als email leeg is
    let emailBody = "Contactverzoek Klaas Vis Assurantiekantoor\n\n";

    for (let [key, value] of formData.entries()) {
        if (value && value.trim() !== '') {
            emailBody += `${key}: ${value}\n`;
        }
    }

    // Toon loadingscreen
    document.getElementById('loadingScreen').style.display = 'flex';

    // Verstuur naar kantoor
    emailjs.send("service_hcds2qk", "template_xk3jqlc", {
        message: emailBody,
        reply_to: email
    })
    .then(() => {
        console.log("E-mail naar kantoor succesvol verzonden");
        // Verstuur naar klant (of rbuijs@klaasvis.nl als email leeg was)
        return emailjs.send("service_hcds2qk", "template_gco2wsm", {
            to_email: email,
            message: "Bedankt voor uw verzoek!\n\nHieronder uw ingevulde gegevens:\n" + emailBody
        });
    })
    .then(() => {
        console.log("E-mail naar klant succesvol verzonden");
        // Na 2 seconden redirect zoals Inboedelwaardemeter
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            window.location.href = "https://www.klaasvis.nl";
        }, 2000);
    })
    .catch((error) => {
        console.error("Fout bij verzenden:", error);
        document.getElementById('loadingScreen').style.display = 'none';
        alert(`Er is een fout opgetreden: ${error.text}. Probeer het later opnieuw.`);
    });
});

// Chatbase chatbot integratie
(function() {
    if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
        window.chatbase = (...args) => {
            if (!window.chatbase.q) {
                window.chatbase.q = [];
            }
            window.chatbase.q.push(args);
        };
        window.chatbase = new Proxy(window.chatbase, {
            get(target, prop) {
                if (prop === 'q') {
                    return target.q;
                }
                return (...args) => target(prop, ...args);
            }
        });
    }
    const onLoad = function() {
        const script = document.createElement('script');
        script.src = 'https://www.chatbase.co/embed.min.js';
        script.id = 'C60jEJW_QuVD7X3vE5rzE';
        script.setAttribute('domain', 'www.chatbase.co');
        document.body.appendChild(script);
    };
    if (document.readyState === 'complete') {
        onLoad();
    } else {
        window.addEventListener('load', onLoad);
    }
})();

// Event listeners toevoegen
document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('verzoek-type');
    if (selectElement) {
        selectElement.addEventListener('change', toggleFields);
        toggleFields(); // Roep functie direct aan bij laden
    } else {
        console.error("Element met ID 'verzoek-type' niet gevonden!");
    }

    // Andere event listeners
    const postcode = document.getElementById('nieuwe-postcode');
    const huisnummer = document.getElementById('nieuwe-huisnummer');
    const huidigKenteken = document.getElementById('huidig-kenteken');
    const nieuwKenteken = document.getElementById('nieuw-kenteken');

    if (postcode) postcode.addEventListener('blur', fetchPostcodeData);
    if (huisnummer) huisnummer.addEventListener('blur', fetchPostcodeData);
    if (huidigKenteken) huidigKenteken.addEventListener('blur', () => fetchRDWData('huidig-kenteken', 'huidig-merk', 'huidig-model'));
    if (nieuwKenteken) nieuwKenteken.addEventListener('blur', () => fetchRDWData('nieuw-kenteken', 'nieuw-merk', 'nieuw-model'));
});
