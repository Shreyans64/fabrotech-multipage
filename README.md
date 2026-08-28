# Fabrotech Multipage Website

Static multi-page website for Fabrotech Engineers. The site is deployed to GitHub Pages from the `fabrotech/` directory.

## Directory Structure

```text
.
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # GitHub Pages deployment workflow
├── fabrotech/
│   ├── assets/                    # Images and downloadable product catalogues
│   ├── certs/                     # Company and quality certification PDFs
│   ├── css/
│   │   └── styles.css             # Shared website styles
│   ├── js/
│   │   └── main.js                # Shared website interactions
│   ├── index.html                 # Homepage
│   ├── products.html              # Product categories
│   ├── certifications.html        # Certificates and registrations
│   ├── about.html                 # About the company
│   ├── reach.html                 # Business roadmap
│   ├── contact.html               # Contact and enquiry page
│   ├── robots.txt                 # Search-engine crawler rules
│   └── sitemap.xml                # Search-engine page sitemap
├── .gitignore                     # Local files excluded from Git
└── README.md                      # Project documentation
```

## Local Preview

Open `fabrotech/index.html` in a browser, or serve the folder with any static web server.

## Deployment

Push changes to the `main` branch. The workflow in `.github/workflows/deploy-pages.yml` publishes the contents of `fabrotech/` to GitHub Pages.
