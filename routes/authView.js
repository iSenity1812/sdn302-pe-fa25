const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { generateToken } = require('../config/jwtConfig');
const User = require('../models/user');

const formTemplateSource = fs.readFileSync(
  path.join(__dirname, '../views/components/form.hbs'),
  'utf8'
);

const formTemplate = Handlebars.compile(formTemplateSource);

// GET /auth/login
router.get('/login', (req, res) => {
  const signinFields = [
    {
      name: 'name',
      type: 'text',
      label: 'Username',
      placeholder: 'Enter your username',
      required: true,
      className: '',
    },
    {
      name: 'key',
      type: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      required: true,
      className: '',
    },
  ];

  const formHtml = formTemplate({
    action: '/auth/login',
    method: 'POST',
    fields: signinFields,
    submitLabel: 'Sign in',
    submitClass: 'bg-slate-900 hover:bg-slate-700',
  });

  res.render('ejs/signin', { formHtml, error: null });
});

// POST /auth/login (form submission)
router.post('/login', async (req, res) => {
  try {
    const { name, key } = req.body;
    const user = await User.findOne({ name });
    
    if (!user) {
      return res.render('ejs/signin', { 
        error: 'Invalid credentials',
        formHtml: generateFormHtml('/auth/login'),
      });
    }

    const isMatch = await user.compareKey(key);
    if (!isMatch) {
      return res.render('ejs/signin', { 
        error: 'Invalid credentials',
        formHtml: generateFormHtml('/auth/login'),
      });
    }

    const token = generateToken({ id: user._id, name: user.name });
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/page/foods');
  } catch (error) {
    res.render('ejs/signin', { 
      error: 'An error occurred. Please try again.',
      formHtml: generateFormHtml('/auth/login'),
    });
  }
});

function generateFormHtml(action) {
  const signinFields = [
    {
      name: 'name',
      type: 'text',
      label: 'Username',
      placeholder: 'Enter your username',
      required: true,
      className: '',
    },
    {
      name: 'key',
      type: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      required: true,
      className: '',
    },
  ];

  return formTemplate({
    action: action,
    method: 'POST',
    fields: signinFields,
    submitLabel: 'Sign in',
    submitClass: 'bg-slate-900 hover:bg-slate-700',
  });
}

// GET /auth/logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
