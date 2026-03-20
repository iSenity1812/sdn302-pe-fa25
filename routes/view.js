const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { authenticateView } = require('../middlewares/authViewMiddleware');
const apiClient = require('../utils/apiClient');

const buttonTemplateSource = fs.readFileSync(
    path.join(__dirname, '../views/components/button.hbs'),
    'utf8'
);
const cardTemplateSource = fs.readFileSync(
    path.join(__dirname, '../views/components/card.hbs'),
    'utf8'
);

const buttonTemplate = Handlebars.compile(buttonTemplateSource);
const cardTemplate = Handlebars.compile(cardTemplateSource);

router.get('/', (req, res) => {
    const heroButtons = [
        {
            type: 'button',
            label: 'Start free trial',
            className: 'border-transparent bg-cyan-400 text-slate-950 hover:bg-cyan-300',
        },
        {
            href: '#pricing',
            label: 'View pricing',
            className: 'border-slate-500/60 bg-white/5 text-slate-100 backdrop-blur hover:border-slate-400',
        },
    ];

    const planCards = [
        {
            badge: 'Starter',
            badgeClass: 'border border-slate-200 bg-slate-50 text-slate-700',
            title: 'Launch',
            description: 'Perfect for small teams validating product-market fit.',
            price: '$19/month',
            points: ['Up to 3 team members', 'Basic analytics', 'Community support'],
            ctaLabel: 'Choose plan',
            ctaHref: '#',
            ctaClass: 'bg-slate-900 hover:bg-slate-700',
        },
        {
            accent: 'bg-cyan-100/80',
            badge: 'Most Popular',
            badgeClass: 'border border-cyan-100 bg-cyan-50 text-cyan-700',
            title: 'Growth',
            description: 'Scale faster with analytics, team permissions, and advanced automations.',
            price: '$59/month',
            points: ['Unlimited projects', 'Role-based permissions', 'Priority support'],
            ctaLabel: 'Start free trial',
            ctaHref: '#',
            ctaClass: 'bg-slate-900 hover:bg-slate-700',
        },
        {
            badge: 'Enterprise',
            badgeClass: 'border border-slate-200 bg-slate-50 text-slate-700',
            title: 'Scale',
            description: 'Advanced security, dedicated support, and custom integrations.',
            price: 'Custom',
            points: ['SAML + SSO', 'Dedicated account manager', 'SLA and onboarding'],
            ctaLabel: 'Contact sales',
            ctaHref: '#',
            ctaClass: 'bg-slate-900 hover:bg-slate-700',
        },
    ];

    res.render('ejs/landing', {
        heroButtonsHtml: heroButtons.map((buttonProps) => buttonTemplate(buttonProps)),
        planCardsHtml: planCards.map((cardProps) => cardTemplate(cardProps)),
    });
});

router.get('/page/foods', authenticateView, async (req, res) => {
    // Get the token from cookies
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    // Fetch data from APIs using the generic API client
    const foodsData = await apiClient.get('/api/v1/foods', token);
    const nationsData = await apiClient.get('/api/v1/nations', token);

    // Create a mapping of nation IDs to nation names
    const nationMap = {};
    nationsData.forEach((nation) => {
        const nationId = nation._id;
        nationMap[nationId] = nation.nationName || nation.name;
    });

    // Create food cards
    const foodCards = foodsData.map((food) => {
        const nationId = food.nation._id;
        const nationName = nationMap[nationId] || 'Unknown';

        return {
            title: food.foodName,
            description: `${food.calories} calories • ${food.isVegetarian ? '🌱 Vegetarian' : '🍖 Non-vegetarian'}`,
            price: `${food.rating}/5 ★`,
            points: [
                `Nation: ${nationName}`,
                `Category: ${food.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}`,
            ],
            ctaLabel: 'View Details',
            ctaHref: `/page/foods/${food._id}`,
            ctaClass: 'bg-slate-900 hover:bg-slate-700',
        };
    });

    res.render('ejs/foods', {
        foodCardsHtml: foodCards.map((cardProps) => cardTemplate(cardProps)),
        foods: foodsData,
        errors: null,
        formData: {},
        nations: nationsData,
    });
});

// Food Detail Page
router.get('/page/foods/:id', authenticateView, async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        const foodId = req.params.id;

        // Fetch the specific food and all foods for related products
        const food = await apiClient.get(`/api/v1/foods/${foodId}`, token);
        const allFoods = await apiClient.get('/api/v1/foods', token);
        const nationsData = await apiClient.get('/api/v1/nations', token);

        // Create a mapping of nation IDs to nation names
        const nationMap = {};
        nationsData.forEach((nation) => {
            const nationId = nation._id;
            nationMap[nationId] = nation.nationName || nation.name;
        });

        // Add nation name to food
        const foodWithNation = {
            ...food,
            nationName: nationMap[food.nation._id] || 'Unknown',
        };

        // Create related foods cards (exclude the current food)
        const relatedFoods = allFoods
            .filter((f) => f._id !== foodId)
            .slice(0, 3)
            .map((relatedFood) => {
                const nationName = relatedFood.nation?.nationName || 'Unknown';

                return {
                    title: relatedFood.foodName,
                    imageUrl: relatedFood.imageUrl,
                    description: `${relatedFood.calories} calories • ${relatedFood.isVegetarian ? '🌱 Vegetarian' : '🍖 Non-vegetarian'}`,
                    price: `${relatedFood.rating}/5 ★`,
                    points: [
                        `Nation: ${nationName}`,
                        `Category: ${relatedFood.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}`,
                    ],
                    ctaLabel: 'View Details',
                    ctaHref: `/page/foods/${relatedFood._id}`,
                    ctaClass: 'bg-slate-900 hover:bg-slate-700',
                };
            });

        res.render('ejs/food-detail', {
            food: foodWithNation,
            relatedFoods: relatedFoods.map((cardProps) => cardTemplate(cardProps)),
        });
    } catch (error) {
        console.error('Error fetching food detail:', error);
        res.status(404).render('ejs/error', { message: 'Food not found' });
    }
});

// Create Food Route
router.post('/page/foods', authenticateView, async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        const { foodName, foodDescription, imageUrl, calories, rating, nation, isVegetarian } = req.body;

        // Validation
        const errors = {};

        // Validate foodName: letters and space only, required, unique
        if (!foodName) {
            errors.foodName = 'Food name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(foodName)) {
            errors.foodName = 'Food name must contain only letters and spaces';
        }

        // Validate calories: number between 700-1500
        const caloriesNum = parseInt(calories);
        if (!calories) {
            errors.calories = 'Calories is required';
        } else if (isNaN(caloriesNum) || caloriesNum < 700 || caloriesNum > 1500) {
            errors.calories = 'Calories must be a number between 700 and 1500';
        }

        // Validate foodDescription: required
        if (!foodDescription || !foodDescription.trim()) {
            errors.foodDescription = 'Food description is required';
        }

        // Validate imageUrl: required and valid URL
        if (!imageUrl || !imageUrl.trim()) {
            errors.imageUrl = 'Image URL is required';
        } else {
            try {
                new URL(imageUrl);
            } catch (_error) {
                errors.imageUrl = 'Image URL must be a valid URL';
            }
        }

        // Validate rating: number
        const ratingNum = parseInt(rating);
        if (!rating) {
            errors.rating = 'Rating is required';
        } else if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            errors.rating = 'Rating must be a number between 1 and 5';
        }

        // Validate nation: required
        if (!nation) {
            errors.nation = 'Nation is required';
        }

        // If there are validation errors, return to page with errors
        if (Object.keys(errors).length > 0) {
            const foodsData = await apiClient.get('/api/v1/foods', token);
            const nationsData = await apiClient.get('/api/v1/nations', token);
            
            const nationMap = {};
            nationsData.forEach((nat) => {
                nationMap[nat._id] = nat.nationName || nat.name;
            });

            const foodCards = foodsData.map((food) => {
                const nationId = food.nation._id;
                const nationName = nationMap[nationId] || 'Unknown';
                return {
                    title: food.foodName,
                    description: `${food.calories} calories • ${food.isVegetarian ? '🌱 Vegetarian' : '🍖 Non-vegetarian'}`,
                    price: `${food.rating}/5 ★`,
                    points: [nationName],
                    ctaLabel: 'View Details',
                    ctaHref: `/page/foods/${food._id}`,
                    ctaClass: 'bg-slate-900 hover:bg-slate-700',
                };
            });

            return res.render('ejs/foods', {
                foodCardsHtml: foodCards.map((cardProps) => cardTemplate(cardProps)),
                foods: foodsData,
                errors,
                formData: req.body,
                nations: nationsData,
            });
        }

        // Create the food via API
        const newFood = await apiClient.post(
            '/api/v1/foods',
            {
                foodName,
                foodDescription,
                imageUrl,
                calories: caloriesNum,
                rating: ratingNum,
                nation,
                isVegetarian: isVegetarian === 'on' || isVegetarian === true,
            },
            token
        );

        // Redirect to foods page
        res.redirect('/page/foods');
    } catch (error) {
        console.error('Error creating food:', error);
        res.status(500).json({ error: 'Error creating food' });
    }
});

module.exports = router;