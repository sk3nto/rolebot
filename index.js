const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const express = require('express');
const app = express();

// 👉 ФИКС Render (порт)
app.get('/', (req, res) => {
    res.send('Bot is alive');
});

app.listen(3000, () => {
    console.log('Web server started (Render fix)');
});

// =====================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 🔧 ID
const panelChannelId = '1503072689357717516';
const adminChannelId = '1503272827963572256';
const roleId = '1503082144044548223';

// =====================

client.once('ready', async () => {
    console.log(`Бот запущен как ${client.user.tag}`);

    try {
        const channel = await client.channels.fetch(panelChannelId);

        const embed = new EmbedBuilder()
            .setTitle('Система запроса роли')
            .setDescription('Нажмите кнопку ниже для запроса роли')
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

// =====================

client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;

    // 👉 ЗАПРОС РОЛИ
    if (interaction.customId === 'role_request') {

        try {
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

            await interaction.reply({
                content: '✅ Заявка отправлена',
                ephemeral: true
            });

        } catch (err) {
            console.log('Ошибка заявки:', err);
        }
    }

    // 👉 ОДОБРЕНИЕ
    if (interaction.customId.startsWith('approve_')) {

        try {
            const userId = interaction.customId.split('_')[1];
            const member = await interaction.guild.members.fetch(userId);

            await member.roles.add(roleId);

            await interaction.update({
                content: `🟢 Одобрено: <@${userId}>`,
                components: []
            });

        } catch (err) {
            console.log('Ошибка выдачи роли:', err);
        }
    }

    // 👉 ОТКАЗ
    if (interaction.customId.startsWith('deny_')) {

        const userId = interaction.customId.split('_')[1];

        await interaction.update({
            content: `🔴 Отклонено: <@${userId}>`,
            components: []
        });
    }
});

// =====================

client.login(process.env.TOKEN);
