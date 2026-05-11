const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Бот запущен как ${client.user.tag}`);

    const channel = await client.channels.fetch('1503072689357717516');

    const embed = new EmbedBuilder()
        .setTitle('Система запроса роли')
        .setDescription(
            'Для получения игровой роли заполните форму, нажав на кнопку ниже.\n\nЗаявка будет рассмотрена администрацией в кратчайшие сроки.\n\nby c. edison'
        )
        .setColor('#2f3136')
        .setThumbnail('https://media.discordapp.net/attachments/1503072689357717516/1503259813914869810/SFPD-GTASA-logo.png?ex=6a02b34c&is=6a0161cc&hm=758146485d5b19e452ff6e0536b29ee01851856375434eddf0be7cf584321a6f&=&format=webp&quality=lossless');

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
        await interaction.reply({
            content: 'Ваша заявка на роль отправлена.',
            ephemeral: true
        });
    }
});

client.login('MTUwMzI1NjY5Mjg4Njg2Mzk4NA.Gsgei8.GOxTDlvQOwwnVIbAhYbdEYcexf7mXRQ1lGHXrA');