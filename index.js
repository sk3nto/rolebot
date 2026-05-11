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

// ===================== CONFIG =====================
const panelChannelId = '1503072689357717516';
const adminChannelId = '1503272827963572256';
const roleId = '1503082144044548223';

// защита от спама панели
let panelSent = false;

// ===================== READY =====================
client.once('ready', async () => {
    console.log(`Бот запущен как ${client.user.tag}`);

    try {
        const channel = await client.channels.fetch(panelChannelId);

        if (!panelSent) {
            const embed = new EmbedBuilder()
                .setTitle('Система запроса роли')
                .setDescription('Нажмите кнопку для отправки заявки')
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

            panelSent = true;
        }

    } catch (err) {
        console.log('READY ERROR:', err);
    }
});

// ===================== INTERACTIONS =====================
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

            const userId = interaction.customId.split('_')[1];

            await interaction.deferReply();

            try {
                const member = await interaction.guild.members.fetch(userId);

                await member.roles.add(roleId);

                await interaction.editReply(`🟢 Одобрено: <@${userId}> (роль выдана)`);

                await interaction.message.edit({ components: [] });

            } catch (err) {
                console.log('ROLE ERROR:', err);

                await interaction.editReply(
                    '❌ Одобрено, но роль НЕ выдана (проверь права или иерархию ролей)'
                );
            }
        }

        // ===================== DENY =====================
        if (interaction.customId.startsWith('deny_')) {

            const userId = interaction.customId.split('_')[1];

            await interaction.deferReply();

            await interaction.editReply(`🔴 Отклонено: <@${userId}>`);

            await interaction.message.edit({ components: [] });
        }

    } catch (err) {
        console.log('INTERACTION ERROR:', err);

        if (!interaction.replied) {
            await interaction.reply({
                content: '❌ Ошибка обработки кнопки',
                ephemeral: true
            });
        }
    }
});

// ===================== LOGIN =====================
client.login(process.env.TOKEN);
