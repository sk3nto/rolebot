const adminChannelId = '1503272827963572256';
const roleId = '1503082144044548223';
const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// КАНАЛ ГДЕ СТОИТ КНОПКА
const panelChannelId = '1503072689357717516';

// КАНАЛ КУДА ПРИХОДЯТ ЗАЯВКИ (АДМИНЫ)
const adminChannelId = '1503272827963572256'; // <-- ВСТАВЬ СЮДА

client.once('ready', async () => {
    console.log(`Бот запущен как ${client.user.tag}`);

    const channel = await client.channels.fetch(panelChannelId);

    const embed = new EmbedBuilder()
        .setTitle('Система запроса роли')
        .setDescription(
            'Для получения игровой роли нажмите кнопку ниже.\n\nЗаявка будет рассмотрена администрацией.'
        )
        .setColor('#2f3136')
        .setThumbnail('https://media.discordapp.net/attachments/1503072689357717516/1503259813914869810/SFPD-GTASA-logo.png');

    const button = new ButtonBuilder()
        .setCustomId('role_request')
        .setLabel('Запросить роль')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({
        embeds: [embed],
        components: [row]
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'role_request') {

        // 1. Ответ пользователю (скрыто)
        await interaction.reply({
            content: '✅ Ваша заявка отправлена на рассмотрение.',
            ephemeral: true
        });

        // 2. Отправка в админ-канал
        const adminChannel = await client.channels.fetch(adminChannelId);

        adminChannel.send({
            content: `📩 Новая заявка на роль от **${interaction.member.displayName}** (ID: ${interaction.user.id})`
        });
    }
});

client.login(process.env.TOKEN);
