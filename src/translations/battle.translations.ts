import type { Language } from "../types/index.js";

export interface BattleUITranslations {
    battleTitle: string;
    player1: string;
    player2: string;
    sendPlayer1Front: string;
    sendPlayer1Side: string;
    sendPlayer2Front: string;
    sendPlayer2Side: string;
    analyzing: string;
    comparison: string;
    winner: string;
    draw: string;
    verdict: string;
    impressionCoeff: string;
    charged: string;
    remaining: string;
    newBattle: string;
    backButton: string;
    photoLoadError: string;
    photoInvalid: string;
    // Параметры
    eyes: string;
    nose: string;
    lips: string;
    skin: string;
    jawline: string;
    cheekbones: string;
    symmetry: string;
    eyebrows: string;
}

const battleUITranslations: Record<Language, BattleUITranslations> = {
    RU: {
        battleTitle: "БАТТЛ ВНЕШНОСТИ",
        player1: "👤 Участник 1",
        player2: "👤 Участник 2",
        sendPlayer1Front: `⚔️ БАТТЛ ВНЕШНОСТИ

👤 УЧАСТНИК 1

📸 Шаг 1 из 4

Отправьте фото лица ПЕРВОГО участника спереди.

💡 Требования:
• Лицо должно быть хорошо видно
• Достаточное освещение
• Смотрите прямо в камеру`,
        sendPlayer1Side: `👤 УЧАСТНИК 1

📸 Шаг 2 из 4

Отлично! Теперь отправьте фото в профиль (сбоку) ПЕРВОГО участника.

💡 Требования:
• Профиль лица должен быть виден
• Волосы не закрывают черты лица`,
        sendPlayer2Front: `👤 УЧАСТНИК 2

📸 Шаг 3 из 4

Теперь очередь ВТОРОГО участника!
Отправьте фото лица спереди.

💡 Требования:
• Лицо должно быть хорошо видно
• Достаточное освещение
• Смотрите прямо в камеру`,
        sendPlayer2Side: `👤 УЧАСТНИК 2

📸 Шаг 4 из 4 (финал!)

Последнее фото! Отправьте фото в профиль (сбоку) ВТОРОГО участника.

⚔️ После этого начнётся сравнение!`,
        analyzing: "⚔️ Анализируем участников и определяем победителя...",
        comparison: "Детальное сравнение",
        winner: "ПОБЕДИТЕЛЬ",
        draw: "НИЧЬЯ",
        verdict: "Вердикт",
        impressionCoeff: "Коэффициент впечатления",
        charged: "Списано",
        remaining: "Остаток",
        newBattle: "⚔️ Новый баттл",
        backButton: "⬅️ В меню",
        photoLoadError: "Не удалось загрузить фото",
        photoInvalid: "Фото не соответствует требованиям",
        eyes: "👁‍🗨 Глаза",
        nose: "👃 Нос",
        lips: "💋 Губы",
        skin: "✨ Кожа",
        jawline: "🦴 Челюсть",
        cheekbones: "💆 Скулы",
        symmetry: "⚖️ Симметрия",
        eyebrows: "🤨 Брови"
    },
    EN: {
        battleTitle: "APPEARANCE BATTLE",
        player1: "👤 Player 1",
        player2: "👤 Player 2",
        sendPlayer1Front: `⚔️ APPEARANCE BATTLE

👤 PLAYER 1

📸 Step 1 of 4

Send a front face photo of the FIRST participant.

💡 Requirements:
• Face should be clearly visible
• Good lighting
• Look straight at the camera`,
        sendPlayer1Side: `👤 PLAYER 1

📸 Step 2 of 4

Great! Now send a profile (side) photo of the FIRST participant.

💡 Requirements:
• Face profile should be visible
• Hair not covering facial features`,
        sendPlayer2Front: `👤 PLAYER 2

📸 Step 3 of 4

Now it's SECOND participant's turn!
Send a front face photo.

💡 Requirements:
• Face should be clearly visible
• Good lighting
• Look straight at the camera`,
        sendPlayer2Side: `👤 PLAYER 2

📸 Step 4 of 4 (final!)

Last photo! Send a profile (side) photo of the SECOND participant.

⚔️ Comparison will begin after this!`,
        analyzing: "⚔️ Analyzing participants and determining the winner...",
        comparison: "Detailed comparison",
        winner: "WINNER",
        draw: "TIE",
        verdict: "Verdict",
        impressionCoeff: "Impression coefficient",
        charged: "Charged",
        remaining: "Remaining",
        newBattle: "⚔️ New battle",
        backButton: "⬅️ Menu",
        photoLoadError: "Failed to load photo",
        photoInvalid: "Photo doesn't meet requirements",
        eyes: "👁‍🗨 Eyes",
        nose: "👃 Nose",
        lips: "💋 Lips",
        skin: "✨ Skin",
        jawline: "🦴 Jawline",
        cheekbones: "💆 Cheekbones",
        symmetry: "⚖️ Symmetry",
        eyebrows: "🤨 Eyebrows"
    },
    ES: {
        battleTitle: "BATALLA DE APARIENCIA",
        player1: "👤 Participante 1",
        player2: "👤 Participante 2",
        sendPlayer1Front: `⚔️ BATALLA DE APARIENCIA

👤 PARTICIPANTE 1

📸 Paso 1 de 4

Envía una foto frontal del PRIMER participante.

💡 Requisitos:
• El rostro debe ser claramente visible
• Buena iluminación
• Mira directamente a la cámara`,
        sendPlayer1Side: `👤 PARTICIPANTE 1

📸 Paso 2 de 4

¡Excelente! Ahora envía una foto de perfil (lado) del PRIMER participante.

💡 Requisitos:
• El perfil del rostro debe ser visible
• El cabello no debe cubrir los rasgos faciales`,
        sendPlayer2Front: `👤 PARTICIPANTE 2

📸 Paso 3 de 4

¡Ahora es el turno del SEGUNDO participante!
Envía una foto frontal del rostro.

💡 Requisitos:
• El rostro debe ser claramente visible
• Buena iluminación
• Mira directamente a la cámara`,
        sendPlayer2Side: `👤 PARTICIPANTE 2

📸 Paso 4 de 4 (¡final!)

¡Última foto! Envía una foto de perfil (lado) del SEGUNDO participante.

⚔️ ¡La comparación comenzará después de esto!`,
        analyzing: "⚔️ Analizando participantes y determinando al ganador...",
        comparison: "Comparación detallada",
        winner: "GANADOR",
        draw: "EMPATE",
        verdict: "Veredicto",
        impressionCoeff: "Coeficiente de impresión",
        charged: "Cobrado",
        remaining: "Restante",
        newBattle: "⚔️ Nueva batalla",
        backButton: "⬅️ Menú",
        photoLoadError: "No se pudo cargar la foto",
        photoInvalid: "La foto no cumple los requisitos",
        eyes: "👁‍🗨 Ojos",
        nose: "👃 Nariz",
        lips: "💋 Labios",
        skin: "✨ Piel",
        jawline: "🦴 Mandíbula",
        cheekbones: "💆 Pómulos",
        symmetry: "⚖️ Simetría",
        eyebrows: "🤨 Cejas"
    },
    FR: {
        battleTitle: "BATAILLE D'APPARENCE",
        player1: "👤 Participant 1",
        player2: "👤 Participant 2",
        sendPlayer1Front: `⚔️ BATAILLE D'APPARENCE

👤 PARTICIPANT 1

📸 Étape 1 sur 4

Envoyez une photo de face du PREMIER participant.

💡 Exigences:
• Le visage doit être clairement visible
• Bon éclairage
• Regardez directement la caméra`,
        sendPlayer1Side: `👤 PARTICIPANT 1

📸 Étape 2 sur 4

Excellent! Maintenant envoyez une photo de profil (côté) du PREMIER participant.

💡 Exigences:
• Le profil du visage doit être visible
• Les cheveux ne doivent pas cacher les traits`,
        sendPlayer2Front: `👤 PARTICIPANT 2

📸 Étape 3 sur 4

C'est au tour du DEUXIÈME participant!
Envoyez une photo de face.

💡 Exigences:
• Le visage doit être clairement visible
• Bon éclairage
• Regardez directement la caméra`,
        sendPlayer2Side: `👤 PARTICIPANT 2

📸 Étape 4 sur 4 (finale!)

Dernière photo! Envoyez une photo de profil (côté) du DEUXIÈME participant.

⚔️ La comparaison commencera après!`,
        analyzing: "⚔️ Analyse des participants et détermination du gagnant...",
        comparison: "Comparaison détaillée",
        winner: "GAGNANT",
        draw: "ÉGALITÉ",
        verdict: "Verdict",
        impressionCoeff: "Coefficient d'impression",
        charged: "Facturé",
        remaining: "Restant",
        newBattle: "⚔️ Nouvelle bataille",
        backButton: "⬅️ Menu",
        photoLoadError: "Impossible de charger la photo",
        photoInvalid: "La photo ne répond pas aux exigences",
        eyes: "👁‍🗨 Yeux",
        nose: "👃 Nez",
        lips: "💋 Lèvres",
        skin: "✨ Peau",
        jawline: "🦴 Mâchoire",
        cheekbones: "💆 Pommettes",
        symmetry: "⚖️ Symétrie",
        eyebrows: "🤨 Sourcils"
    },
    PT: {
        battleTitle: "BATALHA DE APARÊNCIA",
        player1: "👤 Participante 1",
        player2: "👤 Participante 2",
        sendPlayer1Front: `⚔️ BATALHA DE APARÊNCIA

👤 PARTICIPANTE 1

📸 Passo 1 de 4

Envie uma foto frontal do PRIMEIRO participante.

💡 Requisitos:
• O rosto deve estar claramente visível
• Boa iluminação
• Olhe diretamente para a câmera`,
        sendPlayer1Side: `👤 PARTICIPANTE 1

📸 Passo 2 de 4

Ótimo! Agora envie uma foto de perfil (lado) do PRIMEIRO participante.

💡 Requisitos:
• O perfil do rosto deve estar visível
• O cabelo não deve cobrir as feições`,
        sendPlayer2Front: `👤 PARTICIPANTE 2

📸 Passo 3 de 4

Agora é a vez do SEGUNDO participante!
Envie uma foto frontal do rosto.

💡 Requisitos:
• O rosto deve estar claramente visível
• Boa iluminação
• Olhe diretamente para a câmera`,
        sendPlayer2Side: `👤 PARTICIPANTE 2

📸 Passo 4 de 4 (final!)

Última foto! Envie uma foto de perfil (lado) do SEGUNDO participante.

⚔️ A comparação começará depois disso!`,
        analyzing: "⚔️ Analisando participantes e determinando o vencedor...",
        comparison: "Comparação detalhada",
        winner: "VENCEDOR",
        draw: "EMPATE",
        verdict: "Veredito",
        impressionCoeff: "Coeficiente de impressão",
        charged: "Cobrado",
        remaining: "Restante",
        newBattle: "⚔️ Nova batalha",
        backButton: "⬅️ Menu",
        photoLoadError: "Falha ao carregar foto",
        photoInvalid: "A foto não atende aos requisitos",
        eyes: "👁‍🗨 Olhos",
        nose: "👃 Nariz",
        lips: "💋 Lábios",
        skin: "✨ Pele",
        jawline: "🦴 Mandíbula",
        cheekbones: "💆 Maçãs do rosto",
        symmetry: "⚖️ Simetria",
        eyebrows: "🤨 Sobrancelhas"
    },
    UA: {
        battleTitle: "БАТЛ ЗОВНІШНОСТІ",
        player1: "👤 Учасник 1",
        player2: "👤 Учасник 2",
        sendPlayer1Front: `⚔️ БАТЛ ЗОВНІШНОСТІ

👤 УЧАСНИК 1

📸 Крок 1 з 4

Надішліть фото обличчя ПЕРШОГО учасника спереду.

💡 Вимоги:
• Обличчя має бути добре видно
• Достатнє освітлення
• Дивіться прямо в камеру`,
        sendPlayer1Side: `👤 УЧАСНИК 1

📸 Крок 2 з 4

Чудово! Тепер надішліть фото у профіль (збоку) ПЕРШОГО учасника.

💡 Вимоги:
• Профіль обличчя має бути видним
• Волосся не закриває риси обличчя`,
        sendPlayer2Front: `👤 УЧАСНИК 2

📸 Крок 3 з 4

Тепер черга ДРУГОГО учасника!
Надішліть фото обличчя спереду.

💡 Вимоги:
• Обличчя має бути добре видно
• Достатнє освітлення
• Дивіться прямо в камеру`,
        sendPlayer2Side: `👤 УЧАСНИК 2

📸 Крок 4 з 4 (фінал!)

Останнє фото! Надішліть фото у профіль (збоку) ДРУГОГО учасника.

⚔️ Після цього почнеться порівняння!`,
        analyzing: "⚔️ Аналізуємо учасників та визначаємо переможця...",
        comparison: "Детальне порівняння",
        winner: "ПЕРЕМОЖЕЦЬ",
        draw: "НІЧИЯ",
        verdict: "Вердикт",
        impressionCoeff: "Коефіцієнт враження",
        charged: "Списано",
        remaining: "Залишок",
        newBattle: "⚔️ Новий батл",
        backButton: "⬅️ Меню",
        photoLoadError: "Не вдалося завантажити фото",
        photoInvalid: "Фото не відповідає вимогам",
        eyes: "👁‍🗨 Очі",
        nose: "👃 Ніс",
        lips: "💋 Губи",
        skin: "✨ Шкіра",
        jawline: "🦴 Щелепа",
        cheekbones: "💆 Вилиці",
        symmetry: "⚖️ Симетрія",
        eyebrows: "🤨 Брови"
    }
};

export const getBattleUI = (lang: Language): BattleUITranslations => 
    battleUITranslations[lang] || battleUITranslations.EN;
