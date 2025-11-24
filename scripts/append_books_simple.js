import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const SEEDS_SQL_PATH = path.join(PROJECT_ROOT, 'server', 'database', 'seeds.sql');

// Book topics and content templates (Same as generate_books.js)
const BOOKS = [
    { id: 1, title: 'Climate Change and Environmental Science', difficulty: 'B2', isPro: false },
    { id: 2, title: 'Cognitive Psychology and Human Behavior', difficulty: 'B2', isPro: true },
    { id: 3, title: 'Global Economics and Trade Systems', difficulty: 'C1', isPro: true },
    { id: 4, title: 'Artificial Intelligence and Machine Learning', difficulty: 'C1', isPro: true },
    { id: 5, title: 'Modern Political Theory and Governance', difficulty: 'B2', isPro: true },
    { id: 6, title: 'Biotechnology and Genetic Engineering', difficulty: 'C1', isPro: true },
    { id: 7, title: 'Sustainable Urban Development', difficulty: 'B2', isPro: true },
    { id: 8, title: 'Neuroscience and Brain Function', difficulty: 'C1', isPro: true },
    { id: 9, title: 'Renewable Energy Technologies', difficulty: 'B2', isPro: true },
    { id: 10, title: 'Cultural Anthropology and Social Structures', difficulty: 'B2', isPro: true },
    { id: 11, title: 'Quantum Physics and Modern Cosmology', difficulty: 'C1', isPro: true },
    { id: 12, title: 'International Relations and Diplomacy', difficulty: 'B2', isPro: true },
    { id: 13, title: 'Medical Ethics and Healthcare Policy', difficulty: 'C1', isPro: true },
    { id: 14, title: 'Digital Marketing and Consumer Psychology', difficulty: 'B2', isPro: true },
    { id: 15, title: 'Philosophy of Science and Epistemology', difficulty: 'C1', isPro: true }
];

const SAMPLE_PARAGRAPHS = [
    "Climate change represents one of the most significant challenges facing humanity in the twenty-first century. The scientific consensus indicates that global temperatures have risen approximately 1.1 degrees Celsius since pre-industrial times, primarily due to anthropogenic greenhouse gas emissions.",
    "Cognitive psychology examines the mental processes underlying human behavior, including perception, memory, attention, and decision-making. Researchers in this field employ various methodologies to investigate how individuals acquire, process, and store information.",
    "The global economy operates as an interconnected system where trade, finance, and production transcend national boundaries. International trade agreements facilitate the exchange of goods and services between nations.",
    "Artificial intelligence has evolved from a theoretical concept to a transformative technology that permeates numerous aspects of modern life. Machine learning algorithms enable computers to identify patterns in vast datasets and make predictions without explicit programming.",
    "Political theory provides frameworks for understanding power, governance, and justice in human societies. Democratic systems emphasize popular sovereignty and individual rights, while authoritarian regimes concentrate power in the hands of a few.",
    "Biotechnology harnesses biological processes for practical applications, ranging from pharmaceutical development to agricultural innovation. Genetic engineering techniques allow scientists to modify organisms at the molecular level.",
    "Urban development must balance economic growth with environmental sustainability and social equity. Sustainable cities integrate green infrastructure, efficient public transportation, and mixed-use zoning to reduce carbon emissions.",
    "Neuroscience investigates the structure and function of the nervous system, seeking to understand how billions of neurons communicate to produce thoughts, emotions, and behaviors.",
    "Renewable energy sources offer sustainable alternatives to fossil fuels, mitigating climate change while meeting growing energy demands. Solar photovoltaic technology converts sunlight directly into electricity.",
    "Cultural anthropology examines human societies through the lens of culture, exploring how beliefs, practices, and social structures vary across different groups. Ethnographic research involves immersive fieldwork."
];

function generatePageContent(bookIndex, pageNumber) {
    const paragraphIndex = (bookIndex * 100 + pageNumber) % SAMPLE_PARAGRAPHS.length;
    let content = SAMPLE_PARAGRAPHS[paragraphIndex];
    if (pageNumber % 10 === 0) content += " This chapter concludes with a summary of key concepts.";
    else if (pageNumber % 5 === 0) content += " Empirical studies have demonstrated the validity of these theoretical frameworks.";
    return content;
}

function generateBook(book) {
    const pages = [];
    for (let i = 1; i <= 100; i++) {
        pages.push({ pageNumber: i, content: generatePageContent(book.id, i) });
    }
    return pages;
}

function appendBooks() {
    console.log('Appending books to seeds.sql...');
    let sqlStatements = ['\n\n-- Seeds for academic books'];

    for (const book of BOOKS) {
        const pages = generateBook(book);
        const contentJSON = JSON.stringify(pages);
        const safeContent = contentJSON.replace(/'/g, "''");
        const safeTitle = book.title.replace(/'/g, "''");
        const isPro = book.isPro ? 'TRUE' : 'FALSE';

        sqlStatements.push(`
INSERT INTO books (id, title, author, content, difficulty, is_pro, total_pages, created_at)
VALUES ('${book.id}', '${safeTitle}', 'YDS Master Pro', '${safeContent}', '${book.difficulty}', ${isPro}, 100, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    difficulty = EXCLUDED.difficulty,
    is_pro = EXCLUDED.is_pro,
    total_pages = EXCLUDED.total_pages;
        `.trim());
    }

    fs.appendFileSync(SEEDS_SQL_PATH, sqlStatements.join('\n\n'));
    console.log('✅ Books appended successfully!');
}

appendBooks();
