# Bot Discord – Ping Vocal

Un bot Discord qui annonce et permet de « pinger » un rôle lorsqu’un membre rejoint un salon vocal dédié.

## 📝 Description

Ce bot surveille les changements d’état vocal dans votre serveur Discord. Lorsqu’un utilisateur rejoint seul un salon vocal (autre que le salon de création), il envoie un embed dans ce salon avec deux boutons :

* **📢 Ping le rôle**
* **🚫 Pas de ping**

Si on clique sur « Ping le rôle », le bot mentionne le rôle configuré pour inviter les autres membres à le rejoindre. Le message est automatiquement supprimé après quelques minutes ou après interaction.

## 🚀 Prérequis

* Node.js v16.9.0 ou supérieur
* Un bot Discord enregistré (avec son **token**)
* Les intentions **Guilds**, **GuildVoiceStates**, **GuildMembers**, **GuildMessages**, **MessageContent** activées dans le portail Discord Developer

## 🛠 Installation

1. Clonez ce dépôt :

   ```bash
   git clone https://github.com/votre-orga/votre-bot-ping-vocal.git
   cd votre-bot-ping-vocal
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Créez un fichier `.env` à la racine et ajoutez-y votre token Discord :

   ```
   DISCORD_TOKEN=votre_token_ici
   ```

## ⚙️ Configuration

Le fichier `config.json` contient deux champs à adapter :

```json
{
  "createVoiceId": "ID_DU_SALON_DE_CREATION",
  "notificationRoleId": "ID_DU_ROLE_A_PINGER"
}
```

* **createVoiceId** : ID du salon vocal utilisé pour créer dynamiquement d’autres salons (à ignorer dans les pings).
* **notificationRoleId** : ID du rôle à mentionner lorsque l’on clique sur « Ping le rôle ».

## 📖 Utilisation

Lancez le bot avec :

```bash
npm start
```

Ou directement :

```bash
node index.js
```

### Comportement

* Lorsqu’un membre rejoint un salon vocal **(sauf le salon de création)** et qu’il est seul :

  1. Le bot envoie un embed avec le nom du salon, le nombre de participants (1) et deux boutons.
  2. Le message disparaît automatiquement au bout de 3 minutes ou dès qu’on interagit.
* **Boutons** :

  * **📢 Ping le rôle** : mentionne le rôle configuré pour inviter tout le monde.
  * **🚫 Pas de ping** : ferme simplement l’embed sans mention.

## 🔄 Cooldowns

* **Cooldown par membre** : 5 minutes entre deux tentatives de join+ping par le même utilisateur.
* **Cooldown global serveur** : 5 minutes entre deux pings dans tout le serveur.

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Forkez ce dépôt.
2. Créez une branche : `git checkout -b feature/ma-fonctionnalité`.
3. Committez vos changements : `git commit -m "Ajout : nouvelle fonctionnalité"`.
4. Pushez : `git push origin feature/ma-fonctionnalité`.
5. Ouvrez une Pull Request.

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
