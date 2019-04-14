/* const puppeteer = require('puppeteer'); */
/* const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory'); */
const Page = require('./helpers/page');
let /* browser,  */page;

beforeEach(async () => {
    /* browser = await puppeteer.launch({
        headless: false
    });
    page = await browser.newPage(); */
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('The header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});

test('Clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]');

    expect(text).toEqual('Logout');
});