// utils/subscriptionHelper.js

// Template availability by subscription plan
export const TEMPLATE_PLANS = {
    free: {
        templates: ["classic", "minimal"],
        displayName: "Free"
    },
    premium: {
        templates: ["classic", "modern", "minimal", "elegant"],
        displayName: "Premium"
    },
    business: {
        templates: ["classic", "modern", "minimal", "elegant", "creative", "corporate"],
        displayName: "Business"
    }
};

// Get available templates for a plan
export const getAvailableTemplates = (plan = "free") => {
    return TEMPLATE_PLANS[plan]?.templates || TEMPLATE_PLANS.free.templates;
};

// Check if template is available for plan
export const isTemplateAvailable = (template, plan = "free") => {
    const availableTemplates = getAvailableTemplates(plan);
    return availableTemplates.includes(template);
};

// Get the plan that unlocks a template
export const getUnlockPlan = (template) => {
    for (const [plan, data] of Object.entries(TEMPLATE_PLANS)) {
        if (data.templates.includes(template)) {
            return plan;
        }
    }
    return null;
};

// Get all templates with their unlock status
export const getAllTemplatesWithStatus = (userPlan = "free") => {
    const allTemplates = ["classic", "modern", "minimal", "elegant", "creative", "corporate"];
    const availableTemplates = getAvailableTemplates(userPlan);
    
    return allTemplates.map(template => ({
        name: template,
        displayName: template.charAt(0).toUpperCase() + template.slice(1),
        available: availableTemplates.includes(template),
        unlockedAt: availableTemplates.includes(template) ? userPlan : getUnlockPlan(template)
    }));
};
