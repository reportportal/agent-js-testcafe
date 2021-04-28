import { Selector } from 'testcafe';

fixture`Getting Started`.page`http://devexpress.github.io/testcafe/example
`.meta({ description: 'first suit description' });

test('My first test', async (page) => {
  await page
    .typeText('#developer-name', 'John Smith')
    .click('#submit-button')
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector('#article-header').innerText)
    .eql('Thank you, John Smith!');
}).meta({
  description: 'first test description',
});

fixture`The next fixture`.page`http://devexpress.github.io/testcafe/example`.meta({
  description: 'second suit description',
});

test('My second test', async (page) => {
  await page
    .typeText('#developer-name', 'John Smith')
    .click('#submit-button')

    .expect(Selector('#article-header').innerText)
    .eql('Thank you, Baraka Omaba!');
}).meta({
  description: 'second test description',
});
