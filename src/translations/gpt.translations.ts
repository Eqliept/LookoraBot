import type { Language, GPTTranslation } from "../types/index.ts";

export const gptTranslations: Record<Language, GPTTranslation> = {
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
            harmony: "Гармония"
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
            harmony: "Harmony"
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
            harmony: "Armonía"
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
            harmony: "Harmonie"
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
            harmony: "Harmonia"
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
            harmony: "Гармонія"
        }
    }
};

export const getGPTTranslation = (lang: Language) => gptTranslations[lang] || gptTranslations.EN;
