export const gptTranslations = {
    RU: {
        errorLanguage: "на русском",
        labels: {
            eyes: "Глаза",
            nose: "Нос",
            lips: "Губы",
            skin: "Кожа",
            jawline: "Челюсть",
            cheekbones: "Скулы",
            symmetry: "Симметрия",
            eyebrows: "Брови"
        }
    },
    EN: {
        errorLanguage: "in English",
        labels: {
            eyes: "Eyes",
            nose: "Nose",
            lips: "Lips",
            skin: "Skin",
            jawline: "Jawline",
            cheekbones: "Cheekbones",
            symmetry: "Symmetry",
            eyebrows: "Eyebrows"
        }
    },
    ES: {
        errorLanguage: "en español",
        labels: {
            eyes: "Ojos",
            nose: "Nariz",
            lips: "Labios",
            skin: "Piel",
            jawline: "Mandíbula",
            cheekbones: "Pómulos",
            symmetry: "Simetría",
            eyebrows: "Cejas"
        }
    },
    FR: {
        errorLanguage: "en français",
        labels: {
            eyes: "Yeux",
            nose: "Nez",
            lips: "Lèvres",
            skin: "Peau",
            jawline: "Mâchoire",
            cheekbones: "Pommettes",
            symmetry: "Symétrie",
            eyebrows: "Sourcils"
        }
    },
    PT: {
        errorLanguage: "em português",
        labels: {
            eyes: "Olhos",
            nose: "Nariz",
            lips: "Lábios",
            skin: "Pele",
            jawline: "Mandíbula",
            cheekbones: "Maçãs do rosto",
            symmetry: "Simetria",
            eyebrows: "Sobrancelhas"
        }
    },
    UA: {
        errorLanguage: "українською",
        labels: {
            eyes: "Очі",
            nose: "Ніс",
            lips: "Губи",
            skin: "Шкіра",
            jawline: "Щелепа",
            cheekbones: "Вилиці",
            symmetry: "Симетрія",
            eyebrows: "Брови"
        }
    }
};
export const getGPTTranslation = (lang) => gptTranslations[lang] || gptTranslations.EN;
//# sourceMappingURL=gpt.translations.js.map