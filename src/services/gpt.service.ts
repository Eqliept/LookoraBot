import "dotenv/config";
import type { Language, PhotoValidationResult, AppearanceScores, AppearanceAnalysisResult, StyleCategory, StyleScores, StyleAnalysisResult } from "../types/index.ts";
import { getGPTTranslation } from "../translations/gpt.translations.ts";

const OPENAI_API_KEY = process.env.OPEN_API!;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Хранилище результатов для генерации советов
export const analysisResults = new Map<number, AppearanceAnalysisResult>();

/**
 * Проверка качества фото через GPT Vision
 * Используем gpt-4o-mini как самую дешёвую модель с поддержкой Vision
 */
export const validatePhoto = async (
    photoUrl: string,
    type: "front" | "side",
    lang: Language = "EN"
): Promise<PhotoValidationResult> => {
    const t = getGPTTranslation(lang);
    
    const prompt = type === "front"
        ? `Check if this FRONT face photo is suitable for appearance analysis.

Check:
1. Can you recognize the face and its main features
2. Is there enough lighting (small shadows are acceptable)
3. Is there no strong blur
4. Is there one person in the photo

Don't be too strict. If the face is visible - the photo is suitable.

If everything is OK, answer ONLY JSON: {"isValid": true}
If there are serious problems, answer ONLY JSON (error message ${t.errorLanguage}):
{"isValid": false, "error": "Short reason"}`
        : `Check this SIDE head photo for quality.

Check:
1. Is the face profile visible from the side
2. Is there no strong blur

Don't be strict. If the profile is visible - the photo is suitable.

If everything is OK, answer ONLY JSON: {"isValid": true}
If there are serious problems, answer ONLY JSON (error message ${t.errorLanguage}):
{"isValid": false, "error": "Short reason"}`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: photoUrl, detail: "low" } }
                        ]
                    }
                ],
                max_tokens: 300
            })
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        
        // Парсим JSON из ответа
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
                isValid: result.isValid,
                error: result.error || undefined
            };
        }
        
        return { isValid: true };
    } catch (error) {
        return { isValid: true }; // При ошибке пропускаем
    }
};

/**
 * Анализ внешности через GPT Vision
 * Возвращает детализированные оценки по категориям
 */
export const analyzeAppearance = async (
    frontPhotoUrl: string,
    sidePhotoUrl: string,
    lang: Language = "EN"
): Promise<AppearanceAnalysisResult> => {
    const t = getGPTTranslation(lang);
    
    const prompt = `Analyze the person's appearance in these two photos (front and side/profile).

Rate EACH parameter on a scale from 30 to 100, where:
30-50: below average
50-65: average  
65-80: above average
80-90: very attractive
90-100: exceptional

Parameters to evaluate:
1. eyes - Eyes (shape, size, expressiveness, placement)
2. nose - Nose (shape, proportions, profile)
3. lips - Lips (shape, fullness, proportions)
4. skin - Skin (clarity, tone, texture)
5. jawline - Jaw and chin (shape, line definition)
6. cheekbones - Cheekbones (prominence, shape)
7. symmetry - Face symmetry (how symmetrical)
8. harmony - Overall harmony (how all features blend together)

ALSO rate "overallImpression" - overall impression coefficient (from 0.5 to 1.0):
- 1.0 = well-groomed, pleasant look
- 0.9 = normal look
- 0.8 = slightly unkempt
- 0.7 = noticeably unkempt
- 0.6 = very unkempt look
- 0.5 = extremely neglected look

This coefficient considers: grooming, tidiness, overall face condition.

Be objective and honest. Minimum score for parameters is 30.

Answer ONLY in JSON format:
{
    "eyes": number 30-100,
    "nose": number 30-100,
    "lips": number 30-100,
    "skin": number 30-100,
    "jawline": number 30-100,
    "cheekbones": number 30-100,
    "symmetry": number 30-100,
    "harmony": number 30-100,
    "overallImpression": number 0.5-1.0
}`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: frontPhotoUrl } },
                            { type: "image_url", image_url: { url: sidePhotoUrl } }
                        ]
                    }
                ],
                max_tokens: 400
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return getDefaultResult();
        }
        
        const content = data.choices?.[0]?.message?.content || "";
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const raw = JSON.parse(jsonMatch[0]);
            
            // Получаем коэффициент общего впечатления (0.5-1.0)
            const overallCoefficient = Math.min(1.0, Math.max(0.5, Number(raw.overallImpression) || 1.0));
            
            // Нормализуем оценки (мин 30, макс 100) и применяем коэффициент
            const clampAndApply = (val: number) => {
                const base = Math.min(100, Math.max(30, Number(val) || 50));
                // Применяем коэффициент, но не опускаем ниже 30
                return Math.max(30, Math.round(base * overallCoefficient));
            };
            
            const scores: AppearanceScores = {
                eyes: clampAndApply(raw.eyes),
                nose: clampAndApply(raw.nose),
                lips: clampAndApply(raw.lips),
                skin: clampAndApply(raw.skin),
                jawline: clampAndApply(raw.jawline),
                cheekbones: clampAndApply(raw.cheekbones),
                symmetry: clampAndApply(raw.symmetry),
                harmony: clampAndApply(raw.harmony)
            };
            
            // Вычисляем общую оценку как среднее
            const values = Object.values(scores);
            const totalScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
            
            // Находим слабые места (ниже 60) - используем переведённые метки
            const weakPoints: string[] = [];
            
            for (const [key, value] of Object.entries(scores)) {
                if (value < 60) {
                    weakPoints.push(t.labels[key as keyof AppearanceScores]);
                }
            }
            
            return { scores, totalScore, overallCoefficient, weakPoints };
        }
        
        return getDefaultResult();
    } catch (error) {
        return getDefaultResult();
    }
};

const getDefaultResult = (): AppearanceAnalysisResult => ({
    scores: {
        eyes: 50, nose: 50, lips: 50, skin: 50,
        jawline: 50, cheekbones: 50, symmetry: 50, harmony: 50
    },
    totalScore: 50,
    overallCoefficient: 1.0,
    weakPoints: []
});

/**
 * Генерация советов по улучшению на основе результатов анализа
 */
export const getImprovementTips = async (
    result: AppearanceAnalysisResult,
    lang: Language = "EN"
): Promise<string> => {
    const t = getGPTTranslation(lang);
    
    // Сортируем параметры по оценке (от худших к лучшим)
    const sortedScores = Object.entries(result.scores)
        .map(([key, value]) => {
            return { key, label: t.labels[key as keyof AppearanceScores], score: value };
        })
        .sort((a, b) => a.score - b.score);
    
    // Берём 3 самых слабых места
    const weakest = sortedScores.slice(0, 3);
    const weakestText = weakest.map(w => `${w.label}: ${w.score}/100`).join(", ");

    // Промпты на разных языках
    const prompts: Record<Language, string> = {
        RU: `Дай советы по улучшению внешности человека.

Слабые места: ${weakestText}

ВАЖНО:
- НЕ советы по причёске/волосам
- Практичные советы: уход, упражнения для лица, макияж
- По каждому слабому месту 1-2 совета

Формат: нумерованный список на русском, кратко.`,

        EN: `Give tips to improve a person's appearance.

Weak areas: ${weakestText}

IMPORTANT:
- NO hair/hairstyle tips
- Practical tips: skincare, face exercises, makeup
- 1-2 tips for each weak area

Format: numbered list in English, brief.`,

        ES: `Da consejos para mejorar la apariencia de una persona.

Áreas débiles: ${weakestText}

IMPORTANTE:
- SIN consejos de cabello/peinado
- Consejos prácticos: cuidado de piel, ejercicios faciales, maquillaje
- 1-2 consejos por cada área débil

Formato: lista numerada en español, breve.`,

        FR: `Donne des conseils pour améliorer l'apparence d'une personne.

Points faibles: ${weakestText}

IMPORTANT:
- PAS de conseils sur les cheveux/coiffure
- Conseils pratiques: soins de peau, exercices faciaux, maquillage
- 1-2 conseils pour chaque point faible

Format: liste numérotée en français, bref.`,

        PT: `Dê dicas para melhorar a aparência de uma pessoa.

Pontos fracos: ${weakestText}

IMPORTANTE:
- SEM dicas de cabelo/penteado
- Dicas práticas: cuidados com a pele, exercícios faciais, maquiagem
- 1-2 dicas para cada ponto fraco

Formato: lista numerada em português, breve.`,

        UA: `Дай поради щодо покращення зовнішності людини.

Слабкі місця: ${weakestText}

ВАЖЛИВО:
- НЕ поради по зачісці/волоссю
- Практичні поради: догляд, вправи для обличчя, макіяж
- По кожному слабкому місцю 1-2 поради

Формат: нумерований список українською, коротко.`
    };

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompts[lang] || prompts.EN }],
                max_tokens: 500
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return lang === "RU" ? "Не удалось сгенерировать советы." : 
                   lang === "UA" ? "Не вдалося згенерувати поради." :
                   "Could not generate tips.";
        }
        
        return data.choices?.[0]?.message?.content || 
               (lang === "RU" ? "Советы недоступны" : 
                lang === "UA" ? "Поради недоступні" : "Tips unavailable");
    } catch (error) {
        return lang === "RU" ? "Ошибка при генерации советов" : 
               lang === "UA" ? "Помилка при генерації порад" :
               "Error generating tips";
    }
};

/**
 * Получить URL файла из Telegram
 */
export const getTelegramFileUrl = async (
    botToken: string,
    fileId: string
): Promise<string | null> => {
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
        const data = await response.json();
        
        if (data.ok && data.result.file_path) {
            return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
        }
        return null;
    } catch (error) {
        return null;
    }
};

// Хранилище результатов стиля
export const styleAnalysisResults = new Map<number, StyleAnalysisResult>();

/**
 * Валидация фото для анализа стиля (полный рост)
 */
export const validateStylePhoto = async (
    photoUrl: string,
    lang: Language = "EN"
): Promise<PhotoValidationResult> => {
    const t = getGPTTranslation(lang);
    
    const prompt = `Check if this FULL BODY photo is suitable for style analysis.

Check:
1. Is the person visible from head to toe (full body)
2. Are clothes and outfit clearly visible
3. Is there enough lighting
4. Is there no strong blur

Don't be too strict. If the outfit is visible - the photo is suitable.

If everything is OK, answer ONLY JSON: {"isValid": true}
If there are serious problems, answer ONLY JSON (error message ${t.errorLanguage}):
{"isValid": false, "error": "Short reason"}`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: photoUrl, detail: "low" } }
                        ]
                    }
                ],
                max_tokens: 300
            })
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
                isValid: result.isValid,
                error: result.error || undefined
            };
        }
        
        return { isValid: true };
    } catch (error) {
        return { isValid: true };
    }
};

/**
 * Анализ стиля через GPT Vision
 */
export const analyzeStyle = async (
    photoUrl: string,
    category: StyleCategory,
    customDescription: string | undefined,
    lang: Language = "EN"
): Promise<StyleAnalysisResult> => {
    const categoryDescriptions: Record<StyleCategory, string> = {
        casual: "Casual everyday style - for walks, meeting friends, shopping",
        work: "Work/study style - for office, university, business situations",
        date: "Date style - for romantic context",
        social: "Social media / public image - for photos, videos, content, personal brand",
        event: "Event style - for parties, events, going out",
        custom: customDescription || "Custom context"
    };

    const contextDescription = categoryDescriptions[category];

    const langInstructions: Record<Language, string> = {
        RU: "на русском языке",
        EN: "in English",
        ES: "en español",
        FR: "en français",
        PT: "em português",
        UA: "українською мовою"
    };

    const prompt = `Analyze this person's STYLE and OUTFIT for the context: "${contextDescription}"

Rate EACH parameter on a scale from 30 to 100:
1. colorHarmony - Color harmony (how well colors work together)
2. fit - Fit (how well clothes fit the body)
3. styleConsistency - Style consistency (unified look)
4. accessories - Accessories (appropriate and matching)
5. seasonality - Seasonality (appropriate for weather/season visible)
6. contextMatch - Context match (how appropriate for: ${contextDescription})

ALSO rate "contextCoefficient" - how well this outfit matches the specific context (from 0.3 to 1.0):
- 1.0 = perfect match for the context (e.g., elegant dress for a wedding)
- 0.8-0.9 = good match, minor issues
- 0.6-0.7 = acceptable but not ideal
- 0.4-0.5 = weak match, significant mismatch
- 0.3 = completely wrong for context (e.g., beachwear for a business meeting)

This coefficient reflects how appropriate the OVERALL outfit is for: ${contextDescription}

Also provide:
- strengths: Array of 2-3 strong points of the outfit (${langInstructions[lang]})
- improvements: Array of 2-3 things to improve (${langInstructions[lang]})
- recommendations: Array of 2-3 specific recommendations - what to add/remove/change (${langInstructions[lang]})

Be objective and constructive. Focus on actionable advice.

Answer ONLY in JSON format:
{
    "colorHarmony": number 30-100,
    "fit": number 30-100,
    "styleConsistency": number 30-100,
    "accessories": number 30-100,
    "seasonality": number 30-100,
    "contextMatch": number 30-100,
    "contextCoefficient": number 0.3-1.0,
    "strengths": ["string", "string"],
    "improvements": ["string", "string"],
    "recommendations": ["string", "string"]
}`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: photoUrl } }
                        ]
                    }
                ],
                max_tokens: 800
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return getDefaultStyleResult(lang);
        }
        
        const content = data.choices?.[0]?.message?.content || "";
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const raw = JSON.parse(jsonMatch[0]);
            
            const clamp = (val: number) => Math.min(100, Math.max(30, Number(val) || 50));
            
            // Получаем коэффициент соответствия контексту (0.3-1.0)
            const overallCoefficient = Math.min(1.0, Math.max(0.3, Number(raw.contextCoefficient) || 0.7));
            
            const scores: StyleScores = {
                colorHarmony: clamp(raw.colorHarmony),
                fit: clamp(raw.fit),
                styleConsistency: clamp(raw.styleConsistency),
                accessories: clamp(raw.accessories),
                seasonality: clamp(raw.seasonality),
                contextMatch: clamp(raw.contextMatch)
            };
            
            // Применяем коэффициент к общей оценке
            const values = Object.values(scores);
            const baseScore = values.reduce((a, b) => a + b, 0) / values.length;
            const totalScore = Math.round(baseScore * overallCoefficient);
            
            return {
                scores,
                totalScore,
                overallCoefficient,
                strengths: raw.strengths || [],
                improvements: raw.improvements || [],
                recommendations: raw.recommendations || []
            };
        }
        
        return getDefaultStyleResult(lang);
    } catch (error) {
        return getDefaultStyleResult(lang);
    }
};

const getDefaultStyleResult = (lang: Language): StyleAnalysisResult => {
    const defaultMessages: Record<Language, { strength: string; improvement: string; recommendation: string }> = {
        RU: { strength: "Анализ недоступен", improvement: "Попробуйте другое фото", recommendation: "Загрузите чёткое фото" },
        EN: { strength: "Analysis unavailable", improvement: "Try another photo", recommendation: "Upload a clear photo" },
        ES: { strength: "Análisis no disponible", improvement: "Pruebe otra foto", recommendation: "Suba una foto clara" },
        FR: { strength: "Analyse non disponible", improvement: "Essayez une autre photo", recommendation: "Téléchargez une photo claire" },
        PT: { strength: "Análise indisponível", improvement: "Tente outra foto", recommendation: "Envie uma foto clara" },
        UA: { strength: "Аналіз недоступний", improvement: "Спробуйте інше фото", recommendation: "Завантажте чітке фото" }
    };
    
    const msg = defaultMessages[lang] || defaultMessages.EN;
    
    return {
        scores: {
            colorHarmony: 50,
            fit: 50,
            styleConsistency: 50,
            accessories: 50,
            seasonality: 50,
            contextMatch: 50
        },
        totalScore: 50,
        overallCoefficient: 1.0,
        strengths: [msg.strength],
        improvements: [msg.improvement],
        recommendations: [msg.recommendation]
    };
};
