import { config, fields, collection, singleton } from '@keystatic/core';

// Shared field helpers so every page edits the same way.
const image = (label: string, dir: string) =>
	fields.image({
		label,
		directory: `public/images/${dir}`,
		publicPath: `/images/${dir}/`,
	});

const paragraphs = (label: string, description?: string) =>
	fields.text({
		label,
		multiline: true,
		description: description ?? 'Leave a blank line between paragraphs.',
	});

const seo = () =>
	fields.object(
		{
			title: fields.text({ label: 'Page title (browser tab)' }),
			description: fields.text({ label: 'Search description', multiline: true }),
		},
		{ label: 'SEO' },
	);

const titledItems = (label: string, itemLabel: string) =>
	fields.array(
		fields.object({
			title: fields.text({ label: 'Title' }),
			text: fields.text({ label: 'Text', multiline: true }),
		}),
		{ label, itemLabel: (props) => props.fields.title.value || itemLabel },
	);

export default config({
	storage: {
		kind: 'local',
	},
	ui: {
		brand: { name: 'Elyon' },
		navigation: {
			Pages: ['home', 'story', 'mission', 'faq', 'contact'],
			Products: ['products'],
			Site: ['settings'],
		},
	},
	singletons: {
		settings: singleton({
			label: 'Site settings',
			path: 'src/content/settings',
			schema: {
				announcements: fields.array(fields.text({ label: 'Message' }), {
					label: 'Announcement bar',
					description:
						'Short messages across the top of every page. The first is centred (and is the only one shown on mobile); the rest sit on the right on desktop.',
					itemLabel: (props) => props.value,
				}),
				email: fields.text({ label: 'Contact email' }),
				instagram: fields.url({ label: 'Instagram URL' }),
				facebook: fields.url({ label: 'Facebook URL' }),
				newsletterHeading: fields.text({ label: 'Newsletter heading' }),
				newsletterText: fields.text({ label: 'Newsletter text', multiline: true }),
				footerTagline: fields.text({ label: 'Footer tagline' }),
			},
		}),
		home: singleton({
			label: 'Home',
			path: 'src/content/pages/home',
			schema: {
				seo: seo(),
				hero: fields.object(
					{
						eyebrow: fields.text({ label: 'Label' }),
						heading: fields.text({ label: 'Heading' }),
						text: fields.text({ label: 'Text', multiline: true }),
						ctaLabel: fields.text({ label: 'Button label' }),
						image: image('Image', 'home'),
					},
					{ label: 'Hero' },
				),
				system: fields.object(
					{
						eyebrow: fields.text({ label: 'Label' }),
						heading: fields.text({ label: 'Heading' }),
						text: fields.text({ label: 'Text', multiline: true }),
					},
					{ label: 'The system (product range intro)' },
				),
				pillars: titledItems('Pillars', 'Pillar'),
				statement: fields.object(
					{
						text: fields.text({ label: 'Statement' }),
						image: image('Background image', 'home'),
					},
					{ label: 'Statement band' },
				),
				story: fields.object(
					{
						eyebrow: fields.text({ label: 'Label' }),
						heading: fields.text({ label: 'Heading' }),
						text: fields.text({ label: 'Text', multiline: true }),
						image: image('Image', 'home'),
					},
					{ label: 'Story teaser' },
				),
				popup: fields.object(
					{
						enabled: fields.checkbox({ label: 'Show the sign-up popup', defaultValue: true }),
						eyebrow: fields.text({ label: 'Label' }),
						heading: fields.text({ label: 'Heading' }),
						text: fields.text({ label: 'Text', multiline: true }),
						buttonLabel: fields.text({ label: 'Button label' }),
						image: image('Image (desktop only)', 'home'),
					},
					{
						label: 'Sign-up popup',
						description:
							'Opens shortly after the home page loads, every time it loads.',
					},
				),
			},
		}),
		story: singleton({
			label: 'Our Story',
			path: 'src/content/pages/story',
			schema: {
				seo: seo(),
				eyebrow: fields.text({ label: 'Label' }),
				heading: fields.text({ label: 'Heading' }),
				intro: fields.text({ label: 'Intro', multiline: true }),
				image: image('Image', 'story'),
				body: paragraphs('Story'),
				pullQuote: fields.text({ label: 'Pull quote', multiline: true }),
				secondImage: image('Second image', 'story'),
				personality: titledItems('Who we are', 'Trait'),
			},
		}),
		mission: singleton({
			label: 'Mission',
			path: 'src/content/pages/mission',
			schema: {
				seo: seo(),
				eyebrow: fields.text({ label: 'Label' }),
				heading: fields.text({ label: 'Heading' }),
				mission: fields.text({ label: 'Mission statement', multiline: true }),
				vision: fields.text({ label: 'Vision statement', multiline: true }),
				image: image('Image', 'mission'),
				valuesHeading: fields.text({ label: 'Values heading' }),
				values: titledItems('Values', 'Value'),
				promise: fields.text({ label: 'Closing line' }),
			},
		}),
		faq: singleton({
			label: 'FAQ',
			path: 'src/content/pages/faq',
			schema: {
				seo: seo(),
				eyebrow: fields.text({ label: 'Label' }),
				heading: fields.text({ label: 'Heading' }),
				intro: fields.text({ label: 'Intro', multiline: true }),
				groups: fields.array(
					fields.object({
						title: fields.text({ label: 'Group title' }),
						items: fields.array(
							fields.object({
								question: fields.text({ label: 'Question' }),
								answer: paragraphs('Answer'),
							}),
							{ label: 'Questions', itemLabel: (props) => props.fields.question.value || 'Question' },
						),
					}),
					{ label: 'Question groups', itemLabel: (props) => props.fields.title.value || 'Group' },
				),
			},
		}),
		contact: singleton({
			label: 'Contact',
			path: 'src/content/pages/contact',
			schema: {
				seo: seo(),
				eyebrow: fields.text({ label: 'Label' }),
				heading: fields.text({ label: 'Heading' }),
				intro: fields.text({ label: 'Intro', multiline: true }),
				responseTime: fields.text({ label: 'Response time note' }),
				topics: fields.array(fields.text({ label: 'Topic' }), {
					label: 'Enquiry topics',
					itemLabel: (props) => props.value,
				}),
			},
		}),
	},
	collections: {
		products: collection({
			label: 'Products',
			slugField: 'name',
			path: 'src/content/products/*',
			columns: ['step'],
			schema: {
				name: fields.slug({ name: { label: 'Product name' } }),
				step: fields.integer({ label: 'Step in the system', description: '1, 2 or 3. Sets the order on the site.' }),
				stepLabel: fields.text({ label: 'Step label', description: 'e.g. Cleanse' }),
				keyNotes: fields.text({ label: 'Key notes', description: 'e.g. Peppermint + Charcoal' }),
				summary: fields.text({ label: 'Short summary', multiline: true }),
				status: fields.select({
					label: 'Status',
					options: [
						{ label: 'Coming soon', value: 'coming-soon' },
						{ label: 'Available', value: 'available' },
					],
					defaultValue: 'coming-soon',
				}),
				price: fields.text({ label: 'Price', description: 'Leave blank until confirmed.' }),
				size: fields.text({ label: 'Size', description: 'e.g. 250 mL' }),
				image: image('Product image', 'products'),
				description: paragraphs('Description'),
				benefits: fields.array(fields.text({ label: 'Benefit' }), {
					label: 'What it does',
					itemLabel: (props) => props.value,
				}),
				ingredients: titledItems('Key ingredients', 'Ingredient'),
				howToUse: fields.text({ label: 'How to use', multiline: true }),
				texture: fields.text({ label: 'Texture & finish' }),
				freeFrom: fields.text({ label: 'Free from' }),
				seoDescription: fields.text({ label: 'Search description', multiline: true }),
			},
		}),
	},
});
