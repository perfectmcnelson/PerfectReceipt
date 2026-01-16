const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const Settings = require('../models/Settings');
const { withPage } = require('./browser');
const User = require('../models/User');

// // Helper to generate color variants
// function generateColorVariants(baseColor) {
//   const hex = (baseColor || '#1e40af').replace('#', '');
//   const r = parseInt(hex.substr(0, 2), 16);
//   const g = parseInt(hex.substr(2, 2), 16);
//   const b = parseInt(hex.substr(4, 2), 16);

//   return {
//     primary: baseColor || '#1e40af',
//     primaryDark: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`,
//     primaryDarker: `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`,
//     primaryLight: `rgba(${r}, ${g}, ${b}, 0.8)`,
//     primaryLighter: `rgba(${r}, ${g}, ${b}, 0.15)`,
//     primaryPale: `rgba(${r}, ${g}, ${b}, 0.05)`,
//   };
// }

// Helper to generate color variants
function generateColorVariants(baseColor) {
  const hex = (baseColor || '#1e40af').replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return {
    // Brand / Primary
    primary: baseColor || '#1e40af',
    primaryDark: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`,
    primaryDarker: `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`,
    primaryLight: `rgba(${r}, ${g}, ${b}, 0.8)`,
    primaryLighter: `rgba(${r}, ${g}, ${b}, 0.15)`,
    primaryPale: `rgba(${r}, ${g}, ${b}, 0.05)`,

    // Accent
    gold: `rgb(
      ${Math.min(255, r + 60)},
      ${Math.min(215, g + 40)},
      ${Math.min(100, b)}
    )`,

    // Text colors
    text: `rgb(
      ${Math.max(0, r - 120)},
      ${Math.max(0, g - 120)},
      ${Math.max(0, b - 120)}
    )`,
    textMedium: `rgb(
      ${Math.max(0, r - 80)},
      ${Math.max(0, g - 80)},
      ${Math.max(0, b - 80)}
    )`,

    // Borders / dividers
    border: `rgba(${r}, ${g}, ${b}, 0.25)`,
  };
}


// Helper to process logo
async function processLogo(logoPath) {
  if (!logoPath) return null;

  try {
    // If it's already a data URL or HTTP URL, return as-is
    if (logoPath.startsWith('data:') || logoPath.startsWith('http')) {
      return logoPath;
    }

    // If it's a file path
    if (logoPath.startsWith('/') || logoPath.includes('./') || logoPath.includes('..')) {
      const resolvedPath = logoPath.startsWith('/') 
        ? logoPath 
        : path.join(__dirname, '..', logoPath);

      if (fs.existsSync(resolvedPath)) {
        const logoBuffer = fs.readFileSync(resolvedPath);
        const base64 = logoBuffer.toString('base64');
        const ext = path.extname(resolvedPath).slice(1) || 'png';
        return `data:image/${ext};base64,${base64}`;
      }
    }
  } catch (err) {
    console.warn('Failed to process logo:', err.message);
  }

  return null;
}

async function generatePdfBufferFromInvoice(invoice) {
  if (!invoice || !invoice.user) {
    throw new Error('Invoice and invoice.user are required');
  }

  let templateName;
  let brandColor;
  let currencyIcon;
  let businessLogo = null;

  try {
    const settings = await Settings.findOne({ user: invoice.user }).lean();
    if (settings) {
      templateName =
        settings.branding?.invoiceTemplate ||
        settings.branding?.defaultTemplate;
      brandColor =
        settings.branding?.invoiceColor ||
        settings.branding?.primaryColor;

      const currencySymbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£' };
      currencyIcon = currencySymbols[settings?.invoiceDefaults?.currency] || '';
    }
  } catch (err) {
    console.warn('Failed to load Settings for invoice:', err.message);
  }

  // Try to get logo from invoice first, then from user
  try {
    let logoPath = invoice.billFrom?.logo;
    
    if (!logoPath) {
      const user = await User.findById(invoice.user);
      logoPath = user?.businessLogo;
    }

    businessLogo = await processLogo(logoPath);
  } catch (err) {
    console.warn('Failed to process business logo:', err.message);
  }

  templateName = (templateName || 'elegant')
    .toString()
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase();

  let templatePath = path.join(
    __dirname,
    '..',
    'templates',
    'invoices',
    `${templateName}.ejs`
  );

  if (!fs.existsSync(templatePath)) {
    templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'invoices',
      'elegant.ejs'
    );
  }

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const colors = generateColorVariants(brandColor || '#1e40af');

  const html = await ejs.renderFile(templatePath, {
    invoice,
    brandColor: brandColor || colors.primary,
    currencyIcon: currencyIcon || '',
    colors,
    businessLogo,
  });

  return withPage(async (page) => {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    return page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });
  });
}

async function generatePdfBufferFromReceipt(receipt) {
  if (!receipt || !receipt.user) {
    throw new Error('Receipt and receipt.user are required');
  }

  let templateName;
  let brandColor;
  let currencyIcon;
  let businessLogo = null;

  try {
    const settings = await Settings.findOne({ user: receipt.user }).lean();
    if (settings) {
      templateName =
        settings.branding?.receiptTemplate ||
        settings.branding?.defaultTemplate;
      brandColor =
        settings.branding?.invoiceColor ||
        settings.branding?.primaryColor;

      const currencySymbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£' };
      currencyIcon = currencySymbols[settings?.invoiceDefaults?.currency] || '';
    }
  } catch (err) {
    console.warn('Failed to load Settings for receipt:', err.message);
  }

  // Try to get logo from receipt first, then from user
  try {
    let logoPath = receipt.billFrom?.logo;
    
    if (!logoPath) {
      const user = await User.findById(receipt.user).select('businessLogo');
      logoPath = user?.businessLogo;
    }

    businessLogo = await processLogo(logoPath);
  } catch (err) {
    console.warn('Failed to process business logo:', err.message);
  }

  templateName = (templateName || 'elegant')
    .toString()
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase();

  let templatePath = path.join(
    __dirname,
    '..',
    'templates',
    'receipts',
    `${templateName}.ejs`
  );

  if (!fs.existsSync(templatePath)) {
    templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'receipts',
      'elegant.ejs'
    );
  }

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const colors = generateColorVariants(brandColor || '#1e40af');

  const html = await ejs.renderFile(templatePath, {
    receipt,
    brandColor: brandColor || colors.primary,
    currencyIcon: currencyIcon || '',
    colors,
    businessLogo,
  });

  return withPage(async (page) => {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    return page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });
  });
}

module.exports = {
  generatePdfBufferFromInvoice,
  generatePdfBufferFromReceipt,
};