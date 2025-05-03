/*
  # Update subscription plans with new features and descriptions

  1. Changes
    - Update plan names and descriptions
    - Update pricing
    - Update features list as JSONB array
    - Set staff access percentages
*/

-- Update subscription plans with new structure
UPDATE subscription_plans
SET 
  name = 'Basic Plan',
  description = 'Perfect for those who prefer a self-service approach with essential support.',
  price = 12000,
  features = jsonb_build_array(
    'Limited access to staff profiles',
    'Self-service booking—hire at your convenience',
    'Replacement Guarantee—Access new profiles within 24 hours if needed',
    'Background Checks—All staff are pre-screened for your safety',
    'Training Support—Sign up for outsourced training via our portal',
    'Customer Support: Email only—Simple, direct assistance when you need it'
  ),
  staff_access_percentage = 15,
  max_staff_selections = 1,
  allow_pdf_download = false
WHERE name = 'Essential Plan'
OR name ILIKE '%basic%'
OR price = (SELECT MIN(price) FROM subscription_plans);

UPDATE subscription_plans
SET 
  name = 'Standard Plan',
  description = 'Ideal for those who want full access to our staff database with added support.',
  price = 15000,
  features = jsonb_build_array(
    'Full access to all staff profiles',
    'Self-service booking—hire on your terms',
    'Replacement Guarantee—Access new profiles within 24 hours if needed',
    'Background Checks—All staff are pre-screened for your safety',
    'Training Support—Sign up for outsourced training via our portal',
    'Customer Support: Email & Chat—Faster assistance when you need it',
    'One-Time Onboarding Session—A guided session via chat/email',
    'Access to Staff Performance Ratings & Reviews',
    'Monthly Webinars or Consultation Sessions'
  ),
  staff_access_percentage = 50,
  max_staff_selections = 3,
  allow_pdf_download = true
WHERE name = 'Professional Plan'
OR name ILIKE '%standard%'
OR price = 15000;

UPDATE subscription_plans
SET 
  name = 'Premium Plan',
  description = 'Exclusive service with priority access to top talent and a dedicated account manager.',
  price = 30000,
  features = jsonb_build_array(
    'Priority Access to Staff—Get first choice from our talent pool',
    'Full access to all staff profiles',
    'Dedicated Account Manager—Personalized assistance',
    'Self-service booking—flexibility with a backup team',
    'Replacement Guarantee—Access new profiles within 24 hours',
    'Background Checks—All staff are pre-screened for your safety',
    'Training Support—Sign up for outsourced training via our portal',
    'Customer Support: 24/7 Priority Support',
    'Personalized Onboarding Call with account manager',
    'Access to Staff Performance Ratings & Reviews',
    'Express Booking—Urgent replacements within 6-12 hours',
    'Monthly Webinars or Consultation Sessions',
    'Multi-Location Hiring Option',
    'Loyalty Perks—Discounts and referral bonuses'
  ),
  staff_access_percentage = 100,
  max_staff_selections = 10,
  allow_pdf_download = true
WHERE name = 'Enterprise Plan'
OR name ILIKE '%premium%'
OR price = 30000;