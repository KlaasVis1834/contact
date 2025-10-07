// === Toon/verberg velden op basis van verzoek-type ===
function toggleFields() {
    const verzoekType = document.getElementById('verzoek-type').value;
    const fieldGroups = {
        'adreswijziging': ['adreswijziging-fields-postcode', 'adreswijziging-fields-huisnummer', 'adreswijziging-fields-adres', 'adreswijziging-fields-datum'],
        'motorvoertuigwijziging': ['motorvoertuigwijziging-fields-datum', 'motorvoertuigwijziging-fields-polisnummer', 'motorvoertuigwijziging-fields-huidig-kenteken', 'motorvoertuigwijziging-fields-huidig-merk', 'motorvoertuigwijziging-fields-huidig-model', 'motorvoertuigwijziging-fields-nieuw-kenteken', 'motorvoertuigwijziging-fields-nieuw-merk', 'motorvoertuigwijziging-fields-nieuw-model'],
        'verzekering-beëindigen': ['verzekering-beëindigen-fields-datum', 'verzekering-beëindigen-fields-reden'],
        'belverzoek': ['belverzoek-fields-telefoon', 'belverzoek-fields-datum-tijd'],
        'emailwijziging': ['emailwijziging-fields-huidig', 'emailwijziging-fields-nieuw'],
        'anders': ['anders-fields']
    };

    // Verberg alles
    Object.values(fieldGroups).flat().forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Toon juiste sectie
    if (fieldGroups[verzoekType]) {
        fieldGroups[verzoekType].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('hidden');
        });
    }
}

// === Postcode API ===
async function fetchPostcodeData() {
    const postcode = document.getElementById('nieuwe-postcode').value.replace(/\s/g, '');
    const huisnummer = document.getElementById('nieuwe-huisnummer').value;
    if (!postcode || !huisnummer) return;

    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode} ${huisnummer}&rows=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const adres = data.response.docs[0];
        document.getElementById('nieuw-adres').value = `${adres.straatnaam} ${huisnummer}, ${adres.woonplaatsnaam}`;
    } catch {
        document.getElementById('nieuw-adres').value = '';
    }
}

// === RDW API ===
async function fetchRDWData(kentekenField, merkField, modelField) {
    const kenteken = document.getElementById(kentekenField).value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!kenteken) return;

    try {
        const response = await fetch(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`);
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

// === Formulier verzenden ===
document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // 🔒 Controleer eerst of reCAPTCHA is voltooid
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        alert("Bevestig eerst dat u geen robot bent (klik op de reCAPTCHA).");
        return;
    }

    const form = this;
    const formData = new FormData(form);
    let email = formData.get('email') || 'rbuijs@klaasvis.nl';
    let emailBody = "Contactverzoek Klaas Vis Assurantiekantoor\n\n";

    for (let [key, value] of formData.entries()) {
        if (value && value.trim() !== '') {
            emailBody += `${key}: ${value}\n`;
        }
    }

    // Loadingscherm aan
    document.getElementById('loadingScreen').style.display = 'flex';

    // Versturen via EmailJS
    emailjs.send("service_hcds2qk", "template_xk3jqlc", {
        message: emailBody,
        reply_to: email
    })
        .then(() => {
            console.log("E-mail naar kantoor verzonden");
            // Stuur bevestiging naar klant
            return emailjs.send("service_hcds2qk", "template_gco2wsm", {
                to_email: email,
                message: "Bedankt voor uw verzoek!\n\nHieronder uw ingevulde gegevens:\n" + emailBody
            });
        })
        .then(() => {
            console.log("Bevestiging verzonden");
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                form.reset();
                grecaptcha.reset(); // reset reCAPTCHA
                window.location.href = "https://www.klaasvis.nl";
            }, 2000);
        })
        .catch((error) => {
            console.error("Fout bij verzenden:", error);
            document.getElementById('loadingScreen').style.display = 'none';
            alert(`Er is een fout opgetreden: ${error.text || error}. Probeer het later opnieuw.`);
        });
});

// === Chatbase chatbot integratie ===
(function () {
    if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
        window.chatbase = (...args) => {
            if (!window.chatbase.q) window.chatbase.q = [];
            window.chatbase.q.push(args);
        };
        window.chatbase = new Proxy(window.chatbase, {
            get(target, prop) {
                if (prop === 'q') return target.q;
                return (...args) => target(prop, ...args);
            }
        });
    }
    const onLoad = function () {
        const script = document.createElement('script');
        script.src = 'https://www.chatbase.co/embed.min.js';
        script.id = 'C60jEJW_QuVD7X3vE5rzE';
        script.setAttribute('domain', 'www.chatbase.co');
        document.body.appendChild(script);
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);
})();

// === Event listeners bij laden ===
document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('verzoek-type');
    if (selectElement) {
        selectElement.addEventListener('change', toggleFields);
        toggleFields();
    }

    const postcode = document.getElementById('nieuwe-postcode');
    const huisnummer = document.getElementById('nieuwe-huisnummer');
    const huidigKenteken = document.getElementById('huidig-kenteken');
    const nieuwKenteken = document.getElementById('nieuw-kenteken');

    if (postcode) postcode.addEventListener('blur', fetchPostcodeData);
    if (huisnummer) huisnummer.addEventListener('blur', fetchPostcodeData);
    if (huidigKenteken) huidigKenteken.addEventListener('blur', () => fetchRDWData('huidig-kenteken', 'huidig-merk', 'huidig-model'));
    if (nieuwKenteken) nieuwKenteken.addEventListener('blur', () => fetchRDWData('nieuw-kenteken', 'nieuw-merk', 'nieuw-model'));
});


