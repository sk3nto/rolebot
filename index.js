const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const http = require('http');

// ===================== RENDER FIX =====================
http.createServer((req, res) => {
    res.writeHead(200);
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

// ===================== READY =====================
client.once('ready', async () => {

    console.log(`Бот запущен как ${client.user.tag}`);

    try {

        const channel = await client.channels.fetch(panelChannelId);

        // Проверка чтобы панель не спамилась
        const messages = await channel.messages.fetch({ limit: 10 });

        const existingPanel = messages.find(
            msg =>
                msg.author.id === client.user.id &&
                msg.components.length > 0
        );

        if (existingPanel) {
            console.log('Панель уже существует');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Система запроса роли')
            .setDescription(
                'Для получения игровой роли нажмите кнопку ниже.'
            )
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

        console.log('Панель отправлена');

    } catch (err) {
        console.log('READY ERROR:', err);
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
                content:
                    `📩 Заявка от **${interaction.member.displayName}** (<@${interaction.user.id}>)`,
                components: [row]
            });

            return interaction.reply({
                content: '✅ Заявка отправлена',
                ephemeral: true
            });
        }

        // ===================== APPROVE =====================
        if (interaction.customId.startsWith('approve_')) {

            const userId = interaction.customId.split('_')[1];

            const member = await interaction.guild.members.fetch(userId);

            // Если роль уже есть
            if (member.roles.cache.has(roleId)) {

                return interaction.reply({
                    content: '⚠️ У пользователя уже есть роль',
                    ephemeral: true
                });
            }

            // Выдача роли
            await member.roles.add(roleId);

            // Обновляем сообщение
            await interaction.message.edit({
                content: `🟢 Одобрено: <@${userId}>`,
                components: []
            });

            return interaction.reply({
                content: '✅ Роль выдана',
                ephemeral: true
            });
        }

        // ===================== DENY =====================
        if (interaction.customId.startsWith('deny_')) {

            const userId = interaction.customId.split('_')[1];

            await interaction.message.edit({
                content: `🔴 Отклонено: <@${userId}>`,
                components: []
            });

            return interaction.reply({
                content: '❌ Заявка отклонена',
                ephemeral: true
            });
        }

    } catch (err) {

        console.log('INTERACTION ERROR:', err);

        if (!interaction.replied) {

            return interaction.reply({
                content: '❌ Ошибка взаимодействия',
                ephemeral: true
            });
        }
    }
});

// ===================== LOGIN =====================
client.login(process.env.TOKEN);
