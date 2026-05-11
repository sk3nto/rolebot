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

// ===================== RENDER FIX (Web Service) =====================
app.get('/', (req, res) => {
    res.send('Bot is alive');
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Web server started');
});

// ===================== CONFIG =====================
const TOKEN = process.env.TOKEN;

const panelChannelId = '1503072689357717516';
const adminChannelId = '1503272827963572256';
const roleId = '1503082144044548223';

// ===================== CLIENT =====================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ===================== READY =====================
client.once('ready', () => {
    console.log(`Бот запущен как ${client.user.tag}`);
});

// ===================== PANEL COMMAND =====================
client.on('messageCreate', async message => {

    if (message.author.bot) return;

    if (message.content === '!panel') {

        const embed = new EmbedBuilder()
            .setTitle('Система запроса роли')
            .setDescription('Нажмите кнопку ниже для подачи заявки')
            .setColor('#2f3136');

        const button = new ButtonBuilder()
            .setCustomId('role_request')
            .setLabel('Запросить роль')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
});

// ===================== BUTTONS =====================
client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;

    try {

        // ===================== REQUEST =====================
        if (interaction.customId === 'role_request') {

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

            return interaction.reply({
                content: '✅ Заявка отправлена',
                flags: 64
            });
        }

        // ===================== APPROVE =====================
        if (interaction.customId.startsWith('approve_')) {

            await interaction.deferUpdate(); // ключ к стабильности

            const userId = interaction.customId.split('_')[1];

            const member = await interaction.guild.members.fetch(userId);

            if (!member.roles.cache.has(roleId)) {
                await member.roles.add(roleId);
            }

            await interaction.message.edit({
                content: `🟢 Одобрено: <@${userId}>`,
                components: []
            });

            return;
        }

        // ===================== DENY =====================
        if (interaction.customId.startsWith('deny_')) {

            await interaction.deferUpdate();

            const userId = interaction.customId.split('_')[1];

            await interaction.message.edit({
                content: `🔴 Отклонено: <@${userId}>`,
                components: []
            });

            return;
        }

    } catch (err) {
        console.log('INTERACTION ERROR:', err);
    }
});

// ===================== LOGIN =====================
client.login(TOKEN);
