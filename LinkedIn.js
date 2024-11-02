const puppeteer = require('puppeteer');

// Configuration details
const config = {
  email: 'example@gmail.com',
  password: 'example@12334',
  jobTitle: 'Business Analyst',
  filterTimePosted: 'Past Week',
  filterExperienceLevel: 'Entry level',
  // Add more filters as needed
  filterEasyApply: true,
  filterRemote: true
};

// Utility function to wait
const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);

  try {
    // Set a user agent to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
    );

    // Login to LinkedIn
    await loginToLinkedIn(page);

    // Go to the jobs section and search for a specific job
    await searchJobs(page, config.jobTitle, config.filterTimePosted, config.filterExperienceLevel, config.filterEasyApply, config.filterRemote);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();

// Function to handle LinkedIn login
const loginToLinkedIn = async (page) => {
  try {
    console.log('Navigating to LinkedIn login page...');
    await page.goto('https://www.linkedin.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });

    // Wait for the username input field to load
    await page.waitForSelector('#username', { timeout: 60000 });

    // Type in the email and password
    await page.type('#username', config.email);
    await page.type('#password', config.password);

    // Click login button and wait for navigation
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      }),
    ]);

    console.log('Logged in successfully');
  } catch (error) {
    throw new Error('Failed to log in to LinkedIn: ' + error.message);
  }
};

// Function to search for jobs and apply filters
const searchJobs = async (page, jobTitle, filterTimePosted, filterExperienceLevel, filterEasyApply, filterRemote) => {
  try {
    console.log(`Searching for jobs with the title: ${jobTitle}...`);

    // Navigate to the jobs section
    await page.goto('https://www.linkedin.com/jobs', {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });

    // Wait for the search bar to load
    await page.waitForSelector('.jobs-search-box__text-input', {
      timeout: 60000,
    });

    // Type the job title into the search bar
    await page.type('.jobs-search-box__text-input', jobTitle);

    // Press the Enter key to initiate the search
    await page.keyboard.press('Enter');

    // Wait for the search results to load
    await page.waitForNavigation({
      waitUntil: 'networkidle2',
      timeout: 120000,
    });

    // Click on "Date posted" filter button
    await page.waitForSelector('#searchFilter_timePostedRange', { timeout: 60000 });
    await page.click('#searchFilter_timePostedRange');

    // Click on the desired "Date posted" option based on filterTimePosted
    const timePostedSelector = `li[aria-label="${filterTimePosted}"]`;
    await page.waitForSelector(timePostedSelector, { timeout: 60000 });
    await page.click(timePostedSelector);
    console.log(`Applied filter: ${filterTimePosted}`);

    // Click on "Experience level" filter button
    await page.waitForSelector('#searchFilter_experienceLevel', { timeout: 60000 });
    await page.click('#searchFilter_experienceLevel');

    // Click on the desired "Experience level" option based on filterExperienceLevel
    const experienceLevelSelector = `li[aria-label="${filterExperienceLevel}"]`;
    await page.waitForSelector(experienceLevelSelector, { timeout: 60000 });
    await page.click(experienceLevelSelector);
    console.log(`Applied filter: ${filterExperienceLevel}`);

    // Click on "Easy Apply" filter if enabled
    if (filterEasyApply) {
      await page.waitForSelector('#searchFilter_easyApply', { timeout: 60000 });
      await page.click('#searchFilter_easyApply');
      console.log('Applied filter: Easy Apply');
    }

    // Click on "Remote" filter if enabled
    if (filterRemote) {
      await page.waitForSelector('#searchFilter_remoteType', { timeout: 60000 });
      await page.click('#searchFilter_remoteType');
      console.log('Applied filter: Remote');
    }

    // Wait for filters to apply (adjust timeout as needed)
    await wait(3000);
  } catch (error) {
    throw new Error('Failed to search for jobs: ' + error.message);
  }
};