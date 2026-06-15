export const MODEL_CONFIG = {
    primary: "openai:gpt-4o-mini",
    premium: "openai:gpt-4o"
}

export const selectModel = ({isDemo = false, primaryFailed = false} = {}) => {
    if(isDemo || primaryFailed) return MODEL_CONFIG.premium;

    return MODEL_CONFIG.primary;
}