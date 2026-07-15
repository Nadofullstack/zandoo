/* URLs des avatars de la preuve sociale */
const AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBv0eRy7XKzbRw0F6LSgJ83uQtkM2msYkyLAMV4KBzVMueDzuFlNJqYwhch7lSyl7Kg3UhBMWTEu-ULmRAX8a4rz0THb9yYgKTzzhThhljgIke8_a8eY9WTvcRjYrWewHx38rlitrnKmGpkTv1VMt9_WSocg5t5kQrpV9JmrGVVsrSYFxNl-saF91taTi2gMXW8A7z6nSGdPvHvYzwRhLKZOXtujFzcMwE8qJgakpimBlqpQyQsp364LOSTMf1a9fmPkGUJhZ-I4HT6',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCNXQgZlc9wRJHW55nao80iOnKsGQI1nlcW08AcYNErrKe5niIuBMglPZlNAdkN4D42RaSGHnngK0S7WMQ4A7ThBYUcWSEGr2JpIl_8NvKePelxz7gBHdalyScx1V1_9JuXikZwIvnF73pw7-1vDbCrgsaQS2cxOuCvT4pl1YiEgFQPCzdm1l41j_yFj-bkfHMmLM-DT-M-zqruDho7oqyuxM_syRNyCKIUhv8kRpIeorJOiHYeGIlfquL0EWMSImJByDB3HUWMAbSu',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBkAEO92D31Lv0re0r9DD2T1UBjUiKFM4w-V0uhEZvCJsrjKX9nDxdKFIO5T1lY-KFEi7AjcMaGDiGC7IphzQWNxoTOBsFiU7dQFwHd0FSEqJ6yGNNy4NJouzPGxhdVnc4N3K53yhUXu_iyZlbz4Xm5Q2ztcwVPv7dWHd8UsvYI-oS2INZcGVk0b5SX4LC1OMeLBFKjpNi5c2J3EoVLhaQ1J5ixbHAb8csAi45L6B5E_7A9luF1irkcYoEo3MPEVL5vT6lLGIifu14-',
];

/* URL de l'image d'arrière-plan fournie */
const IMAGE_FOND = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH2acAUkl79ynltFnnw3Xf49TY839pzqwqHiZmKh6VjHMuHskznZaSFxTV0Mr1wQywDlMHAyJ0ObH0UuOnEADlZ77Qk6UCuKKGmNOzbjOichm5iinm52n8YGLwGWbYyEUBAIJeN9rixtXVRf5Ahq2fdYD5fIH19i7iU7jHqKQGtcVDuPsxeHz3Xsf6k_XoBjvBp0BPtb5_mCKZHQBz16XuttzhOgVCD8zIaZcqtp_f5riqX8n2z6cRz01pZ9miNUMhGNrq2EgkBEhu';

/**
 * Panneau gauche de la page de connexion.
 * Affiche l'image de fond, le logo, le titre et la preuve sociale.
 * Masqué sur mobile, visible à partir de md.
 */
export default function LoginBrandPanel() {
  return (
    <section className="relative hidden md:flex w-[50%] shrink-0 overflow-hidden min-h-[420px]">
      {/* Fond : image + overlays sombres */}
      <div className="absolute inset-0 z-0">
        <img
          src={IMAGE_FOND}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        {/* Superposition de couleur */}
        <div className="absolute inset-0 bg-[#011023]/60 mix-blend-multiply" />
        {/* Dégradé du bas vers le haut */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#011023] via-[#011023]/20 to-transparent" />
      </div>

      {/* Contenu positionné par-dessus l'image */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between text-white">
        {/* Logo en haut */}
        <div className="flex items-center">
         
        </div>

        {/* Accroche principale et preuve sociale */}
        <div className="max-w-sl">
          <h1 className="text-3xl font-extrabold mb-2 leading-snug tracking-tight">
            Connectez votre business <span className="text-[#FC7701]">au marché global.</span>
          </h1>
          <p className="text-sl opacity-90 leading-relaxed mb-3">
            La plateforme de référence pour le commerce moderne en Afrique de l'Ouest.
            Gérez vos stocks, vos ventes et vos clients en toute simplicité.
          </p>

          {/* Preuve sociale : photos réelles + compteur */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {AVATARS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Marchand ZANDOO"
                  className="w-9 h-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <span className="text-xs font-semibold">
              +5 000 marchands nous font confiance
            </span>
          </div>
        </div>

        {/* Pied de page */}
        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} ZANDOO Marketplace. Tous droits réservés.
        </p>
      </div>
    </section>
  );
}
