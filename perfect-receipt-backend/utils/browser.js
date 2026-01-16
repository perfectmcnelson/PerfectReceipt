// const os = require('os');

// let puppeteer;
// let chromium = null;
// let browserPromise = null;

// const isLocal = os.platform() === 'win32' || os.platform() === 'darwin';

// if (isLocal) {
//   puppeteer = require('puppeteer');
// } else {
//   puppeteer = require('puppeteer-core');
//   chromium = require('@sparticuz/chromium');
// }

// async function getLaunchOptions() {
//   const commonArgs = [
//     '--no-sandbox',
//     '--disable-setuid-sandbox',
//     '--disable-dev-shm-usage',
//     '--disable-gpu',
//   ];

//   // LOCAL (Windows / macOS)
//   if (!chromium) {
//     return {
//       headless: 'new',
//       args: commonArgs,
//     };
//   }

//   // SERVER (Linux / Render)
//   return {
//     args: chromium.args.concat(commonArgs),
//     defaultViewport: chromium.defaultViewport,
//     executablePath: await chromium.executablePath(),
//     headless: chromium.headless,
//   };
// }

// async function getBrowser() {
//   if (!browserPromise) {
//     browserPromise = (async () => {
//       const options = await getLaunchOptions();
//       const browser = await puppeteer.launch(options);

//       browser.on('disconnected', () => {
//         browserPromise = null;
//       });

//       return browser;
//     })();
//   }

//   return browserPromise;
// }

// async function withPage(fn) {
//   const browser = await getBrowser();
//   const page = await browser.newPage();

//   try {
//     return await fn(page);
//   } finally {
//     await page.close();
//   }
// }

// module.exports = {
//   withPage,
// };


// const os = require('os');

// let puppeteer;
// let chromium = null;
// let browserPromise = null;

// const platform = os.platform();
// const isWindows = platform === 'win32';
// const isMac = platform === 'darwin';
// const isLocal = isWindows || isMac;

// if (isLocal) {
//   puppeteer = require('puppeteer');
// } else {
//   puppeteer = require('puppeteer-core');
//   chromium = require('@sparticuz/chromium');
// }

// async function getLaunchOptions() {
//   // 🟢 WINDOWS / MAC (local dev)
//   if (isLocal) {
//     return {
//       headless: false,               // IMPORTANT: prevents startup deadlock
//       defaultViewport: null,
//       timeout: 60000,                // give Chrome time to boot
//       args: [
//         '--disable-extensions',
//         '--disable-background-networking',
//         '--disable-sync',
//         '--disable-translate',
//         '--no-first-run',
//         '--no-default-browser-check',
//       ],
//     };
//   }

//   // 🔵 LINUX / RENDER
//   return {
//     args: chromium.args,
//     defaultViewport: chromium.defaultViewport,
//     executablePath: await chromium.executablePath(),
//     headless: chromium.headless,
//     timeout: 60000,
//   };
// }

// async function getBrowser() {
//   if (!browserPromise) {
//     browserPromise = (async () => {
//       const options = await getLaunchOptions();
//       const browser = await puppeteer.launch(options);

//       browser.on('disconnected', () => {
//         browserPromise = null;
//       });

//       return browser;
//     })();
//   }

//   return browserPromise;
// }

// async function withPage(fn) {
//   const browser = await getBrowser();

//   // 🟢 Prevent profile lock issues
//   const context = await browser.createIncognitoBrowserContext;
//   const page = await context.newPage();

//   try {
//     return await fn(page);
//   } finally {
//     await page.close();
//     await context.close();
//   }
// }

// module.exports = { withPage };



// const os = require('os');
// let puppeteer;
// let chromium = null;
// let browserPromise = null;
// const platform = os.platform();
// const isWindows = platform === 'win32';
// const isMac = platform === 'darwin';
// const isLocal = isWindows || isMac;

// if (isLocal) {
//   puppeteer = require('puppeteer');
// } else {
//   puppeteer = require('puppeteer-core');
//   try {
//     chromium = require('@sparticuz/chromium');
//   } catch (err) {
//     console.warn('@sparticuz/chromium not available, ensure it\'s installed on Render');
//   }
// }

// async function getLaunchOptions() {
//   // 🟢 WINDOWS / MAC (local dev)
//   if (isLocal) {
//     return {
//       headless: 'new',                    // Use string 'new' instead of false
//       defaultViewport: { width: 1200, height: 800 },
//       timeout: 90000,                     // Increased for Windows startup
//       args: [
//         '--disable-extensions',
//         '--disable-background-networking',
//         '--disable-sync',
//         '--disable-translate',
//         '--no-first-run',
//         '--no-default-browser-check',
//         '--disable-dev-shm-usage',        // Helps on memory-constrained systems
//         '--disable-gpu',                   // Prevent GPU issues on Windows
//         '--single-process=false',         // Force multi-process (stable on Windows)
//       ],
//     };
//   }

//   // 🔵 LINUX / RENDER (serverless)
//   if (!chromium) {
//     throw new Error('@sparticuz/chromium is required for serverless environments. Install it on Render.');
//   }

//   return {
//     args: [...(chromium.args || []), '--disable-dev-shm-usage'],
//     defaultViewport: chromium.defaultViewport || { width: 1200, height: 800 },
//     executablePath: await chromium.executablePath(),
//     headless: chromium.headless || 'new',
//     timeout: 90000,
//   };
// }

// async function getBrowser() {
//   if (!browserPromise) {
//     browserPromise = (async () => {
//       try {
//         const options = await getLaunchOptions();
//         const browser = await puppeteer.launch(options);

//         browser.on('disconnected', () => {
//           console.log('Browser disconnected, resetting pool');
//           browserPromise = null;
//         });

//         return browser;
//       } catch (err) {
//         browserPromise = null; // Reset on error
//         throw new Error(`Failed to launch browser: ${err.message}`);
//       }
//     })();
//   }
//   return browserPromise;
// }

// async function withPage(fn) {
//   const browser = await getBrowser();
//   const context = await browser.createIncognitoBrowserContext();
//   const page = await context.newPage();

//   // Set reasonable timeouts
//   page.setDefaultTimeout(60000);
//   page.setDefaultNavigationTimeout(60000);

//   try {
//     return await fn(page);
//   } catch (err) {
//     console.error('Error in withPage:', err);
//     throw err;
//   } finally {
//     try {
//       await page.close();
//     } catch (e) {
//       console.warn('Error closing page:', e.message);
//     }
//     try {
//       await context.close();
//     } catch (e) {
//       console.warn('Error closing context:', e.message);
//     }
//   }
// }

// module.exports = { withPage };




const os = require('os');
const path = require('path');
let puppeteer;
let chromium = null;
let browserPromise = null;
let browserRetries = 0;
const MAX_RETRIES = 3;

const platform = os.platform();
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLocal = isWindows || isMac;

if (isLocal) {
  puppeteer = require('puppeteer');
} else {
  puppeteer = require('puppeteer-core');
  try {
    chromium = require('@sparticuz/chromium');
  } catch (err) {
    console.warn('@sparticuz/chromium not available, ensure it\'s installed on Render');
  }
}

async function getLaunchOptions() {
  // 🟢 WINDOWS / MAC (local dev)
  if (isLocal) {
    // Try to find Chrome/Chromium executable
    let executablePath = undefined;
    
    // Common Windows Chrome paths
    if (isWindows) {
      const windowsPaths = [
        path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
        path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      ];
      
      const fs = require('fs');
      for (const chromePath of windowsPaths) {
        if (fs.existsSync(chromePath)) {
          executablePath = chromePath;
          console.log(`Found Chrome at: ${executablePath}`);
          break;
        }
      }
    }

    return {
      headless: 'new',
      defaultViewport: { width: 1200, height: 800 },
      timeout: 120000,
      executablePath,
      args: [
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-translate',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-software-rasterizer',
        '--disable-extensions-except',
        '--disable-component-extensions-with-background-pages',
        '--disable-breakpad',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-service-autorun',
        '--password-store=basic',
      ],
    };
  }

  // 🔵 LINUX / RENDER (serverless)
  if (!chromium) {
    throw new Error('@sparticuz/chromium is required for serverless environments. Install it on Render.');
  }

  return {
    args: [...(chromium.args || []), '--disable-dev-shm-usage'],
    defaultViewport: chromium.defaultViewport || { width: 1200, height: 800 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless || 'new',
    timeout: 120000,
  };
}

async function launchBrowser() {
  const options = await getLaunchOptions();
  console.log('Launching browser with options:', {
    headless: options.headless,
    timeout: options.timeout,
    executablePath: options.executablePath ? '(set)' : '(auto)',
  });

  try {
    const browser = await puppeteer.launch(options);
    console.log('Browser launched successfully');
    browserRetries = 0; // Reset retries on success
    return browser;
  } catch (err) {
    console.error('Browser launch failed:', err.message);
    throw err;
  }
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      let lastError;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`Browser launch attempt ${attempt}/${MAX_RETRIES}`);
          const browser = await launchBrowser();

          browser.on('disconnected', () => {
            console.log('Browser disconnected, resetting pool');
            browserPromise = null;
            browserRetries++;
          });

          browser.on('error', (err) => {
            console.error('Browser error event:', err);
            browserPromise = null;
          });

          return browser;
        } catch (err) {
          lastError = err;
          console.warn(`Attempt ${attempt} failed:`, err.message);

          if (attempt < MAX_RETRIES) {
            // Wait before retrying (exponential backoff)
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      browserPromise = null;
      throw new Error(`Failed to launch browser after ${MAX_RETRIES} attempts: ${lastError.message}`);
    })();
  }

  return browserPromise;
}

async function withPage(fn) {
  let browser;
  let page;

  try {
    browser = await getBrowser();
    
    // Create page directly (simpler and more compatible)
    page = await browser.newPage();

    // Set reasonable timeouts
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    // Add error handler
    page.on('error', (err) => {
      console.error('Page error:', err);
    });

    return await fn(page);
  } catch (err) {
    console.error('Error in withPage:', err.message);
    throw err;
  } finally {
    // Cleanup
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.warn('Error closing page:', e.message);
      }
    }

    // Don't close browser - keep it alive for next request
  }
}

// Graceful shutdown
process.on('exit', async () => {
  if (browserPromise) {
    try {
      const browser = await browserPromise;
      await browser.close();
      console.log('Browser closed on process exit');
    } catch (err) {
      console.warn('Error closing browser on exit:', err.message);
    }
  }
});

module.exports = { withPage };