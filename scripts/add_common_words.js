import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const adapter = new JSONFile('db.json');
const db = new Low(adapter, {});

// Common English words with Turkish translations
const commonWords = {
    // Articles & Determiners
    'the': 'belirli tanımlık',
    'a': 'belirsiz tanımlık',
    'an': 'belirsiz tanımlık',
    'this': 'bu',
    'that': 'şu, o',
    'these': 'bunlar',
    'those': 'şunlar, onlar',

    // Pronouns
    'it': 'o (nesneler için)',
    'its': 'onun',
    'their': 'onların',
    'our': 'bizim',
    'your': 'senin, sizin',

    // Prepositions
    'of': '-in, -nın (aitlik)',
    'in': 'içinde, -de',
    'on': 'üzerinde',
    'at': '-de, -da',
    'to': '-e, -a',
    'for': 'için',
    'with': 'ile',
    'by': 'tarafından',
    'from': '-den, -dan',
    'about': 'hakkında',
    'between': 'arasında',
    'through': 'boyunca, aracılığıyla',
    'over': 'üzerinde',
    'beyond': 'ötesinde',

    // Conjunctions
    'and': 've',
    'or': 'veya',
    'but': 'ama, fakat',
    'because': 'çünkü',
    'although': 'her ne kadar',
    'while': 'iken, sürerken',
    'if': 'eğer',
    'when': 'ne zaman',
    'where': 'nerede',
    'how': 'nasıl',
    'why': 'neden',

    // Verbs (be, have, do)
    'is': 'olmak (tekil)',
    'are': 'olmak (çoğul)',
    'was': 'idi',
    'were': 'idiler',
    'be': 'olmak',
    'been': 'olmuş',
    'being': 'olma',
    'have': 'sahip olmak',
    'has': 'sahip olmak (tekil)',
    'had': 'sahipti',
    'having': 'sahip olma',
    'do': 'yapmak',
    'does': 'yapmak (tekil)',
    'did': 'yaptı',
    'done': 'yapılmış',
    'doing': 'yapma',
    'can': '-ebilmek',
    'could': '-ebilirdi',
    'will': '-ecek (gelecek zaman)',
    'would': '-erdi',
    'should': '-meli',
    'must': '-meli, zorunda',
    'may': '-ebilir (izin)',
    'might': '-ebilir (olasılık)',

    // Common academic words
    'research': 'araştırma',
    'study': 'çalışma, araştırma',
    'studies': 'çalışmalar',
    'analysis': 'analiz',
    'method': 'yöntem',
    'methodology': 'metodoloji',
    'approach': 'yaklaşım',
    'theory': 'teori',
    'theories': 'teoriler',
    'evidence': 'kanıt',
    'data': 'veri',
    'result': 'sonuç',
    'results': 'sonuçlar',
    'finding': 'bulgu',
    'findings': 'bulgular',
    'conclusion': 'sonuç',
    'implications': 'çıkarımlar',
    'significant': 'önemli',
    'important': 'önemli',
    'complex': 'karmaşık',
    'comprehensive': 'kapsamlı',
    'contemporary': 'çağdaş',
    'traditional': 'geleneksel',
    'modern': 'modern',
    'recent': 'yakın zamanlı',
    'current': 'güncel',
    'future': 'gelecek',
    'past': 'geçmiş',
    'present': 'şimdiki',
    'various': 'çeşitli',
    'different': 'farklı',
    'similar': 'benzer',
    'multiple': 'çoklu',
    'several': 'birkaç',
    'many': 'birçok',
    'few': 'az',
    'some': 'bazı',
    'all': 'hepsi',
    'each': 'her biri',
    'every': 'her',
    'such': 'böyle',
    'other': 'diğer',
    'another': 'bir diğer',
    'new': 'yeni',
    'old': 'eski',
    'further': 'daha ileri',
    'more': 'daha fazla',
    'most': 'en çok',
    'less': 'daha az',
    'least': 'en az',
    'relationship': 'ilişki',
    'connections': 'bağlantılar',
    'framework': 'çerçeve',
    'perspective': 'bakış açısı',
    'avenues': 'yollar',
    'investigation': 'soruşturma',
    'developments': 'gelişmeler',
    'scientists': 'bilim insanları',
    'researchers': 'araştırmacılar',
    'scholars': 'akademisyenler',
    'experts': 'uzmanlar',
    'process': 'süreç',
    'examination': 'inceleme',
    'factors': 'faktörler',
    'outcome': 'sonuç',
    'insights': 'içgörüler',
    'phenomenon': 'olgu',
    'discourse': 'söylem',
    'decades': 'on yıllar',
    'arguments': 'argümanlar',
    'nature': 'doğa, nitelik',
    'debate': 'tartışma',
    'perspectives': 'bakış açıları',
    'considerations': 'değerlendirmeler',
    'dimensions': 'boyutlar',
    'understanding': 'anlayış',
    'empirical': 'deneysel',
    'role': 'rol',
    'mechanisms': 'mekanizmalar',
    'questions': 'sorular',
    'causality': 'nedensellik',
    'hypothesis': 'hipotez',
    'attempted': 'denedi',
    'demonstrates': 'gösterir',
    'supports': 'destekler',
    'extend': 'genişletmek',
    'plays': 'oynar',
    'continues': 'devam eder',
    'requires': 'gerektirir',
    'represents': 'temsil eder',
    'attempted': 'denedi'
};

async function addMissingWords() {
    await db.read();

    const existingWords = db.data.words || [];
    const existingTerms = new Set(existingWords.map(w => w.term.toLowerCase()));

    let addedCount = 0;

    for (const [term, translation] of Object.entries(commonWords)) {
        if (!existingTerms.has(term.toLowerCase())) {
            db.data.words.push({
                id: `${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                term: term,
                type: 'common',
                definition_tr: translation,
                synonyms: '',
                examples: []
            });
            addedCount++;
            console.log(`✅ Added: ${term} = ${translation}`);
        }
    }

    await db.write();
    console.log(`\n✅ Added ${addedCount} new words to database`);
    console.log(`📊 Total words now: ${db.data.words.length}`);
}

addMissingWords().catch(console.error);
