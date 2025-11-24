import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const SEEDS_SQL_PATH = path.join(PROJECT_ROOT, 'server', 'database', 'seeds.sql');

// Book topics and content templates
const BOOKS = [
    {
        id: 1,
        title: 'Climate Change and Environmental Science',
        difficulty: 'B2',
        isPro: false // First book is free
    },
    {
        id: 2,
        title: 'Cognitive Psychology and Human Behavior',
        difficulty: 'B2',
        isPro: true
    },
    {
        id: 3,
        title: 'Global Economics and Trade Systems',
        difficulty: 'C1',
        isPro: true
    },
    {
        id: 4,
        title: 'Artificial Intelligence and Machine Learning',
        difficulty: 'C1',
        isPro: true
    },
    {
        id: 5,
        title: 'Modern Political Theory and Governance',
        difficulty: 'B2',
        isPro: true
    },
    {
        id: 6,
        title: 'Biotechnology and Genetic Engineering',
        difficulty: 'C1',
        isPro: true
    },
    {
        id: 7,
        title: 'Sustainable Urban Development',
        difficulty: 'B2',
        isPro: true
    },
    {
        id: 8,
        title: 'Neuroscience and Brain Function',
        difficulty: 'C1',
        isPro: true
    },
    {
        id: 9,
        title: 'Renewable Energy Technologies',
        difficulty: 'B2',
        isPro: true
    },
    {
        id: 10,
        title: 'Cultural Anthropology and Social Structures',
        difficulty: 'B2',
        isPro: true
    },
    {
        id: 11,
        title: 'Quantum Physics and Modern Cosmology',
        difficulty: 'C1',
        isPro: true
    },
    {
        id: 12,
        title: 'International Relations and Diplomacy',
        difficulty: 'B2',
        isPro: true
    },
    {
        id: 13,
        title: 'Medical Ethics and Healthcare Policy',
        difficulty: 'C1',
        isPro: true
    },
    {
        id: 14,
        title: 'Digital Marketing and Consumer Psychology',
        difficulty: 'B2',
        isPro: true
    },
    {
        id: 15,
        title: 'Philosophy of Science and Epistemology',
        difficulty: 'C1',
        isPro: true
    }
];

// Sample academic paragraphs (will be reused and varied)
const SAMPLE_PARAGRAPHS = [
    "Climate change represents one of the most significant challenges facing humanity in the twenty-first century. The scientific consensus indicates that global temperatures have risen approximately 1.1 degrees Celsius since pre-industrial times, primarily due to anthropogenic greenhouse gas emissions. This warming trend has precipitated numerous environmental consequences, including rising sea levels, increased frequency of extreme weather events, and disruptions to ecosystems worldwide.",

    "Cognitive psychology examines the mental processes underlying human behavior, including perception, memory, attention, and decision-making. Researchers in this field employ various methodologies to investigate how individuals acquire, process, and store information. Recent advances in neuroimaging technology have enabled scientists to observe brain activity in real-time, providing unprecedented insights into the neural mechanisms that support cognitive functions.",

    "The global economy operates as an interconnected system where trade, finance, and production transcend national boundaries. International trade agreements facilitate the exchange of goods and services between nations, while multinational corporations coordinate production across multiple countries to optimize efficiency and reduce costs. Understanding these complex economic relationships requires analyzing factors such as comparative advantage, exchange rates, and trade policies.",

    "Artificial intelligence has evolved from a theoretical concept to a transformative technology that permeates numerous aspects of modern life. Machine learning algorithms enable computers to identify patterns in vast datasets and make predictions without explicit programming. Deep learning, a subset of machine learning, utilizes neural networks with multiple layers to process complex information, achieving remarkable success in tasks such as image recognition and natural language processing.",

    "Political theory provides frameworks for understanding power, governance, and justice in human societies. Democratic systems emphasize popular sovereignty and individual rights, while authoritarian regimes concentrate power in the hands of a few. Contemporary political theorists debate questions concerning the proper role of government, the balance between liberty and security, and the mechanisms for ensuring accountability in political institutions.",

    "Biotechnology harnesses biological processes for practical applications, ranging from pharmaceutical development to agricultural innovation. Genetic engineering techniques allow scientists to modify organisms at the molecular level, introducing desired traits or eliminating undesirable characteristics. CRISPR-Cas9 technology has revolutionized gene editing, offering unprecedented precision and efficiency in manipulating genetic material.",

    "Urban development must balance economic growth with environmental sustainability and social equity. Sustainable cities integrate green infrastructure, efficient public transportation, and mixed-use zoning to reduce carbon emissions and enhance quality of life. Urban planners increasingly recognize the importance of creating walkable neighborhoods, preserving green spaces, and ensuring affordable housing to promote inclusive and resilient communities.",

    "Neuroscience investigates the structure and function of the nervous system, seeking to understand how billions of neurons communicate to produce thoughts, emotions, and behaviors. The human brain contains approximately 86 billion neurons, each forming thousands of synaptic connections with other cells. This intricate network enables complex cognitive abilities, from basic sensory processing to abstract reasoning and creative expression.",

    "Renewable energy sources offer sustainable alternatives to fossil fuels, mitigating climate change while meeting growing energy demands. Solar photovoltaic technology converts sunlight directly into electricity, while wind turbines harness kinetic energy from air currents. Advances in battery storage systems address the intermittency challenges associated with renewable energy, enabling more reliable integration into electrical grids.",

    "Cultural anthropology examines human societies through the lens of culture, exploring how beliefs, practices, and social structures vary across different groups. Ethnographic research involves immersive fieldwork, allowing anthropologists to observe and participate in the daily lives of the communities they study. This methodology provides rich, contextual understanding of cultural phenomena that quantitative approaches alone cannot capture."
];

function generatePageContent(bookIndex, pageNumber) {
    // Rotate through paragraphs and add variation
    const paragraphIndex = (bookIndex * 100 + pageNumber) % SAMPLE_PARAGRAPHS.length;
    let content = SAMPLE_PARAGRAPHS[paragraphIndex];

    // Add page-specific variation
    if (pageNumber % 10 === 0) {
        content += " This chapter concludes with a summary of key concepts and their implications for future research. Scholars continue to debate the methodological approaches best suited to investigating these complex phenomena, emphasizing the need for interdisciplinary collaboration.";
    } else if (pageNumber % 5 === 0) {
        content += " Empirical studies have demonstrated the validity of these theoretical frameworks across diverse contexts. Researchers employ both qualitative and quantitative methods to test hypotheses and refine existing models.";
    }

    return content;
}

function generateBook(book) {
    const pages = [];
    for (let i = 1; i <= 100; i++) {
        pages.push({
            pageNumber: i,
            content: generatePageContent(book.id, i)
        });
    }
    return pages;
}

async function generateBooksSQL() {
    console.log('Generating 15 academic books with 100 pages each...');

    let sqlStatements = [];
    sqlStatements.push('\n-- Seeds for academic books (15 books, 100 pages each)');

    for (const book of BOOKS) {
        const pages = generateBook(book);
        const contentJSON = JSON.stringify(pages);
        const safeContent = contentJSON.replace(/'/g, "''");
        const safeTitle = book.title.replace(/'/g, "''");
        const isPro = book.isPro ? 'TRUE' : 'FALSE';

        sqlStatements.push(`
INSERT INTO books (id, title, author, content, difficulty, is_pro, total_pages, created_at)
VALUES (${book.id}, '${safeTitle}', 'YDS Master Pro', '${safeContent}', '${book.difficulty}', ${isPro}, 100, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    difficulty = EXCLUDED.difficulty,
    is_pro = EXCLUDED.is_pro,
    total_pages = EXCLUDED.total_pages;
        `.trim());
    }

    // Read existing seeds.sql
    let existingSeeds = await fs.readFile(SEEDS_SQL_PATH, 'utf-8');

    // Remove old book seeds if they exist
    const bookSeedStart = existingSeeds.indexOf('-- Seeds for books');
    const userSeedStart = existingSeeds.indexOf('-- Seeds for users');

    if (bookSeedStart !== -1 && userSeedStart !== -1) {
        // Remove old book section
        existingSeeds = existingSeeds.substring(0, bookSeedStart) + existingSeeds.substring(userSeedStart);
    } else if (bookSeedStart !== -1) {
        // Remove old book section (no user section after)
        existingSeeds = existingSeeds.substring(0, bookSeedStart);
    }

    // Insert new book seeds before user seeds
    if (userSeedStart !== -1) {
        const insertPosition = existingSeeds.indexOf('-- Seeds for users');
        existingSeeds = existingSeeds.substring(0, insertPosition) +
            sqlStatements.join('\n') + '\n\n' +
            existingSeeds.substring(insertPosition);
    } else {
        // Append at the end
        existingSeeds += '\n' + sqlStatements.join('\n');
    }

    await fs.writeFile(SEEDS_SQL_PATH, existingSeeds);
    console.log(`✅ Generated ${BOOKS.length} books with 100 pages each`);
    console.log(`Total pages: ${BOOKS.length * 100}`);
}

generateBooksSQL().catch(console.error);
