import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import type { Categorie } from '../../../types/admin';

interface Props {
    categories: Categorie[];
    onEditer: (cat: Categorie) => void;
    onSupprimer: (cat: Categorie) => void;
    onAjouterSous: (parent: Categorie) => void;
    chargementAction: boolean;
}

/**
 * Arbre de catégories avec accordéon pour les sous-catégories.
 */
export default function ArbreCategories({ categories, onEditer, onSupprimer, onAjouterSous, chargementAction }: Props) {
    const [ouvertes, setOuvertes] = useState<Set<string>>(new Set());

    const basculer = (id: string) =>
        setOuvertes((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });

    if (categories.length === 0) {
        return <p className="text-center py-12 text-sm text-[#74777d]">Aucune catégorie. Créez-en une.</p>;
    }

    return (
        <div className="space-y-2">
            {categories.map((cat) => {
                const hasSous = (cat.sousCategories?.length ?? 0) > 0;
                const isOuverte = ouvertes.has(cat._id);

                return (
                    <div key={cat._id} className="rounded-xl border border-gray-200 overflow-hidden">
                        {/* Ligne catégorie racine */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50/60 transition-colors">
                            <div className="flex items-center gap-2">
                                {hasSous ? (
                                    <button onClick={() => basculer(cat._id)} className="text-gray-400 hover:text-primary transition-colors">
                                        {isOuverte ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </button>
                                ) : (
                                    <div className="w-4" />
                                )}
                                <div>
                                    <span className="font-semibold text-primary text-sm">{cat.nom}</span>
                                    <span className="ml-2 text-xs text-[#74777d]">/{cat.slug}</span>
                                    {!cat.active && (
                                        <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Inactif</span>
                                    )}
                                    {cat.attributs.length > 0 && (
                                        <span className="ml-2 text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                                            {cat.attributs.length} attribut{cat.attributs.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={() => onAjouterSous(cat)} title="Ajouter sous-catégorie"
                                    disabled={chargementAction}
                                    className="p-1.5 rounded-lg text-accent hover:bg-accent/10 transition-colors disabled:opacity-50">
                                    <Plus size={15} />
                                </button>
                                <button onClick={() => onEditer(cat)} title="Modifier"
                                    disabled={chargementAction}
                                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => onSupprimer(cat)} title="Supprimer"
                                    disabled={chargementAction}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Sous-catégories */}
                        {hasSous && isOuverte && (
                            <div className="border-t border-gray-100">
                                {cat.sousCategories!.map((sc) => (
                                    <div key={sc._id}
                                        className="flex items-center justify-between px-4 py-2.5 pl-10 bg-gray-50/40 border-t border-gray-100 first:border-t-0 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                                            <span className="text-sm text-primary">{sc.nom}</span>
                                            <span className="text-xs text-[#74777d]">/{sc.slug}</span>
                                            {!sc.active && (
                                                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Inactif</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => onEditer(sc)} title="Modifier"
                                                disabled={chargementAction}
                                                className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => onSupprimer(sc)} title="Supprimer"
                                                disabled={chargementAction}
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
