import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const adapter = new JSONFile('db.json');
const db = new Low(adapter, {});

async function verifyWordTranslations() {
    await db.read();

    const words = db.data.words || [];

    console.log(`\n📚 Verifying ${words.length} words in database...\n`);

    let missingTranslations = 0;
    let emptyTranslations = 0;
    let validTranslations = 0;
    const issues = [];

    words.forEach((word, index) => {
        const hasIssue = {
            word: word.term,
            type: word.type,
            issues: []
        };

        // Check if definition_tr exists
        if (!word.definition_tr) {
            missingTranslations++;
            hasIssue.issues.push('Missing definition_tr field');
        } else if (word.definition_tr.trim() === '') {
            emptyTranslations++;
            hasIssue.issues.push('Empty definition_tr field');
        } else {
            validTranslations++;
        }

        // Check if examples exist
        if (!word.examples || word.examples.length === 0) {
            hasIssue.issues.push('Missing examples');
        }

        // Check if synonyms exist
        if (!word.synonyms || word.synonyms.trim() === '') {
            hasIssue.issues.push('Missing synonyms');
        }

        if (hasIssue.issues.length > 0) {
            issues.push(hasIssue);
        }
    });

    // Print summary
    console.log('='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Valid translations: ${validTranslations}`);
    console.log(`❌ Missing translations: ${missingTranslations}`);
    console.log(`⚠️  Empty translations: ${emptyTranslations}`);
    console.log(`📝 Total words: ${words.length}`);
    console.log('='.repeat(60));

    if (issues.length > 0) {
        console.log(`\n⚠️  Found ${issues.length} words with issues:\n`);
        issues.slice(0, 20).forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.word} (${item.type})`);
            item.issues.forEach(issue => {
                console.log(`   - ${issue}`);
            });
        });

        if (issues.length > 20) {
            console.log(`\n... and ${issues.length - 20} more words with issues.`);
        }
    } else {
        console.log('\n✅ All words have valid Turkish translations!');
    }

    // Group words by type
    const wordsByType = {
        verb: words.filter(w => w.type === 'verb').length,
        noun: words.filter(w => w.type === 'noun').length,
        adjective: words.filter(w => w.type === 'adjective').length,
        other: words.filter(w => !['verb', 'noun', 'adjective'].includes(w.type)).length
    };

    console.log('\n📊 Words by type:');
    console.log(`   Verbs: ${wordsByType.verb}`);
    console.log(`   Nouns: ${wordsByType.noun}`);
    console.log(`   Adjectives: ${wordsByType.adjective}`);
    if (wordsByType.other > 0) {
        console.log(`   Other: ${wordsByType.other}`);
    }

    console.log('\n✅ Verification complete!\n');
}

verifyWordTranslations().catch(console.error);
