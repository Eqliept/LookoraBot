import type { Language } from "../types/index.js";
import { t } from "../utils/i18n.js";

export const getHowToUseText = (lang: Language): string => {
    return t('help-how-to-use-text', lang);
};

export const getAppearanceHelpText = (lang: Language): string => {
    return t('help-appearance-text', lang);
};

export const getStyleHelpText = (lang: Language): string => {
    return t('help-style-text', lang);
};

export const getCoinsHelpText = (lang: Language): string => {
    return t('help-coins-text', lang);
};

export const getAgreementText = (lang: Language): string => {
    return t('agreement-text', lang);
};

export const getHelpMenuText = (lang: Language): string => {
    return t('help-info', lang);
};

export const getAgreementInfoText = (lang: Language): string => {
    return t('agreement-title', lang);
};

export const getAgreementAcceptedText = (lang: Language): string => {
    return t('agreement-accepted', lang);
};

export const getRegistrationBonusText = (lang: Language): string => {
    return t('registration-bonus-info', lang);
};
