import "dotenv/config";
import type { Language, PhotoValidationResult, AppearanceScores, AppearanceAnalysisResult, StyleCategory, StyleScores, StyleAnalysisResult, HairScores, HairAnalysisResult, BattleAnalysisResult, BattlePlayerResult } from "../types/index.js";
import { getGPTTranslation } from "../translations/gpt.translations.js";
import { notifyAdminAboutError } from "../utils/logger.js";

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
                eyebrows: clampAndApply(raw.eyebrows)
            };
            
            // Вычисляем общую оценку как среднее
            const values = Object.values(scores) as number[];
            const totalScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
            
            // Находим слабые места (ниже 60) - используем переведённые метки
            const weakPoints: string[] = [];
            
            for (const [key, value] of Object.entries(scores)) {
                if ((value as number) < 60) {
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
        jawline: 50, cheekbones: 50, symmetry: 50, eyebrows: 50
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
            return { key, label: t.labels[key as keyof AppearanceScores], score: value as number };
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
5. grooming - Grooming and neatness (clean, ironed, well-maintained clothes and appearance)
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
    "grooming": number 30-100,
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
                grooming: clamp(raw.grooming),
                contextMatch: clamp(raw.contextMatch)
            };
            
            // Применяем коэффициент к общей оценке
            const values = Object.values(scores) as number[];
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
            grooming: 50,
            contextMatch: 50
        },
        totalScore: 50,
        overallCoefficient: 1.0,
        strengths: [msg?.strength ?? ""],
        improvements: [msg?.improvement ?? ""],
        recommendations: [msg?.recommendation ?? ""]
    };
};

/**
 * Анализ волос и определение формы лица
 */
export const analyzeHair = async (
    photoUrl: string,
    lang: Language = "EN"
): Promise<HairAnalysisResult & { gender?: "male" | "female" }> => {
    const t = getGPTTranslation(lang);
    
    const prompt = `You are a professional hair analyst. Analyze the hair and face shape in this photo.

Rate each parameter on a scale from 30 to 100:
1. health - Hair health (shine, no damage, no split ends)
2. volume - Volume and fullness
3. texture - Texture and structure (smooth, well-maintained)
4. color - Color quality (natural or well-colored)
5. styling - Styling quality (neat, well-done)
6. maintenance - Overall grooming (clean, well-kept)

Also determine:
- gender - Person's gender ("male" or "female")
- faceShape - Face shape (oval, round, square, heart, diamond, oblong) - keep in English
- currentStyle - Brief description of current hairstyle (${t.errorLanguage}) (e.g., "short buzz cut", "medium wavy hair", "long straight hair")
- strengths - 2-3 strong points about the hair (${t.errorLanguage})
- improvements - 2-3 things that can be improved (${t.errorLanguage})

Be honest and objective. Return ONLY valid JSON, no additional text.

JSON format:
{
  "gender": "male" or "female",
  "scores": {
    "health": 30-100,
    "volume": 30-100,
    "texture": 30-100,
    "color": 30-100,
    "styling": 30-100,
    "maintenance": 30-100
  },
  "faceShape": "shape in English",
  "currentStyle": "style description ${t.errorLanguage}",
  "strengths": ["point 1 ${t.errorLanguage}", "point 2 ${t.errorLanguage}"],
  "improvements": ["point 1 ${t.errorLanguage}", "point 2 ${t.errorLanguage}"]
}`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional hair analyst. Always respond with valid JSON only, no additional text or explanations."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: photoUrl } }
                        ]
                    }
                ],
                max_tokens: 600,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content?.trim();

        if (!content) {
            throw new Error("Empty response from OpenAI");
        }

        // Извлекаем JSON из ответа (может содержать текст до/после JSON)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON found in response");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        
        // Нормализуем оценки (30-100)
        const clamp = (val: number) => Math.min(100, Math.max(30, Number(val) || 50));
        
        const scores: HairScores = {
            health: clamp(parsed.scores?.health),
            volume: clamp(parsed.scores?.volume),
            texture: clamp(parsed.scores?.texture),
            color: clamp(parsed.scores?.color),
            styling: clamp(parsed.scores?.styling),
            maintenance: clamp(parsed.scores?.maintenance)
        };
        
        // Вычисляем общую оценку
        const totalScore = Math.round(
            (scores.health + scores.volume + scores.texture + 
             scores.color + scores.styling + scores.maintenance) / 6
        );

        return {
            scores,
            totalScore,
            faceShape: parsed.faceShape || "Not determined",
            currentStyle: parsed.currentStyle || "Not determined",
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
            gender: parsed.gender === "female" ? "female" : "male"
        };
    } catch (error) {
        await notifyAdminAboutError(error as Error, 'hair analysis', 0);
        
        return {
            scores: {
                health: 50,
                volume: 50,
                texture: 50,
                color: 50,
                styling: 50,
                maintenance: 50
            },
            totalScore: 50,
            faceShape: "Not determined",
            currentStyle: "Analysis unavailable",
            strengths: ["Try another photo"],
            improvements: ["Upload a clear photo"]
        };
    }
};

/**
 * Подбор прически на основе анализа
 */
export const suggestHairstyle = async (
    photoUrl: string,
    hairAnalysis: HairAnalysisResult,
    lang: Language = "EN"
): Promise<string> => {
    const prompt = `Based on this person's photo and hair analysis, suggest the BEST hairstyle.

Face shape: ${hairAnalysis.faceShape}
Current style: ${hairAnalysis.currentStyle}
Hair health: ${hairAnalysis.scores.health}/100
Hair texture: ${hairAnalysis.scores.texture}/100

Provide:
1. Recommended hairstyle name
2. Brief explanation why this suits them (2-3 sentences)
3. 3-5 example search terms to find this hairstyle online (e.g., "Brad Pitt undercut 2023", "short pompadour men")

Use plain text format WITHOUT markdown (no ** or *):

Hairstyle Name

Why it suits you:
[explanation]

Examples to search:
• [example 1]
• [example 2]
• [example 3]

Response language: ${lang === "RU" ? "Russian" : lang === "UA" ? "Ukrainian" : lang === "ES" ? "Spanish" : lang === "PT" ? "Portuguese" : lang === "FR" ? "French" : "English"}`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`
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
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.choices[0]?.message?.content?.trim() || "Unable to generate hairstyle suggestion";
        
        // Убираем markdown если остался
        return result.replace(/\*\*/g, '').replace(/\*/g, '');
    } catch (error) {
        await notifyAdminAboutError(error as Error, 'hairstyle suggestion', 0);
        return "Unable to generate hairstyle suggestion. Please try again.";
    }
};

/**
 * Советы по улучшению текущей прически
 */
export const improveCurrentHair = async (
    photoUrl: string,
    hairAnalysis: HairAnalysisResult,
    lang: Language = "EN"
): Promise<string> => {
    const prompt = `Based on this person's current hairstyle and hair analysis, provide improvement suggestions.

Current style: ${hairAnalysis.currentStyle}
Hair health: ${hairAnalysis.scores.health}/100
Hair volume: ${hairAnalysis.scores.volume}/100
Hair texture: ${hairAnalysis.scores.texture}/100

Suggest practical improvements:
- Hair treatments (keratin, biowave, etc.)
- Styling changes (curls, waves, straightening)
- Coloring options (highlights, balayage, etc.)
- Maintenance tips
- Product recommendations

Keep it concise and practical (4-6 suggestions max).
Use plain text format WITHOUT markdown (no ** or *).

Response language: ${lang === "RU" ? "Russian" : lang === "UA" ? "Ukrainian" : lang === "ES" ? "Spanish" : lang === "PT" ? "Portuguese" : lang === "FR" ? "French" : "English"}`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`
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
                max_tokens: 400,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.choices[0]?.message?.content?.trim() || "Unable to generate improvement tips";
        
        // Убираем markdown если остался
        return result.replace(/\*\*/g, '').replace(/\*/g, '');
    } catch (error) {
        await notifyAdminAboutError(error as Error, 'hair improvement tips', 0);
        return "Unable to generate improvement tips. Please try again.";
    }
};

/**
 * Генерация инструкций для барбера
 */
export const generateBarberInstructions = async (
    hairstyleSuggestion: string,
    lang: Language = "EN",
    gender: "male" | "female" = "male"
): Promise<string> => {
    const genderContext = {
        male: {
            RU: "Вы мужчина. Пишите от первого лица мужского рода.",
            EN: "You are a man. Write in first person masculine.",
            UA: "Ви чоловік. Пишіть від першої особи чоловічого роду.",
            ES: "Eres hombre. Escribe en primera persona masculina.",
            PT: "Você é homem. Escreva em primeira pessoa masculina.",
            FR: "Vous êtes un homme. Écrivez à la première personne du masculin."
        },
        female: {
            RU: "Вы девушка. Пишите от первого лица женского рода.",
            EN: "You are a woman. Write in first person feminine.",
            UA: "Ви дівчина. Пишіть від першої особи жіночого роду.",
            ES: "Eres mujer. Escribe en primera persona femenina.",
            PT: "Você é mulher. Escreva em primeira pessoa feminina.",
            FR: "Vous êtes une femme. Écrivez à la première personne du féminin."
        }
    };

    const startPhrases = {
        male: {
            RU: "Сделайте мне пожалуйста",
            EN: "Please make me",
            UA: "Зробіть мені будь ласка",
            ES: "Por favor, hágame",
            PT: "Por favor, faça-me",
            FR: "Faites-moi s'il vous plaît"
        },
        female: {
            RU: "Сделайте мне пожалуйста",
            EN: "Please make me",
            UA: "Зробіть мені будь ласка",
            ES: "Por favor, hágame",
            PT: "Por favor, faça-me",
            FR: "Faites-moi s'il vous plaît"
        }
    };

    const genderInfo = genderContext[gender][lang] || genderContext[gender].EN;
    const startPhrase = startPhrases[gender][lang] || startPhrases[gender].EN;

    const prompt = `${genderInfo}

Преобразуйте эту рекомендацию в текст-запрос от лица клиента для барбера/парикмахера. 
Начните с "${startPhrase}..." и опишите желаемую прическу простым языком. 
Будьте конкретны но кратки. Напишите так, как будто вы лично просите барбера.

Рекомендуемая прическа:
${hairstyleSuggestion}

Язык ответа: ${lang === "RU" ? "русский" : lang === "UA" ? "украинский" : lang === "ES" ? "испанский" : lang === "PT" ? "португальский" : lang === "FR" ? "французский" : "английский"}.
Без форматирования markdown. Только простой текст.`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.choices[0]?.message?.content?.trim() || "Unable to generate barber instructions";
        
        // Убираем markdown если остался
        return result.replace(/\*\*/g, '').replace(/\*/g, '');
    } catch (error) {
        await notifyAdminAboutError(error as Error, 'barber instructions generation', 0);
        return "Unable to generate barber instructions. Please try again.";
    }
};

/**
 * Анализ баттла внешности - сравнение двух человек
 */
export const analyzeBattle = async (
    player1FrontUrl: string,
    player1SideUrl: string,
    player2FrontUrl: string,
    player2SideUrl: string,
    lang: Language = "EN"
): Promise<BattleAnalysisResult> => {
    const t = getGPTTranslation(lang);
    
    const verdictLang: Record<Language, string> = {
        RU: "на русском языке",
        EN: "in English",
        ES: "en español",
        FR: "en français",
        PT: "em português",
        UA: "українською мовою"
    };
    
    const prompt = `You are judging an APPEARANCE BATTLE between two people.

Analyze photos of PERSON 1 (front and side) and PERSON 2 (front and side).

For EACH person, rate these parameters (30-100):
- eyes: Eyes (shape, size, expressiveness)
- nose: Nose (shape, proportions)
- lips: Lips (shape, fullness)
- skin: Skin (clarity, tone)
- jawline: Jaw and chin
- cheekbones: Cheekbones
- symmetry: Face symmetry
- eyebrows: Eyebrows

Also rate "overallImpression" for each (0.5-1.0):
- 1.0 = well-groomed, pleasant
- 0.9 = normal
- 0.8 = slightly unkempt
- 0.7 = noticeably unkempt
- 0.5 = very unkempt

Be FAIR and OBJECTIVE. This is entertainment only.

Also provide a brief verdict (2-3 sentences ${verdictLang[lang]}) explaining who won and why, mentioning the key differences.

Answer ONLY in JSON:
{
    "player1": {
        "eyes": number,
        "nose": number,
        "lips": number,
        "skin": number,
        "jawline": number,
        "cheekbones": number,
        "symmetry": number,
        "eyebrows": number,
        "overallImpression": number
    },
    "player2": {
        "eyes": number,
        "nose": number,
        "lips": number,
        "skin": number,
        "jawline": number,
        "cheekbones": number,
        "symmetry": number,
        "eyebrows": number,
        "overallImpression": number
    },
    "verdict": "string"
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
                            { type: "image_url", image_url: { url: player1FrontUrl } },
                            { type: "image_url", image_url: { url: player1SideUrl } },
                            { type: "image_url", image_url: { url: player2FrontUrl } },
                            { type: "image_url", image_url: { url: player2SideUrl } }
                        ]
                    }
                ],
                max_tokens: 800
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return getDefaultBattleResult();
        }
        
        const content = data.choices?.[0]?.message?.content || "";
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const raw = JSON.parse(jsonMatch[0]);
            
            const processPlayer = (playerData: any): BattlePlayerResult => {
                const overallCoefficient = Math.min(1.0, Math.max(0.5, Number(playerData.overallImpression) || 1.0));
                
                const clampAndApply = (val: number) => {
                    const base = Math.min(100, Math.max(30, Number(val) || 50));
                    return Math.max(30, Math.round(base * overallCoefficient));
                };
                
                const scores: AppearanceScores = {
                    eyes: clampAndApply(playerData.eyes),
                    nose: clampAndApply(playerData.nose),
                    lips: clampAndApply(playerData.lips),
                    skin: clampAndApply(playerData.skin),
                    jawline: clampAndApply(playerData.jawline),
                    cheekbones: clampAndApply(playerData.cheekbones),
                    symmetry: clampAndApply(playerData.symmetry),
                    eyebrows: clampAndApply(playerData.eyebrows)
                };
                
                const values = Object.values(scores) as number[];
                const totalScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
                
                return { scores, totalScore, overallCoefficient };
            };
            
            return {
                player1: processPlayer(raw.player1),
                player2: processPlayer(raw.player2),
                verdict: raw.verdict || ""
            };
        }
        
        return getDefaultBattleResult();
    } catch (error) {
        await notifyAdminAboutError(error as Error, 'battle analysis', 0);
        return getDefaultBattleResult();
    }
};

const getDefaultBattleResult = (): BattleAnalysisResult => ({
    player1: {
        scores: { eyes: 50, nose: 50, lips: 50, skin: 50, jawline: 50, cheekbones: 50, symmetry: 50, eyebrows: 50 },
        totalScore: 50,
        overallCoefficient: 1.0
    },
    player2: {
        scores: { eyes: 50, nose: 50, lips: 50, skin: 50, jawline: 50, cheekbones: 50, symmetry: 50, eyebrows: 50 },
        totalScore: 50,
        overallCoefficient: 1.0
    },
    verdict: ""
});
