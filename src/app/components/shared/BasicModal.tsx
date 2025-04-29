"use client";
/**
 * Module de fenêtre modale basique (BasicModal)
 * 
 * Ce composant fournit une fenêtre modale réutilisable pour l'application.
 * Il permet d'afficher un contenu contextuel sans naviguer vers une nouvelle page.
 * La modale est utilisée pour diverses fonctionnalités comme les formulaires, les confirmations
 * ou l'affichage de détails supplémentaires.
 */

import * as React from "react";

/**
 * Interface définissant les propriétés du composant BasicModal
 * 
 * @property {string | React.ReactNode} openLabel - Texte ou élément à afficher dans le bouton d'ouverture
 * @property {string} modalTitle - Titre de la modale
 * @property {React.CSSProperties} sx - Propriétés de style supplémentaires (optionnel)
 * @property {string} modalLabel - Sous-titre ou description de la modale
 * @property {React.ReactNode} icon - Icône à afficher dans le bouton d'ouverture (optionnel)
 * @property {React.ReactNode} children - Contenu à afficher dans la modale
 */
interface BasicModalProps {
  openLabel: string | React.ReactNode;
  modalTitle: string;
  sx?: React.CSSProperties;
  modalLabel: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Composant de modale basique réutilisable
 * Fournit une interface cohérente pour afficher des fenêtres modales dans l'application
 * 
 * @param {BasicModalProps} props - Les propriétés du composant
 * @returns {JSX.Element} - Le composant rendu
 */
export const BasicModal: React.FC<BasicModalProps> = ({
  openLabel,
  modalLabel,
  icon,
  modalTitle,
  sx,
  children,
}) => {
  // État pour contrôler l'ouverture/fermeture de la modale
  const [open, setOpen] = React.useState<boolean>(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <React.Fragment>
      {/* Bouton déclencheur pour ouvrir la modale */}
      <button
        style={sx}
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-transparent border border-[#335C67] text-[#335C67] hover:bg-[#335C67]/10 rounded transition-colors flex items-center gap-2"
      >
        {icon} {openLabel}
      </button>

      {/* Composant dialog natif pour la modale */}
      <dialog
        ref={dialogRef}
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        className="fixed inset-0 m-auto bg-transparent p-0"
        onClick={(e) => {
          // Close when clicking outside the dialog content
          if (e.target === dialogRef.current) setOpen(false);
        }}
      >
        {/* Contenu de la modale avec style */}
        <div className="bg-[#2a2a2a] max-w-lg border border-gray-600 rounded-md p-6 shadow-xl">
          {/* Bouton de fermeture en haut à droite */}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
          >
            ×
          </button>

          {/* Titre de la modale */}
          <h2
            id="modal-title"
            className="text-xl font-bold mb-2 text-white"
          >
            {modalTitle}
          </h2>

          {/* Sous-titre ou description de la modale */}
          <p
            id="modal-desc"
            className="text-sm font-medium text-gray-400 mb-4"
          >
            {modalLabel}
          </p>

          {/* Contenu principal de la modale (transmis via children) */}
          <div className="mt-4">
            {children}
          </div>
        </div>
      </dialog>
    </React.Fragment>
  );
};
