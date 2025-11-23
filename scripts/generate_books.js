import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const adapter = new JSONFile('db.json');
const db = new Low(adapter, {});

// Academic book topics for YDS preparation
const bookTopics = [
    {
        title: "Climate Change and Environmental Science",
        topic: "environmental_science",
        description: "An in-depth exploration of climate change, its causes, effects, and potential solutions from a scientific perspective.",
        coverColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        coverIcon: "🌍"
    },
    {
        title: "Cognitive Psychology and Human Behavior",
        topic: "psychology",
        description: "Understanding the mechanisms of human cognition, memory, perception, and behavioral patterns.",
        coverColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        coverIcon: "🧠"
    },
    {
        title: "Global Economics and Trade Systems",
        topic: "economics",
        description: "Analysis of international trade, economic theories, market dynamics, and global financial systems.",
        coverColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        coverIcon: "📊"
    },
    {
        title: "Artificial Intelligence and Machine Learning",
        topic: "technology",
        description: "Comprehensive overview of AI development, machine learning algorithms, and their societal implications.",
        coverColor: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        coverIcon: "🤖"
    },
    {
        title: "Modern Political Theory and Governance",
        topic: "political_science",
        description: "Examination of contemporary political systems, democratic principles, and governance structures.",
        coverColor: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        coverIcon: "⚖️"
    },
    {
        title: "Biotechnology and Genetic Engineering",
        topic: "biotechnology",
        description: "Exploring advances in genetic modification, CRISPR technology, and ethical considerations in biotechnology.",
        coverColor: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
        coverIcon: "🧬"
    },
    {
        title: "Sustainable Urban Development",
        topic: "urban_planning",
        description: "Strategies for creating sustainable cities, managing urban growth, and improving quality of life.",
        coverColor: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        coverIcon: "🏙️"
    },
    {
        title: "Neuroscience and Brain Function",
        topic: "neuroscience",
        description: "Understanding neural networks, brain plasticity, and the biological basis of consciousness.",
        coverColor: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        coverIcon: "⚡"
    },
    {
        title: "Renewable Energy Technologies",
        topic: "energy",
        description: "Comprehensive analysis of solar, wind, and alternative energy sources for a sustainable future.",
        coverColor: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        coverIcon: "☀️"
    },
    {
        title: "Cultural Anthropology and Social Structures",
        topic: "anthropology",
        description: "Study of human cultures, social organizations, and the evolution of societal norms.",
        coverColor: "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)",
        coverIcon: "🗿"
    }
];

// Sample academic paragraphs with placeholders for vocabulary
const paragraphTemplates = [
    "The {verb1} nature of {noun1} has led researchers to {verb2} new methodologies. This {adjective1} approach demonstrates how {noun2} can {verb3} our understanding of complex phenomena. Scientists {verb4} that {adjective2} evidence supports this hypothesis.",
    "Contemporary studies {verb1} the {adjective1} relationship between {noun1} and {noun2}. Researchers have attempted to {verb2} these connections through {adjective2} analysis. The findings {verb3} significant implications for future research.",
    "The {adjective1} framework {verb1} a comprehensive understanding of {noun1}. Scholars {verb2} that this {adjective2} perspective can {verb3} traditional theories. Such approaches {verb4} new avenues for investigation.",
    "Recent developments in {noun1} have {verb1} the way scientists {verb2} complex problems. This {adjective1} shift represents a {adjective2} change in methodology. Experts {verb3} that further research will {verb4} these findings.",
    "The {verb1} process of {noun1} requires {adjective1} examination. Researchers must {verb2} various factors that {verb3} the outcome. This {adjective2} analysis {verb4} deeper insights into the phenomenon.",
    "Academic discourse on {noun1} has {verb1} considerably over recent decades. Scholars {verb2} {adjective1} evidence to {verb3} their arguments. The {adjective2} nature of this debate continues to {verb4} new perspectives.",
    "The {adjective1} implications of {noun1} extend beyond {adjective2} considerations. Researchers {verb1} that comprehensive analysis must {verb2} multiple dimensions. This approach {verb3} a more {adjective2} understanding.",
    "Empirical studies {verb1} that {noun1} plays a {adjective1} role in {noun2}. Scientists {verb2} to {verb3} the underlying mechanisms. Their {adjective2} findings {verb4} important questions about causality.",
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateParagraph(words) {
    const template = getRandomElement(paragraphTemplates);
    const verbs = words.filter(w => w.type === 'verb');
    const nouns = words.filter(w => w.type === 'noun');
    const adjectives = words.filter(w => w.type === 'adjective');

    let paragraph = template
        .replace('{verb1}', getRandomElement(verbs).term)
        .replace('{verb2}', getRandomElement(verbs).term)
        .replace('{verb3}', getRandomElement(verbs).term)
        .replace('{verb4}', getRandomElement(verbs).term)
        .replace('{noun1}', getRandomElement(nouns).term)
        .replace('{noun2}', getRandomElement(nouns).term)
        .replace('{adjective1}', getRandomElement(adjectives).term)
        .replace('{adjective2}', getRandomElement(adjectives).term);

    return paragraph;
}

function generatePage(pageNum, words, topic) {
    const paragraphsPerPage = 3;
    const paragraphs = [];

    for (let i = 0; i < paragraphsPerPage; i++) {
        paragraphs.push(generateParagraph(words));
    }

    return {
        pageNumber: pageNum,
        content: paragraphs.join(' ')
    };
}

async function generateBooks() {
    await db.read();

    if (!db.data.books) {
        db.data.books = [];
    }

    // Clear existing books
    db.data.books = [];

    const words = db.data.words || [];

    if (words.length < 50) {
        console.log('Not enough words in database. Please seed words first.');
        return;
    }

    console.log(`Generating 10 books with 100 pages each using ${words.length} academic words...`);

    for (let bookIndex = 0; bookIndex < bookTopics.length; bookIndex++) {
        const bookInfo = bookTopics[bookIndex];
        const pages = [];

        console.log(`Generating book ${bookIndex + 1}: ${bookInfo.title}`);

        for (let pageNum = 1; pageNum <= 100; pageNum++) {
            pages.push(generatePage(pageNum, words, bookInfo.topic));
            if (pageNum % 20 === 0) {
                console.log(`  - Generated ${pageNum}/100 pages`);
            }
        }

        const book = {
            id: bookIndex + 1,
            title: bookInfo.title,
            description: bookInfo.description,
            topic: bookInfo.topic,
            coverColor: bookInfo.coverColor,
            coverIcon: bookInfo.coverIcon,
            pages: pages,
            totalPages: 100,
            isPro: true,
            createdAt: new Date().toISOString()
        };

        db.data.books.push(book);
    }

    await db.write();
    console.log('Successfully generated 10 academic books!');
}

generateBooks().catch(console.error);
