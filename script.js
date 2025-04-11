// EmailJS initialiseren
emailjs.init("noRYJWEETvdqfI2sL");

// Signature Pad initialiseren
const canvas = document.getElementById("signaturePad");
const signaturePad = new SignaturePad(canvas);
document.getElementById("clearSignature").addEventListener("click", () => signaturePad.clear());

// Dynamische weergave logica
document.querySelectorAll('.switch input[type="radio"]').forEach(input => {
    input.addEventListener('change', (e) => {
        const targetId = e.target.id;
        if (targetId === "oppervlakteJa") {
            document.getElementById("oppervlakteGroot").classList.remove("hidden");
            document.getElementById("kamers").classList.add("hidden");
        } else if (targetId === "oppervlakteNee") {
            document.getElementById("oppervlakteGroot").classList.add("hidden");
            document.getElementById("kamers").classList.remove("hidden");
        }
        if (targetId === "audioJa") document.getElementById("audioBedrag").classList.remove("hidden");
        if (targetId === "audioNee") document.getElementById("audioBedrag").classList.add("hidden");
        if (targetId === "sieradenJa") document.getElementById("sieradenBedrag").classList.remove("hidden");
        if (targetId === "sieradenNee") document.getElementById("sieradenBedrag").classList.add("hidden");
        if (targetId === "bezittingenJa") document.getElementById("bezittingenBedrag").classList.remove("hidden");
        if (targetId === "bezittingenNee") document.getElementById("bezittingenBedrag").classList.add("hidden");
        if (targetId === "huurJa") document.getElementById("huurBedrag").classList.remove("hidden");
        if (targetId === "huurNee") document.getElementById("huurBedrag").classList.add("hidden");
        if (targetId === "eigenaarJa") document.getElementById("eigenaarBedrag").classList.remove("hidden");
        if (targetId === "eigenaarNee") document.getElementById("eigenaarBedrag").classList.add("hidden");
    });
});

document.getElementById("woningType").addEventListener("change", (e) => {
    const value = e.target.value;
    document.getElementById("huurdersbelang").classList.add("hidden");
    document.getElementById("eigenaarsbelang").classList.add("hidden");
    if (value === "Huurwoning") document.getElementById("huurdersbelang").classList.remove("hidden");
    if (value === "Koopappartement") document.getElementById("eigenaarsbelang").classList.remove("hidden");
});

// Formulier verzenden
document.getElementById("inventoryForm").addEventListener("submit", (e) => {
    e.preventDefault();

    // Toon loadingscreen
    document.getElementById("loadingScreen").style.display = "flex";

    const formData = new FormData(e.target);
    const data = {
        polisnummer: formData.get("polisnummer"),
        email: formData.get("email") || "",
        leeftijd: formData.get("leeftijd"),
        gezinssamenstelling: formData.get("gezinssamenstelling"),
        inkomen: formData.get("inkomen"),
        oppervlakte: formData.get("oppervlakte"),
        aantalKamers: formData.get("aantalKamers") || "N.v.t.",
        totaleOppervlakte: formData.get("totaleOppervlakte") || "N.v.t.",
        audio: formData.get("audio"),
        audioExtra: formData.get("audioExtra") || "N.v.t.",
        sieraden: formData.get("sieraden"),
        sieradenExtra: formData.get("sieradenExtra") || "N.v.t.",
        bezittingen: formData.get("bezittingen"),
        bezittingenExtra: formData.get("bezittingenExtra") || "N.v.t.",
        woningType: formData.get("woningType"),
        huurdersbelang: formData.get("huurdersbelang") || "N.v.t.",
        huurExtra: formData.get("huurExtra") || "N.v.t.",
        eigenaarsbelang: formData.get("eigenaarsbelang") || "N.v.t.",
        eigenaarExtra: formData.get("eigenaarExtra") || "N.v.t.",
        handtekening: signaturePad.isEmpty() ? "Niet aanwezig" : "Aanwezig"
    };

    // Maak een nette samenvatting voor de e-mail
    const message = `
        Polisnummer: ${data.polisnummer}
        E-mailadres: ${data.email || "Niet opgegeven"}
        Leeftijd hoofdkostwinner: ${data.leeftijd}
        Gezinssamenstelling: ${data.gezinssamenstelling}
        Netto maandinkomen: ${data.inkomen}
        Oppervlakte woning > 300 m²: ${data.oppervlakte}
        Aantal kamers: ${data.aantalKamers}
        Totale oppervlakte: ${data.totaleOppervlakte}
        Audiovisuele/computerapparatuur > €12.000: ${data.audio}
        Extra bedrag audio: ${data.audioExtra}
        Lijfsieraden > €6.000: ${data.sieraden}
        Extra bedrag sieraden: ${data.sieradenExtra}
        Bijzondere bezittingen > €15.000: ${data.bezittingen}
        Extra bedrag bezittingen: ${data.bezittingenExtra}
        Type woning: ${data.woningType}
        Huurdersbelang > €6.000: ${data.huurdersbelang}
        Extra bedrag huurdersbelang: ${data.huurExtra}
        Eigenaarsbelang > €6.000: ${data.eigenaarsbelang}
        Extra bedrag eigenaarsbelang: ${data.eigenaarExtra}
        Handtekening: ${data.handtekening}
    `;

    const emailData = {
        message: message,
        to_email: data.email ? data.email : "rbuijs@klaasvis.nl" // Standaard naar rbuijs@klaasvis.nl als geen e-mail
    };

    // Verzenden naar jou (template_l7dk1hc)
    const sendToMe = emailjs.send("service_lpsiijc", "template_l7dk1hc", { message: message });
    // Verzenden naar klant of rbuijs@klaasvis.nl (template_ksj01md)
    const sendToClient = emailjs.send("service_lpsiijc", "template_ksj01md", emailData);

    Promise.all([sendToMe, sendToClient])
        .then(() => {
            setTimeout(() => {
                window.location.href = "https://www.klaasvis.nl";
            }, 2000); // 2 seconden delay voor redirect
        })
        .catch(err => {
            console.error("Fout bij verzenden:", err);
            document.getElementById("loadingScreen").style.display = "none";
            alert("Er is een fout opgetreden bij het verzenden.");
        });
});