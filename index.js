require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { createVoiceId, notificationRoleId } = require('./config.json');
const JOIN_COOLDOWN = 5 * 60 * 1000; // 5 minutes par membre
const SERVER_COOLDOWN = 5 * 60 * 1000; // 5 minutes global serveur
const AUTO_CLEAN_DELAY = 3 * 60 * 1000; // 3 minutes pour supprimer l'embed
const lastJoinMap = new Map();
let lastServerPing = 0;
const timeoutMap = new Map();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});


client.on(Events.VoiceStateUpdate, async (oldState, newState) => {

  if (!newState.channel || newState.channel.id === createVoiceId) return; // ignore les leaves et « Créer votre vocal de draftbot »
  if (oldState.channel && oldState.channel.id === newState.channel.id) return; // ignore les moves
  if (newState.channel.members.size > 1) return; // quelqu'un est déjà là ? pas besoin de bouton

  const now = Date.now();
  const member = newState.member;

  // Anti‑spam membre 
  if (lastJoinMap.has(member.id) && now - lastJoinMap.get(member.id) < JOIN_COOLDOWN) {
    return;
  }

  //  Anti‑spam global 
  if (now - lastServerPing < SERVER_COOLDOWN) return;


  lastJoinMap.set(member.id, now);
  lastServerPing = now;

  const { channel } = newState;
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('On est en vocal !')
    .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
    .setDescription(`a rejoint **${channel.name}**. Tu viens ?`)
    .setThumbnail(member.displayAvatarURL())
    .addFields({ name: 'Actuellement dans le salon', value: `${channel.members.size} 👤` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ping_role')
      .setStyle(ButtonStyle.Primary)
      .setLabel('📢 Ping le rôle'),
    new ButtonBuilder()
      .setCustomId('no_ping')
      .setStyle(ButtonStyle.Secondary)
      .setLabel('🚫 Pas de ping'),
  );

  try {
    const message = await channel.send({ embeds: [embed], components: [row] });

    //  Auto‑clean 
    const timer = setTimeout(() => {
      message.delete().catch(() => { });
      timeoutMap.delete(message.id);
    }, AUTO_CLEAN_DELAY);

    timeoutMap.set(message.id, timer);
  } catch (err) {
    console.error('Erreur d’envoi dans le salon vocal :', err);
  }
});


//Bouton de gestion des interactions

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const role = interaction.guild.roles.cache.get(notificationRoleId);
  if (!role) {
    return interaction.reply({ content: '⚠️ Rôle introuvable.', ephemeral: true });
  }

  const clearAndDelete = async () => {
    const msgId = interaction.message.id;
    if (timeoutMap.has(msgId)) {
      clearTimeout(timeoutMap.get(msgId));
      timeoutMap.delete(msgId);
    }
    await interaction.message.delete().catch(() => { });
  };

  switch (interaction.customId) {
    case 'ping_role': {
      await interaction.reply({
        content: `${interaction.user} est en vocal, viens le rejoindre <@&${notificationRoleId}>`,
        allowedMentions: { roles: [notificationRoleId] },
      });
      await clearAndDelete();
      break;
    }

    case 'no_ping': {
      await interaction.reply({ content: 'Pas de problème ! 👌', ephemeral: true });
      await clearAndDelete();
      break;
    }
  }
});


// Lancement du bot

const token = process.env.DISCORD_TOKEN || process.env.TOKEN;
if (!token) {
  console.error('❌ Aucun token trouvé dans .env');
  process.exit(1);
}
client.login(token);
