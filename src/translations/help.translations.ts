import type { Language } from "../types/index.js";

// Как пользоваться
export const getHowToUseText = (lang: Language): string => {
    const texts: Record<Language, string> = {
        RU: `📖 КАК ПОЛЬЗОВАТЬСЯ LOOKORA

🚀 НАЧАЛО РАБОТЫ
1. Нажмите «Начать» в главном меню
2. Выберите тип анализа: внешность или стиль
3. Следуйте инструкциям и отправьте фото
4. Получите детальный анализ с рекомендациями

📸 ОЦЕНКА ВНЕШНОСТИ
• Отправьте фото лица спереди
• Затем фото в профиль (сбоку)
• Получите оценки по 8 параметрам
• Закажите персональные советы

👔 ОЦЕНКА СТИЛЯ
• Выберите контекст (работа, свидание и т.д.)
• Отправьте фото в полный рост
• Получите анализ образа и рекомендации

💬 КОМАНДЫ
/start - Главное меню
/wallet - Баланс и пополнение
/help - Эта справка
/language - Сменить язык`,

        EN: `📖 HOW TO USE LOOKORA

🚀 GETTING STARTED
1. Click «Get Started» in the main menu
2. Choose analysis type: appearance or style
3. Follow instructions and send a photo
4. Get detailed analysis with recommendations

📸 APPEARANCE RATING
• Send a front face photo
• Then a side profile photo
• Get ratings on 8 parameters
• Order personalized tips

👔 STYLE RATING
• Choose context (work, date, etc.)
• Send a full body photo
• Get outfit analysis and recommendations

💬 COMMANDS
/start - Main menu
/wallet - Balance and top-up
/help - This help
/language - Change language`,

        UA: `📖 ЯК КОРИСТУВАТИСЯ LOOKORA

🚀 ПОЧАТОК РОБОТИ
1. Натисніть «Почати» в головному меню
2. Виберіть тип аналізу: зовнішність або стиль
3. Дотримуйтесь інструкцій та надішліть фото
4. Отримайте детальний аналіз з рекомендаціями

📸 ОЦІНКА ЗОВНІШНОСТІ
• Надішліть фото обличчя спереду
• Потім фото в профіль (збоку)
• Отримайте оцінки за 8 параметрами
• Замовте персональні поради

👔 ОЦІНКА СТИЛЮ
• Виберіть контекст (робота, побачення тощо)
• Надішліть фото на повний зріст
• Отримайте аналіз образу та рекомендації

💬 КОМАНДИ
/start - Головне меню
/wallet - Баланс та поповнення
/help - Ця довідка
/language - Змінити мову`,

        ES: `📖 CÓMO USAR LOOKORA

🚀 COMENZAR
1. Haz clic en «Comenzar» en el menú principal
2. Elige el tipo de análisis: apariencia o estilo
3. Sigue las instrucciones y envía una foto
4. Obtén análisis detallado con recomendaciones

📸 EVALUACIÓN DE APARIENCIA
• Envía foto frontal del rostro
• Luego foto de perfil (lado)
• Obtén calificaciones en 8 parámetros
• Pide consejos personalizados

👔 EVALUACIÓN DE ESTILO
• Elige contexto (trabajo, cita, etc.)
• Envía foto de cuerpo completo
• Obtén análisis del outfit y recomendaciones

💬 COMANDOS
/start - Menú principal
/wallet - Saldo y recarga
/help - Esta ayuda
/language - Cambiar idioma`,

        FR: `📖 COMMENT UTILISER LOOKORA

🚀 COMMENCER
1. Cliquez sur «Commencer» dans le menu principal
2. Choisissez le type d'analyse: apparence ou style
3. Suivez les instructions et envoyez une photo
4. Obtenez une analyse détaillée avec recommandations

📸 ÉVALUATION D'APPARENCE
• Envoyez une photo de face
• Puis une photo de profil (côté)
• Obtenez des notes sur 8 paramètres
• Demandez des conseils personnalisés

👔 ÉVALUATION DE STYLE
• Choisissez le contexte (travail, rendez-vous, etc.)
• Envoyez une photo en pied
• Obtenez l'analyse de tenue et recommandations

💬 COMMANDES
/start - Menu principal
/wallet - Solde et recharge
/help - Cette aide
/language - Changer de langue`,

        PT: `📖 COMO USAR O LOOKORA

🚀 COMEÇAR
1. Clique em «Começar» no menu principal
2. Escolha o tipo de análise: aparência ou estilo
3. Siga as instruções e envie uma foto
4. Obtenha análise detalhada com recomendações

📸 AVALIAÇÃO DE APARÊNCIA
• Envie foto frontal do rosto
• Depois foto de perfil (lado)
• Obtenha notas em 8 parâmetros
• Peça dicas personalizadas

👔 AVALIAÇÃO DE ESTILO
• Escolha o contexto (trabalho, encontro, etc.)
• Envie foto de corpo inteiro
• Obtenha análise do visual e recomendações

💬 COMANDOS
/start - Menu principal
/wallet - Saldo e recarga
/help - Esta ajuda
/language - Mudar idioma`
    };
    return texts[lang] || texts.EN!;
};

// Об оценке внешности
export const getAppearanceHelpText = (lang: Language): string => {
    const texts: Record<Language, string> = {
        RU: `👤 ОБ ОЦЕНКЕ ВНЕШНОСТИ

📊 ПАРАМЕТРЫ ОЦЕНКИ
Мы анализируем 8 ключевых параметров:
• 👁‍🗨 Глаза — форма, выразительность
• 👃 Нос — пропорции, форма
• 💋 Губы — форма, полнота
• ✨ Кожа — состояние, тон
• 🦴 Челюсть — линия, форма
• 💆 Скулы — выраженность
• ⚖️ Симметрия — баланс черт
• 🎶 Гармония — общее впечатление

🎯 КОЭФФИЦИЕНТ ВПЕЧАТЛЕНИЯ
Это множитель (×0.5 - ×1.0), который отражает общее впечатление от внешности:

🌟 ×1.0 — Отличное: ухоженный, приятный вид
✨ ×0.9 — Хорошее: нормальный вид
👍 ×0.75 — Нормальное: есть недочёты
😐 ×0.65 — Среднее: заметна неухоженность
⚠️ ×0.5 — Низкое: сильная неухоженность

Этот коэффициент влияет на итоговую оценку. Ухоженность важна!`,

        EN: `👤 ABOUT APPEARANCE RATING

📊 RATING PARAMETERS
We analyze 8 key parameters:
• 👁‍🗨 Eyes — shape, expressiveness
• 👃 Nose — proportions, shape
• 💋 Lips — shape, fullness
• ✨ Skin — condition, tone
• 🦴 Jawline — line, shape
• 💆 Cheekbones — prominence
• ⚖️ Symmetry — feature balance
• 🎶 Harmony — overall impression

🎯 IMPRESSION COEFFICIENT
This is a multiplier (×0.5 - ×1.0) that reflects the overall impression:

🌟 ×1.0 — Excellent: well-groomed, pleasant
✨ ×0.9 — Good: normal appearance
👍 ×0.75 — Normal: minor issues
😐 ×0.65 — Average: noticeable neglect
⚠️ ×0.5 — Low: significant neglect

This coefficient affects the final score. Grooming matters!`,

        UA: `👤 ПРО ОЦІНКУ ЗОВНІШНОСТІ

📊 ПАРАМЕТРИ ОЦІНКИ
Ми аналізуємо 8 ключових параметрів:
• 👁‍🗨 Очі — форма, виразність
• 👃 Ніс — пропорції, форма
• 💋 Губи — форма, повнота
• ✨ Шкіра — стан, тон
• 🦴 Щелепа — лінія, форма
• 💆 Вилиці — виразність
• ⚖️ Симетрія — баланс рис
• 🎶 Гармонія — загальне враження

🎯 КОЕФІЦІЄНТ ВРАЖЕННЯ
Це множник (×0.5 - ×1.0), який відображає загальне враження:

🌟 ×1.0 — Відмінне: доглянутий, приємний вигляд
✨ ×0.9 — Гарне: нормальний вигляд
👍 ×0.75 — Нормальне: є недоліки
😐 ×0.65 — Середнє: помітна недоглянутість
⚠️ ×0.5 — Низьке: сильна недоглянутість

Цей коефіцієнт впливає на підсумкову оцінку. Доглянутість важлива!`,

        ES: `👤 SOBRE EVALUACIÓN DE APARIENCIA

📊 PARÁMETROS DE EVALUACIÓN
Analizamos 8 parámetros clave:
• 👁‍🗨 Ojos — forma, expresividad
• 👃 Nariz — proporciones, forma
• 💋 Labios — forma, plenitud
• ✨ Piel — condición, tono
• 🦴 Mandíbula — línea, forma
• 💆 Pómulos — prominencia
• ⚖️ Simetría — balance de rasgos
• 🎶 Armonía — impresión general

🎯 COEFICIENTE DE IMPRESIÓN
Es un multiplicador (×0.5 - ×1.0) que refleja la impresión general:

🌟 ×1.0 — Excelente: cuidado, agradable
✨ ×0.9 — Buena: apariencia normal
👍 ×0.75 — Normal: problemas menores
😐 ×0.65 — Media: descuido notable
⚠️ ×0.5 — Baja: descuido significativo

¡Este coeficiente afecta la puntuación final. El cuidado personal importa!`,

        FR: `👤 SUR L'ÉVALUATION D'APPARENCE

📊 PARAMÈTRES D'ÉVALUATION
Nous analysons 8 paramètres clés:
• 👁‍🗨 Yeux — forme, expressivité
• 👃 Nez — proportions, forme
• 💋 Lèvres — forme, volume
• ✨ Peau — état, teint
• 🦴 Mâchoire — ligne, forme
• 💆 Pommettes — proéminence
• ⚖️ Symétrie — équilibre des traits
• 🎶 Harmonie — impression générale

🎯 COEFFICIENT D'IMPRESSION
C'est un multiplicateur (×0.5 - ×1.0) qui reflète l'impression générale:

🌟 ×1.0 — Excellente: soigné, agréable
✨ ×0.9 — Bonne: apparence normale
👍 ×0.75 — Normale: problèmes mineurs
😐 ×0.65 — Moyenne: négligence visible
⚠️ ×0.5 — Basse: négligence importante

Ce coefficient affecte le score final. Le soin personnel compte!`,

        PT: `👤 SOBRE AVALIAÇÃO DE APARÊNCIA

📊 PARÂMETROS DE AVALIAÇÃO
Analisamos 8 parâmetros principais:
• 👁‍🗨 Olhos — forma, expressividade
• 👃 Nariz — proporções, forma
• 💋 Lábios — forma, volume
• ✨ Pele — condição, tom
• 🦴 Mandíbula — linha, forma
• 💆 Maçãs do rosto — proeminência
• ⚖️ Simetria — equilíbrio das feições
• 🎶 Harmonia — impressão geral

🎯 COEFICIENTE DE IMPRESSÃO
É um multiplicador (×0.5 - ×1.0) que reflete a impressão geral:

🌟 ×1.0 — Excelente: cuidado, agradável
✨ ×0.9 — Boa: aparência normal
👍 ×0.75 — Normal: problemas menores
😐 ×0.65 — Média: desleixo visível
⚠️ ×0.5 — Baixa: desleixo significativo

Este coeficiente afeta a pontuação final. Cuidado pessoal importa!`
    };
    return texts[lang] || texts.EN!;
};

// Об оценке стиля
export const getStyleHelpText = (lang: Language): string => {
    const texts: Record<Language, string> = {
        RU: `👔 ОБ ОЦЕНКЕ СТИЛЯ

📊 ПАРАМЕТРЫ ОЦЕНКИ
Мы анализируем 4 ключевых параметра:
• 🎨 Гармония цветов — сочетание оттенков
• 👔 Посадка — как сидит одежда
• 🎯 Единство стиля — целостность образа
• 💎 Аксессуары — уместность и качество

🎯 КОЭФФИЦИЕНТ СООТВЕТСТВИЯ
Это множитель (×0.3 - ×1.0), который показывает насколько образ подходит для выбранного контекста:

🌟 ×1.0 — Идеально подходит
✨ ×0.85 — Хорошо подходит
👍 ×0.7 — Нормально
😐 ×0.5 — Слабо подходит
⚠️ ×0.3 — Не подходит

Пример: пляжный образ на свадьбе получит низкий коэффициент.`,

        EN: `👔 ABOUT STYLE RATING

📊 RATING PARAMETERS
We analyze 4 key parameters:
• 🎨 Color harmony — shade combinations
• 👔 Fit — how clothes fit
• 🎯 Style consistency — outfit coherence
• 💎 Accessories — appropriateness

🎯 CONTEXT COEFFICIENT
This multiplier (×0.3 - ×1.0) shows how well the outfit fits the chosen context:

🌟 ×1.0 — Perfect match
✨ ×0.85 — Good match
👍 ×0.7 — Acceptable
😐 ×0.5 — Weak match
⚠️ ×0.3 — Poor match

Example: beachwear at a wedding gets a low coefficient.`,

        UA: `👔 ПРО ОЦІНКУ СТИЛЮ

📊 ПАРАМЕТРИ ОЦІНКИ
Ми аналізуємо 4 ключових параметри:
• 🎨 Гармонія кольорів — поєднання відтінків
• 👔 Посадка — як сидить одяг
• 🎯 Єдність стилю — цілісність образу
• 💎 Аксесуари — доречність та якість

🎯 КОЕФІЦІЄНТ ВІДПОВІДНОСТІ
Це множник (×0.3 - ×1.0), який показує наскільки образ підходить для обраного контексту:

🌟 ×1.0 — Ідеально підходить
✨ ×0.85 — Добре підходить
👍 ×0.7 — Нормально
😐 ×0.5 — Слабко підходить
⚠️ ×0.3 — Не підходить

Приклад: пляжний образ на весіллі отримає низький коефіцієнт.`,

        ES: `👔 SOBRE EVALUACIÓN DE ESTILO

📊 PARÁMETROS DE EVALUACIÓN
Analizamos 4 parámetros clave:
• 🎨 Armonía de colores — combinación de tonos
• 👔 Ajuste — cómo sienta la ropa
• 🎯 Consistencia de estilo — coherencia del outfit
• 💎 Accesorios — adecuación

🎯 COEFICIENTE DE CONTEXTO
Este multiplicador (×0.3 - ×1.0) muestra qué tan bien el outfit encaja en el contexto elegido:

🌟 ×1.0 — Combinación perfecta
✨ ×0.85 — Buena combinación
👍 ×0.7 — Aceptable
😐 ×0.5 — Combinación débil
⚠️ ×0.3 — No combina

Ejemplo: ropa de playa en una boda obtiene coeficiente bajo.`,

        FR: `👔 SUR L'ÉVALUATION DE STYLE

📊 PARAMÈTRES D'ÉVALUATION
Nous analysons 4 paramètres clés:
• 🎨 Harmonie des couleurs — combinaisons de teintes
• 👔 Coupe — comment les vêtements vont
• 🎯 Cohérence du style — cohérence de la tenue
• 💎 Accessoires — pertinence

🎯 COEFFICIENT DE CONTEXTE
Ce multiplicateur (×0.3 - ×1.0) montre à quel point la tenue correspond au contexte choisi:

🌟 ×1.0 — Correspondance parfaite
✨ ×0.85 — Bonne correspondance
👍 ×0.7 — Acceptable
😐 ×0.5 — Correspondance faible
⚠️ ×0.3 — Ne correspond pas

Exemple: tenue de plage à un mariage obtient un coefficient bas.`,

        PT: `👔 SOBRE AVALIAÇÃO DE ESTILO

📊 PARÂMETROS DE AVALIAÇÃO
Analisamos 4 parâmetros principais:
• 🎨 Harmonia de cores — combinações de tons
• 👔 Caimento — como as roupas ficam
• 🎯 Consistência do estilo — coerência do visual
• 💎 Acessórios — adequação

🎯 COEFICIENTE DE CONTEXTO
Este multiplicador (×0.3 - ×1.0) mostra quão bem o visual combina com o contexto escolhido:

🌟 ×1.0 — Combinação perfeita
✨ ×0.85 — Boa combinação
👍 ×0.7 — Aceitável
😐 ×0.5 — Combinação fraca
⚠️ ×0.3 — Não combina

Exemplo: roupa de praia em casamento recebe coeficiente baixo.`
    };
    return texts[lang] || texts.EN!;
};

export const getCoinsHelpText = (lang: Language): string => {
    const texts: Record<Language, string> = {
        RU: `🪙 О ЛУК КОЙНАХ

💎 ЧТО ЭТО?
Лук койны — внутренняя валюта бота для оплаты услуг.

💰 СТОИМОСТЬ УСЛУГ
• Оценка внешности: 50 койнов
• Советы по улучшению: 25 койнов
• Оценка стиля: 50 койнов

🎁 КАК ПОЛУЧИТЬ?
• При регистрации: 50 койнов бесплатно
• Пополнение через CryptoBot
• Пополнение через Telegram Stars

✨ БОНУСЫ
Чем больше пакет — тем выше бонус к количеству койнов!`,

        EN: `🪙 ABOUT LOOK COINS

💎 WHAT ARE THEY?
Look coins are the bot's internal currency for services.

💰 SERVICE COSTS
• Appearance rating: 50 coins
• Improvement tips: 25 coins
• Style rating: 50 coins

🎁 HOW TO GET?
• On registration: 50 coins free
• Top up via CryptoBot
• Top up via Telegram Stars

✨ BONUSES
Bigger packages mean higher coin bonuses!`,

        UA: `🪙 ПРО ЛУК КОЙНИ

💎 ЩО ЦЕ?
Лук койни — внутрішня валюта бота для оплати послуг.

💰 ВАРТІСТЬ ПОСЛУГ
• Оцінка зовнішності: 50 койнів
• Поради щодо покращення: 25 койнів
• Оцінка стилю: 50 койнів

🎁 ЯК ОТРИМАТИ?
• При реєстрації: 50 койнів безкоштовно
• Поповнення через CryptoBot
• Поповнення через Telegram Stars

✨ БОНУСИ
Чим більший пакет — тим вищий бонус до кількості койнів!`,

        ES: `🪙 SOBRE LOOK COINS

💎 ¿QUÉ SON?
Look coins son la moneda interna del bot para servicios.

💰 COSTOS DE SERVICIOS
• Evaluación de apariencia: 50 monedas
• Consejos de mejora: 25 monedas
• Evaluación de estilo: 50 monedas

🎁 ¿CÓMO OBTENERLAS?
• Al registrarse: 50 monedas gratis
• Recarga vía CryptoBot
• Recarga vía Telegram Stars

✨ BONOS
¡Paquetes más grandes significan más bonificación!`,

        FR: `🪙 SUR LES LOOK COINS

💎 QU'EST-CE QUE C'EST?
Les Look coins sont la monnaie interne du bot pour les services.

💰 COÛTS DES SERVICES
• Évaluation d'apparence: 50 coins
• Conseils d'amélioration: 25 coins
• Évaluation de style: 50 coins

🎁 COMMENT LES OBTENIR?
• À l'inscription: 50 coins gratuits
• Recharge via CryptoBot
• Recharge via Telegram Stars

✨ BONUS
Plus le forfait est grand, plus le bonus est élevé!`,

        PT: `🪙 SOBRE LOOK COINS

💎 O QUE SÃO?
Look coins são a moeda interna do bot para serviços.

💰 CUSTOS DOS SERVIÇOS
• Avaliação de aparência: 50 coins
• Dicas de melhoria: 25 coins
• Avaliação de estilo: 50 coins

🎁 COMO OBTER?
• Ao se registrar: 50 coins grátis
• Recarga via CryptoBot
• Recarga via Telegram Stars

✨ BÔNUS
Pacotes maiores significam mais bônus de coins!`
    };
    return texts[lang] || texts.EN!;
};

// Лицензионное соглашение
export const getAgreementText = (lang: Language): string => {
    const texts: Record<Language, string> = {
        RU: `📜 ЛИЦЕНЗИОННОЕ СОГЛАШЕНИЕ LOOKORA

1️⃣ ОБЩИЕ ПОЛОЖЕНИЯ
Используя бота Lookora, вы соглашаетесь с данными условиями.

2️⃣ РАЗВЛЕКАТЕЛЬНЫЙ ХАРАКТЕР
⚠️ ВАЖНО: Все оценки внешности и стиля носят исключительно РАЗВЛЕКАТЕЛЬНЫЙ характер и не являются профессиональной консультацией.

3️⃣ ОТВЕТСТВЕННОСТЬ ЗА ФОТО
📸 Полную ответственность за загружаемые фотографии несёт пользователь, который их отправляет.

4️⃣ КОНФИДЕНЦИАЛЬНОСТЬ
🔒 Мы НЕ ХРАНИМ ваши фотографии на наших серверах. Фото обрабатываются в реальном времени и сразу удаляются.

5️⃣ ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ
Администрация бота:
• Не несёт ответственности за содержание загружаемых фото
• Не гарантирует точность оценок
• Оставляет за собой право изменять условия

Нажимая «Принять», вы принимаете все условия соглашения.`,

        EN: `📜 LOOKORA LICENSE AGREEMENT

1️⃣ GENERAL PROVISIONS
By using Lookora bot, you agree to these terms.

2️⃣ ENTERTAINMENT PURPOSE
⚠️ IMPORTANT: All appearance and style ratings are for ENTERTAINMENT purposes only and do not constitute professional advice.

3️⃣ PHOTO RESPONSIBILITY
📸 Full responsibility for uploaded photos lies with the user who sends them.

4️⃣ PRIVACY
🔒 We DO NOT STORE your photos on our servers. Photos are processed in real-time and immediately deleted.

5️⃣ DISCLAIMER
Bot administration:
• Is not responsible for the content of uploaded photos
• Does not guarantee rating accuracy
• Reserves the right to change terms

By clicking «Accept», you accept all agreement terms.`,

        UA: `📜 ЛІЦЕНЗІЙНА УГОДА LOOKORA

1️⃣ ЗАГАЛЬНІ ПОЛОЖЕННЯ
Використовуючи бота Lookora, ви погоджуєтесь з цими умовами.

2️⃣ РОЗВАЖАЛЬНИЙ ХАРАКТЕР
⚠️ ВАЖЛИВО: Усі оцінки зовнішності та стилю мають виключно РОЗВАЖАЛЬНИЙ характер і не є професійною консультацією.

3️⃣ ВІДПОВІДАЛЬНІСТЬ ЗА ФОТО
📸 Повну відповідальність за завантажені фотографії несе користувач, який їх надсилає.

4️⃣ КОНФІДЕНЦІЙНІСТЬ
🔒 Ми НЕ ЗБЕРІГАЄМО ваші фотографії на наших серверах. Фото обробляються в реальному часі і одразу видаляються.

5️⃣ ВІДМОВА ВІД ВІДПОВІДАЛЬНОСТІ
Адміністрація бота:
• Не несе відповідальності за вміст завантажених фото
• Не гарантує точність оцінок
• Залишає за собою право змінювати умови

Натискаючи «Прийняти», ви приймаєте всі умови угоди.`,

        ES: `📜 ACUERDO DE LICENCIA LOOKORA

1️⃣ DISPOSICIONES GENERALES
Al usar el bot Lookora, aceptas estos términos.

2️⃣ PROPÓSITO DE ENTRETENIMIENTO
⚠️ IMPORTANTE: Todas las evaluaciones de apariencia y estilo son SOLO para entretenimiento y no constituyen asesoramiento profesional.

3️⃣ RESPONSABILIDAD DE FOTOS
📸 La responsabilidad total por las fotos cargadas recae en el usuario que las envía.

4️⃣ PRIVACIDAD
🔒 NO ALMACENAMOS tus fotos en nuestros servidores. Las fotos se procesan en tiempo real y se eliminan inmediatamente.

5️⃣ DESCARGO DE RESPONSABILIDAD
La administración del bot:
• No es responsable del contenido de las fotos cargadas
• No garantiza la precisión de las evaluaciones
• Se reserva el derecho de cambiar términos

Al hacer clic en «Aceptar», aceptas todos los términos.`,

        FR: `📜 ACCORD DE LICENCE LOOKORA

1️⃣ DISPOSITIONS GÉNÉRALES
En utilisant le bot Lookora, vous acceptez ces conditions.

2️⃣ BUT DE DIVERTISSEMENT
⚠️ IMPORTANT: Toutes les évaluations d'apparence et de style sont UNIQUEMENT à des fins de DIVERTISSEMENT et ne constituent pas des conseils professionnels.

3️⃣ RESPONSABILITÉ DES PHOTOS
📸 L'entière responsabilité des photos téléchargées incombe à l'utilisateur qui les envoie.

4️⃣ CONFIDENTIALITÉ
🔒 Nous NE STOCKONS PAS vos photos sur nos serveurs. Les photos sont traitées en temps réel et immédiatement supprimées.

5️⃣ CLAUSE DE NON-RESPONSABILITÉ
L'administration du bot:
• N'est pas responsable du contenu des photos téléchargées
• Ne garantit pas la précision des évaluations
• Se réserve le droit de modifier les conditions

En cliquant sur «Accepter», vous acceptez toutes les conditions.`,

        PT: `📜 ACORDO DE LICENÇA LOOKORA

1️⃣ DISPOSIÇÕES GERAIS
Ao usar o bot Lookora, você concorda com estes termos.

2️⃣ PROPÓSITO DE ENTRETENIMENTO
⚠️ IMPORTANTE: Todas as avaliações de aparência e estilo são APENAS para ENTRETENIMENTO e não constituem aconselhamento profissional.

3️⃣ RESPONSABILIDADE PELAS FOTOS
📸 A responsabilidade total pelas fotos enviadas é do usuário que as envia.

4️⃣ PRIVACIDADE
🔒 NÃO ARMAZENAMOS suas fotos em nossos servidores. As fotos são processadas em tempo real e imediatamente excluídas.

5️⃣ ISENÇÃO DE RESPONSABILIDADE
A administração do bot:
• Não é responsável pelo conteúdo das fotos enviadas
• Não garante a precisão das avaliações
• Reserva-se o direito de alterar os termos

Ao clicar em «Aceitar», você aceita todos os termos.`
    };
    return texts[lang] || texts.EN!;
};

// Текст меню помощи
export const getHelpMenuText = (lang: Language): string => {
    const texts: Record<Language, string> = {
        RU: `❓ Помощь

Выберите раздел, чтобы узнать больше о возможностях бота:`,
        EN: `❓ Help

Select a section to learn more about the bot:`,
        UA: `❓ Допомога

Виберіть розділ, щоб дізнатися більше про можливості бота:`,
        ES: `❓ Ayuda

Selecciona una sección para saber más sobre el bot:`,
        FR: `❓ Aide

Sélectionnez une section pour en savoir plus sur le bot:`,
        PT: `❓ Ajuda

Selecione uma seção para saber mais sobre o bot:`
    };
    return texts[lang] || texts.EN!;
};

// Информация о необходимости принять соглашение при регистрации
export const getAgreementInfoText = (lang: Language): string => {
    const texts: Record<Language, string> = {
        RU: `📜 Лицензионное соглашение

Для использования бота Lookora необходимо ознакомиться и принять лицензионное соглашение.

Нажмите «Прочитать», чтобы ознакомиться с полным текстом, или «Принять», если вы согласны с условиями.`,
        EN: `📜 License Agreement

To use the Lookora bot, you need to read and accept the license agreement.

Click «Read» to view the full text, or «Accept» if you agree to the terms.`,
        UA: `📜 Ліцензійна угода

Для використання бота Lookora необхідно ознайомитися та прийняти ліцензійну угоду.

Натисніть «Прочитати», щоб ознайомитися з повним текстом, або «Прийняти», якщо ви згодні з умовами.`,
        ES: `📜 Acuerdo de Licencia

Para usar el bot Lookora, debes leer y aceptar el acuerdo de licencia.

Haz clic en «Leer» para ver el texto completo, o «Aceptar» si estás de acuerdo con los términos.`,
        FR: `📜 Accord de Licence

Pour utiliser le bot Lookora, vous devez lire et accepter l'accord de licence.

Cliquez sur «Lire» pour voir le texte complet, ou «Accepter» si vous acceptez les conditions.`,
        PT: `📜 Acordo de Licença

Para usar o bot Lookora, você precisa ler e aceitar o acordo de licença.

Clique em «Ler» para ver o texto completo, ou «Aceitar» se você concorda com os termos.`
    };
    return texts[lang] || texts.EN!;
};

// Текст предупреждения о соглашении
export const getMustAcceptText = (lang: Language): string => {
    const texts: Record<Language, string> = {
        RU: `⚠️ Для использования бота необходимо принять лицензионное соглашение.`,
        EN: `⚠️ You must accept the license agreement to use this bot.`,
        UA: `⚠️ Для використання бота необхідно прийняти ліцензійну угоду.`,
        ES: `⚠️ Debes aceptar el acuerdo de licencia para usar este bot.`,
        FR: `⚠️ Vous devez accepter l'accord de licence pour utiliser ce bot.`,
        PT: `⚠️ Você deve aceitar o acordo de licença para usar este bot.`
    };
    return texts[lang] || texts.EN!;
};

// Текст принятия соглашения
export const getAgreementAcceptedText = (lang: Language): string => {
    const texts: Record<Language, string> = {
        RU: `✅ Соглашение принято. Добро пожаловать!`,
        EN: `✅ Agreement accepted. Welcome!`,
        UA: `✅ Угоду прийнято. Ласкаво просимо!`,
        ES: `✅ Acuerdo aceptado. ¡Bienvenido!`,
        FR: `✅ Accord accepté. Bienvenue!`,
        PT: `✅ Acordo aceito. Bem-vindo!`
    };
    return texts[lang] || texts.EN!;
};
