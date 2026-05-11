const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const http = require('http');

// ===================== Render FIX =====================
http.createServer((req, res) => {
    res.end('Bot is alive');
}).listen(process.env.PORT || 3000);

// ===================== BOT =====================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ===================== ID =====================
const panelChannelId = '1503072689357717516';
const adminChannelId = '1503272827963572256';
const roleId = '1503082144044548223';

// ===================== READY =====================

client.once('ready', async () => {
    console.log(`Бот запущен как ${client.user.tag}`);

    try {
        const channel = await client.channels.fetch(panelChannelId);

        const embed = new EmbedBuilder()
            .setTitle('Система запроса роли')
            .setDescription('Нажмите кнопку для получения роли')
            .setColor('#2f3136');

        const button = new ButtonBuilder()
            .setCustomId('role_request')
            .setLabel('Запросить роль')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await channel.send({
            embeds: [embed],
            components: [row]
        });

    } catch (err) {
        console.log('Ошибка панели:', err);
    }
});

// ===================== BUTTONS =====================

client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;

    try {

        // ===================== REQUEST =====================
        if (interaction.customId === 'role_request') {

            await interaction.deferReply({ ephemeral: true });

            const adminChannel = await client.channels.fetch(adminChannelId);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_${interaction.user.id}`)
                    .setLabel('Одобрить')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`deny_${interaction.user.id}`)
                    .setLabel('Отказать')
                    .setStyle(ButtonStyle.Danger)
            );

            await adminChannel.send({
                content: `📩 Заявка от **${interaction.member.displayName}** (<@${interaction.user.id}>)`,
                components: [row]
            });

            return interaction.editReply('✅ Заявка отправлена');
        }

        // ===================== APPROVE =====================
        if (interaction.customId.startsWith('approve_')) {

            await interaction.deferReply();

            const userId = interaction.customId.split('_')[1];
            const member = await interaction.guild.members.fetch(userId);

            await member.roles.add(roleId);

            await interaction.editReply(`🟢 Одобрено: <@${userId}>`);

            await interaction.message.edit({ components: [] });
        }

        // ===================== DENY =====================
        if (interaction.customId.startsWith('deny_')) {

            await interaction.deferReply();

            const userId = interaction.customId.split('_')[1];

            await interaction.editReply(`🔴 Отклонено: <@${userId}>`);

            await interaction.message.edit({ components: [] });
        }

    } catch (err) {
        console.log('ERROR:', err);

        if (!interaction.replied) {
            await interaction.reply({
                content: '❌ Ошибка кнопки',
                ephemeral: true
            });
        }
    }
});

// ===================== LOGIN =====================

client.login(process.env.TOKEN);
