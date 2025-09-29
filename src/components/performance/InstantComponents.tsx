// Direct imports to avoid React hooks issues with lazy loading
import { CategoryAccessSection } from '@/components/CategoryAccessSection';
import { SocialMediaFooter } from '@/components/SocialMediaFooter';

// Export components directly without lazy loading wrapper
export const InstantCategoryAccessSection = CategoryAccessSection;
export const InstantSocialMediaFooter = SocialMediaFooter;