# BALLIN Paris — Site e-commerce de joaillerie de luxe

Site vitrine + e-commerce complet, 100 % statique (HTML/CSS/JS, aucune dépendance externe,
viewer 3D WebGL écrit sur mesure). Tons clairs et chaleureux : ivoire, sable, or champagne.

## Structure

```
index.html                  Accueil (hero, collections, sélection, maison, pierres, sur-mesure)
fiancailles.html            Collection Fiançailles
alliances.html              Collection Alliances
joaillerie.html             Joaillerie + sous-navigation
bagues.html / bracelets.html / colliers.html / boucles-oreilles.html
produit.html?id=...         Page produit premium (galerie 2D + vue 3D interactive, options
                            métal/pierre/taille/gravure, accordéons, panier, recommandations)
la-maison.html              Histoire & savoir-faire
atelier.html                Les 5 étapes de fabrication
engagements.html            Éthique, certifications (Kimberley, RJC, Fairmined, GIA/HRD/IGI)
nos-pierres.html            Diamants (4C) & pierres précieuses
sav.html                    SAV, mise à taille offerte, entretien, baguier offert
contact.html                Formulaire de contact & coordonnées
garanties.html              Garantie à vie, réparations certifiées, certificats
livraison-retours.html      Livraison offerte/assurée, retour gratuit 30 jours
cgv.html                    Conditions générales de vente
politique-de-confidentialite.html   RGPD
cookies.html                Politique de cookies + réinitialisation du consentement
assets/css/style.css        Design system
assets/js/data.js           Catalogue (20 produits) & textes
assets/js/main.js           Header/footer, panier, favoris, cookies, toasts
assets/js/category.js       Pages catégorie
assets/js/product.js        Page produit
assets/js/viewer3d.js       Viewer 3D WebGL maison (18 modèles de bijoux procéduraux)
assets/img/                 Logo SVG + 40 visuels SVG générés (tools/generate_assets.py)
```

## Lancer en local

```bash
cd <ce dossier>
python3 -m http.server 8000
# ouvrir http://localhost:8000
```

Aussi déployable tel quel sur GitHub Pages, Netlify, Vercel (dossier racine = ce dossier).

## Personnalisation

- **Ajouter un produit** : ajouter une entrée dans `PRODUCTS` (assets/js/data.js) + un SVG dans
  `assets/img/products/` (voir `tools/generate_assets.py` pour le style).
- **Couleurs** : variables CSS dans `:root` (assets/css/style.css).
- **Coordonnées** : téléphone, adresse, e-mails à remplacer dans le header, le footer et
  `contact.html` / pages légales.

## Notes

- Panier, favoris et consentement cookies fonctionnent en localStorage (démo côté client).
- Les rendus 3D sont générés procéduralement en WebGL (aucun fichier externe).
- Les visuels produits/pages sont des **photographies générées par IA** (assets/img/**/*.jpg),
  dans une direction artistique cohérente (ivoire, champagne, or) : à remplacer par les vraies
  photos produits pour la production. Logo, favicon et placeholder restent en SVG.
