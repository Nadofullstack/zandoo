import { useState, useEffect } from 'react';
import { Store, Camera, Loader2 } from 'lucide-react';
import DispositionVendeur from '../../components/vendeur/layout/DispositionVendeur';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { useBoutiqueVendeur } from '../../hooks/vendeur/useBoutiqueVendeur';
import { uploadPhotos } from '../../services/vendeur/vendeurUploadService';

interface FormBoutique {
  nomEntreprise: string;
  descriptionBoutique: string;
  secteurActivite: string;
  emailContact: string;
  telephoneContact: string;
  adresseVille: string;
  adressePays: string;
  logo: string;
  banniere: string;
}

export default function BoutiquePage() {
  const { boutique, chargement, chargementSave, erreur, messageSucces, sauvegarder } = useBoutiqueVendeur();
  const [form, setForm] = useState<FormBoutique>({
    nomEntreprise: '', descriptionBoutique: '', secteurActivite: '',
    emailContact: '', telephoneContact: '', adresseVille: '', adressePays: 'Bénin',
    logo: '', banniere: '',
  });
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreurLocale, setErreurLocale]   = useState<string | null>(null);

  /* Pré-remplir le formulaire quand la boutique est chargée */
  useEffect(() => {
    if (!boutique) return;
    setForm({
      nomEntreprise:      boutique.nomEntreprise ?? '',
      descriptionBoutique: boutique.descriptionBoutique ?? '',
      secteurActivite:    boutique.secteurActivite ?? '',
      emailContact:       boutique.emailContact ?? '',
      telephoneContact:   boutique.telephoneContact ?? '',
      adresseVille:       boutique.adresse?.ville ?? '',
      adressePays:        boutique.adresse?.pays ?? 'Bénin',
      logo:               boutique.logo ?? '',
      banniere:           boutique.banniere ?? '',
    });
  }, [boutique]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadEnCours(true);
    setErreurLocale(null);
    try {
      const [url] = await uploadPhotos([f]);
      setForm((p) => ({ ...p, logo: url }));
    } catch {
      setErreurLocale('Erreur lors de l\'upload du logo.');
    } finally {
      setUploadEnCours(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUploadBanniere = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadEnCours(true);
    setErreurLocale(null);
    try {
      const [url] = await uploadPhotos([f]);
      setForm((p) => ({ ...p, banniere: url }));
    } catch {
      setErreurLocale('Erreur lors de l\'upload de la bannière.');
    } finally {
      setUploadEnCours(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    await sauvegarder({
      nomEntreprise:      form.nomEntreprise.trim(),
      descriptionBoutique: form.descriptionBoutique.trim(),
      secteurActivite:    form.secteurActivite.trim(),
      emailContact:       form.emailContact.trim(),
      telephoneContact:   form.telephoneContact.trim(),
      adresse:            { ville: form.adresseVille.trim(), pays: form.adressePays.trim() },
      logo:               form.logo || undefined,
      banniere:           form.banniere || undefined,
    });
  };

  if (chargement) {
    return (
      <DispositionVendeur>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-200" />
        </div>
      </DispositionVendeur>
    );
  }

  return (
    <DispositionVendeur>
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2">
          <Store size={22} className="text-accent" aria-hidden />
          Ma boutique
        </h1>
        <p className="text-sm text-[#74777d] mt-1">Personnalisez votre boutique et vos informations commerciales.</p>
      </header>

      {(erreur || erreurLocale) && <div className="mb-5"><Alert variant="error">{erreur ?? erreurLocale}</Alert></div>}
      {messageSucces && <div className="mb-5"><Alert variant="success">{messageSucces}</Alert></div>}

      <form onSubmit={handleSoumettre} className="space-y-6">

        {/* Médias — logo + bannière */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Bannière */}
          <div className="relative h-40 bg-gray-100">
            {form.banniere ? (
              <img src={form.banniere} alt="Bannière" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Aucune bannière
              </div>
            )}
            <label
              htmlFor="input-banniere"
              className="absolute bottom-3 right-3 cursor-pointer flex items-center gap-1.5 bg-white border border-gray-200 text-primary text-xs font-semibold px-3 py-1.5 rounded-xl shadow hover:bg-gray-50 transition-colors"
            >
              <Camera size={13} aria-hidden /> Changer la bannière
              <input id="input-banniere" type="file" accept="image/*" className="sr-only" onChange={handleUploadBanniere} />
            </label>
          </div>

          {/* Logo */}
          <div className="px-6 pb-5 flex items-end gap-4 -mt-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-4 border-white shadow bg-gray-100 overflow-hidden">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Store size={32} />
                  </div>
                )}
              </div>
              <label
                htmlFor="input-logo"
                className="absolute -bottom-1 -right-1 cursor-pointer w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center shadow hover:bg-accent/90 transition-colors"
                title="Modifier le logo"
              >
                <Camera size={13} aria-hidden />
                <input id="input-logo" type="file" accept="image/*" className="sr-only" onChange={handleUploadLogo} />
              </label>
            </div>
            {uploadEnCours && (
              <div className="flex items-center gap-2 text-xs text-accent">
                <Loader2 size={13} className="animate-spin" aria-hidden /> Upload en cours…
              </div>
            )}
          </div>
        </div>

        {/* Informations boutique */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Informations générales</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nomEntreprise" className="label-admin">Nom de l'entreprise *</label>
              <input id="nomEntreprise" name="nomEntreprise" type="text" required
                value={form.nomEntreprise} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20" />
            </div>
            <div>
              <label htmlFor="secteurActivite" className="label-admin">Secteur d'activité</label>
              <input id="secteurActivite" name="secteurActivite" type="text"
                value={form.secteurActivite} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20" />
            </div>
          </div>

          <div>
            <label htmlFor="descriptionBoutique" className="label-admin">Description de la boutique</label>
            <textarea id="descriptionBoutique" name="descriptionBoutique" rows={4} maxLength={1000}
              value={form.descriptionBoutique} onChange={handleChange}
              placeholder="Décrivez votre boutique, vos produits, votre histoire…"
              className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20 resize-none" />
            <p className="text-xs text-gray-400 text-right mt-1">{form.descriptionBoutique.length}/1000</p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Contact & Adresse</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emailContact" className="label-admin">E-mail de contact</label>
              <input id="emailContact" name="emailContact" type="email"
                value={form.emailContact} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20" />
            </div>
            <div>
              <label htmlFor="telephoneContact" className="label-admin">Téléphone de contact</label>
              <input id="telephoneContact" name="telephoneContact" type="tel"
                value={form.telephoneContact} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20" />
            </div>
            <div>
              <label htmlFor="adresseVille" className="label-admin">Ville</label>
              <input id="adresseVille" name="adresseVille" type="text"
                value={form.adresseVille} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20" />
            </div>
            <div>
              <label htmlFor="adressePays" className="label-admin">Pays</label>
              <input id="adressePays" name="adressePays" type="text"
                value={form.adressePays} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#c4c6cd] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/20" />
            </div>
          </div>
        </div>

        {/* Bouton */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={chargementSave || uploadEnCours}
            loadingText="Sauvegarde…" className="!w-auto px-8 py-2.5">
            Sauvegarder
          </Button>
        </div>
      </form>
    </DispositionVendeur>
  );
}
