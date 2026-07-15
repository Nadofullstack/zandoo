import LoginBrandPanel from '../../components/auth/LoginBrandPanel';
import LoginForm from '../../components/auth/LoginForm';

/**
 * Page de connexion — /connexion
 * L'ensemble (panneau gauche + formulaire) est centré dans un conteneur
 * de largeur maximale pour ne pas occuper tout l'écran.
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#eef1f8] flex items-center justify-center px-4 py-6">
      {/* Conteneur centré — légèrement plus étroit que le register */}
      <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden">

        {/* Panneau gauche : image et accroche */}
        <LoginBrandPanel />

        {/* Panneau droit : formulaire de connexion — padding non réduit */}
        <section className="flex-1 flex flex-col justify-center items-center px-8 py-8 bg-[#FDFDFD] overflow-y-auto">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </section>

      </div>
    </main>
  );
}
