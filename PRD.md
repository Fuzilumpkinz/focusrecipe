Product Requirements Document (PRD)

Project: "FocusRecipe" (Working Title)

Attribute

Details

Status

Draft

Version

0.2

Author

Gemini

Stakeholders

[Your Name/Team]

Created

10/26/2025

Last Updated

10/26/2025

1. Overview

1.1. Problem

Cooking enthusiasts and family planners are often frustrated by disorganized recipe collections and the "fluff" of online food blogs. Furthermore, managing and sharing these recipes with family members for weekly meal planning is a disjointed process, often relying on spreadsheets, text messages, and shared notes.

1.2. Solution

"FocusRecipe" is a sleek, modern Progressive Web App (PWA) that acts as a central hub for a user's and a family's entire recipe collection.

V1 Focus:

Manual Recipe Entry: A clean, simple interface for users to manually add their own recipes (from family cookbooks, text files, etc.) into a personal digital cookbook.

Collaborative Meal Planning: A social layer that allows users to create "Family Groups" to share recipes, collaboratively build meal plans, and maintain a shared digital cookbook.

Future Vision:
The app will expand to include powerful "Recipe Clipping" (parsing URLs to automatically import recipes) and "Smart Shopping Lists."

1.3. Goals

User Acquisition: Attract home cooks and family planners looking for a central, "distraction-free" recipe and planning solution.

Engagement: Achieve high user engagement through the manual creation of recipes and collaborative meal plans.

Collaboration: Foster a collaborative environment where "Family Group" creation and shared plan-building are core, sticky features.

Utility: Become the user's "single source of truth" for their personal and family recipes.

2. User Personas

Persona

Description

Needs & Goals

"The Planner" (e.g., Sarah, 38)

Parent and primary meal planner for a family of four.

* "I need to plan meals for the week so I know what to buy." 
 * "I want my partner to see the plan and add recipes they like." 
 * "I want one place for all our family's favorite meals."

"The Collector" (e.g., Alex, 27)

Foodie who loves finding new recipes but is disorganized.

* "I have 50+ recipe bookmarks I never look at." 
 * "I want a clean, beautiful digital cookbook of just my best recipes." 
 * "I want to save my grandma's handwritten recipe somewhere safe."

"The Partner" (e.g., Mark, 41)

Member of the family who cooks 2-3 times a week.

* "I just need to know 'what's for dinner' tonight." 
 * "I want to add that one chili recipe I found so we can have it next week."

3. Features & Requirements (Epics)

3.1. Epic 1: User Authentication & Profile (V1)

Users must have an account to save recipes and create families.

User Story: "As a user, I want to create an account so that I can save my recipes and create a family group."

Requirements:

Sign Up: Email/Password, Google OAuth, Apple OAuth (or other social providers).

Log In: Standard login for registered users.

Password Reset: "Forgot Password" flow.

User Profile: Simple profile with editable display name and avatar.

Tech Backend: Supabase Auth.

3.2. Epic 2: Recipe Management ("My Cookbook") (V1)

The core of the single-user experience. V1 will be manual entry only.

User Story (Manual): "As 'The Collector', I want to manually type in my own family recipes that aren't online so I have a single, safe digital cookbook."

Requirements (Manual):

A "Create New Recipe" button.

A clean, modern form with fields for:

Title (text)

Image Upload (links to Supabase Storage)

Description/Notes (text)

Prep Time, Cook Time, Total Time, Servings

Ingredients (a dynamic list where users can add/remove lines)

Instructions (a rich text or ordered list editor)

Tags (e.g., "Chicken", "Vegan", "30-Minute Meal")

Source (optional text field for noting "Grandma's cookbook" or a URL)

Requirements (Cookbook View):

A "My Cookbook" page displaying all saved recipes in a clean, filterable grid or list.

Search functionality.

Filter by Tag.

3.3. Epic 3: Family Groups & Shared Cookbook (V1)

The core collaborative feature.

User Story: "As 'The Planner', I want to create a 'Family Group' and invite my partner so we can both add recipes and build a meal plan together."

Requirements:

Group Creation: Allow a user to create a "Family Group" (e.g., "The Miller Family").

Invitations: The group creator can invite other registered users by their email.

Invitation Management: A user can see pending invites and "Accept" or "Decline".

Shared Cookbook: Once in a group, members see a "Family Cookbook" tab.

Adding Recipes: Users can "copy" a recipe from "My Cookbook" to the "Family Cookbook" or create a new recipe directly within the family group.

Permissions (V1): Any member of a Family Group can edit or delete any recipe within that group's "Family Cookbook." Granular permissions will be considered for a future release.

3.4. Epic 4: Collaborative Meal Planner (V1)

The primary utility for family groups.

User Story: "As 'The Planner', I want my family group to set up a flexible weekly calendar, and then drag our shared recipes onto it to plan our meals."

Requirements:

Calendar UI: A modern, responsive calendar interface.

View Toggle: Allow users to select the planning duration: "Week", "2 Weeks", "3 Weeks", "Month".

Plan Configuration: A family group admin can configure their meal plan template to include:

1, 2, or 3 meals per day.

0, 1, or 2 snacks per day.

Recipe Drawer: A sidebar/drawer shows all available recipes from the "Family Cookbook".

Drag-and-Drop: Users can drag a recipe from the drawer onto a specific day/meal slot (e.g., "Dinner" or "Snack 1") on the calendar.

Shared View: The meal plan is live and shared. Any member of the Family Group can view and edit the plan in real-time.

3.5. Epic 5: (Future) Shopping List

User Story: "As a user, once my meal plan is set, I want the app to automatically generate a shopping list for me, and let me uncheck things I already have."

Requirements (v2):

A "Generate Shopping List" button on the meal plan.

User selects a date range (e.g., "This week").

The app aggregates all ingredients from all recipes in that range.

The app presents an initial "Consolidated List" where users can check off items they already have.

A final "Shopping List" is generated, grouping items by category (e.g., "Produce", "Dairy").

3.6. Epic 6: (Future) Recipe URL Parsing

User Story (Parser): "As 'The Collector', I want to paste a URL from a food blog, and have the app automatically save a clean, ad-free version of the recipe."

Requirements (Parser):

A prominent input field in the UI: "Import recipe from URL".

On success, the app parses the recipe and presents the user with a pre-filled, editable recipe form.

On failure, a clear, friendly error message is shown.

OPEN QUESTION (for V2): This is technically complex.

Option A (Build): Use a custom-built scraping engine.

Option B (Buy): Use a 3rd-party recipe parsing API (e.g., Spoonacular, Zest).

Option C (Hybrid): Use an open-source library (e.g., recipe-scrapers) hosted on a Supabase Edge Function.

4. Technical Stack & Architecture

Frontend: React (e.g., using Vite or Next.js) built as a Progressive Web App (PWA) to ensure a good mobile/offline experience.

UI/Styling: Tailwind CSS for rapid, modern design.

Backend: Supabase (as requested).

Authentication: Supabase Auth.

Database: Supabase (PostgreSQL) for all data.

Storage: Supabase Storage for user-uploaded recipe images.

Serverless Functions: Supabase Edge Functions (for future recipe-parsing logic).

5. High-Level Database Schema (Supabase/Postgres)

profiles: (Linked to auth.users via one-to-one)

id (uuid, references auth.users.id)

username (text)

avatar_url (text)

families:

id (uuid, pk)

name (text)

created_by (uuid, fk to profiles.id)

plan_config_meals_per_day (integer, default 3, constraint: 1-3)

plan_config_snacks_per_day (integer, default 2, constraint: 0-2)

family_members: (Join table)

family_id (uuid, fk to families.id)

profile_id (uuid, fk to profiles.id)

role (text, e.g., 'admin', 'member')

recipes:

id (uuid, pk)

title (text)

description (text)

image_url (text)

prep_time (text, e.g., "10 mins")

cook_time (text)

servings (text)

ingredients (jsonb or text[])

instructions (jsonb or text[])

tags (text[])

source (text, nullable)

created_by_profile_id (uuid, fk to profiles.id)

family_id (uuid, fk to families.id, nullable. If NULL, it's in a user's private "My Cookbook")

meal_plans:

id (uuid, pk)

family_id (uuid, fk to families.id)

start_date (date)

end_date (date)

meal_plan_entries:

id (uuid, pk)

plan_id (uuid, fk to meal_plans.id)

recipe_id (uuid, fk to recipes.id)

date (date)

meal_type (text, e.g., 'meal_1', 'meal_2', 'snack_1')

6. Key Questions to Refine This PRD (V1)

The last set of questions has been answered. Here is the next set to help define V1.

Instruction Editor: For the manual recipe Instructions field, what does the "rich text or ordered list editor" look like?

A) Just a simple text box that supports numbered lists?

B) A "rich text" editor with Bold, Italic, and lists?

C) Something more complex? (Recommendation: Keep it simple for V1).

Edit History: When a family member edits a shared recipe, does the new version just overwrite the old one? Or do we need to store an "edit history"? (Recommendation for V1: Overwrite is simpler. History is a V2 feature).

Invitation Flow: How do invitations work?

A) A user enters an email. If that email exists in profiles, we add them. If not, we do nothing?

B) We create an invites table with a pending status? (This is more robust).

PWA Offline: What are the V1 offline requirements?

A) None. The app just works when online (like a standard website).

B) View-Only. The user can view already-loaded recipes and meal plans while offline.

C) Full Offline. The user can create/edit recipes and plans offline, which will sync when they reconnect. (Recommendation: Start with B).