// ==========================================================================
// db/schema.js — Table Creation & Mock Data Seeding
// Uses the smart queryWrapper so it works on both MySQL and SQLite
// ==========================================================================

const db = require('./queryWrapper');

// ---- Table Creation ----

async function createTables() {
    console.log('[Schema] Creating tables if they do not exist...');

    // Programmes table
    await db.query(`
        CREATE TABLE IF NOT EXISTS programmes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            exec_name VARCHAR(255) NOT NULL,
            exec_phone VARCHAR(100) NOT NULL,
            pex VARCHAR(255),
            duties TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);

    // Ensure columns exist on existing databases
    try {
        await db.query('ALTER TABLE programmes ADD COLUMN pex VARCHAR(255)');
        console.log('[Schema] Column "pex" added or already exists.');
    } catch (e) {
        // Ignore error if column already exists
    }

    try {
        await db.query('ALTER TABLE programmes ADD COLUMN duties TEXT');
        console.log('[Schema] Column "duties" added or already exists.');
    } catch (e) {
        // Ignore error if column already exists
    }

    // Team members table
    await db.query(`
        CREATE TABLE IF NOT EXISTS team_members (
            id SERIAL PRIMARY KEY,
            programme_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(100) NOT NULL,
            FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE CASCADE
        )
    `);

    // Create foreign key index for faster joins/deletes
    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_team_members_programme_id 
        ON team_members (programme_id)
    `);

    console.log('[Schema] ✅ Tables ready.');
}

// Seeding disabled by request

// ---- Public API ----

async function initializeSchema() {
    await createTables();

    const seedBatches = [
        {
            execName: "Aiswariya Nair",
            execPhone: "+1 (555) 019-2834",
            programmes: [
                "Malayalam Talk",
                "Subhashitham",
                "Paattum Porulum",
                "Kaalam Sakshi",
                "Obituary Programmes",
                "Sarga Keralam",
                "Sahitya Vedi",
                "Sahitya Rangam",
                "Akshara Sourabham",
                "Akshara Shlokam",
                "Maya Mudrakal",
                "Mozhiyam Oru Kadha",
                "Nalla Malayalam",
                "National Symposium of Poets",
                "Namukku Chuttum",
                "Pathravruthantham"
            ]
        },
        {
            execName: "Sevil Jihan",
            execPhone: "8547069079",
            programmes: [
                "Koottukarai",
                "Ullathu Parayam",
                "Baalalokam",
                "Reshmi",
                "Panchara Mittai",
                "Feature",
                "Nermozhi [3rd Week]",
                "Velli Velicham",
                "Innathe Chodhyam Uttaram",
                "Hello Akashvani Live (Gen - 1st Monday)"
            ]
        },
        {
            execName: "Ruby Babu",
            execPhone: "9447555679",
            programmes: [
                "Weekly drama",
                "Co- ordinated play",
                "Serial Play",
                "National Programme of Plays",
                "Kandhathum Kettathum",
                "Chumadu Thangi",
                "Hello Akashvani Live (Gen - 2nd Monday)",
                "Nermozhi [2nd Week]",
                "Itha Oru Chodyam"
            ]
        },
        {
            execName: "Dileep M.K",
            execPhone: "9446218356",
            programmes: [
                "Light Music",
                "Light Music Lesson",
                "Children's Choral Music",
                "Ekathara",
                "Gramaphone",
                "Raagarasam",
                "Geetam Sangeetham",
                "Community Singing Songs",
                "Quaran Parayanam",
                "Prabhathabheri on Thursdays Fridays and Saturdays",
                "Vidyabhyasarangam",
                "Hello Priya Geetham"
            ]
        },
        {
            execName: "Mridul Jacob",
            execPhone: "222",
            programmes: [
                "Yuvavani",
                "Campus Colours",
                "Nervazhi [Programme for the Visually Challenged]",
                "Thozhilali Mandalam",
                "Thozhil Darsanam",
                "Sanchari",
                "Hello Akashvani Live (Gen - 4th Monday)"
            ]
        },
        {
            execName: "Unnikrishnan V.S",
            execPhone: "9020444460",
            programmes: [
                "Thudithalam",
                "Nattuchinth",
                "Pattukalam",
                "Kadha Prasangam",
                "Purana Parayanam",
                "Mappillappattu",
                "Manoyanam",
                "Gandhi Smrithi",
                "Akasharacheppu",
                "Your Voice",
                "Hello Akashvani Live (Gen -3rd Monday)"
            ]
        },
        {
            execName: "Asha M.S",
            execPhone: "8608487264",
            programmes: [
                "Prakashadhara",
                "Ayur Arogyam",
                "Yoga Saukhyam",
                "Hello Akashvani [Live] - Hello Doctor",
                "Tamil Programme",
                "Science Programmes",
                "Njan Ente Priya Ganangal",
                "Charithrathil Innu"
            ]
        },
        {
            execName: "Shibu George",
            execPhone: "9434262141",
            programmes: [
                "VayalumVeedum",
                "Haritham Hello Akshavani",
                "Karshika Meghala Varthakal",
                "SportsProgramme",
                "Hindi Programmes",
                "HindiLessons",
                "Western MusicProgrammes",
                "Saturday Night Fever",
                "Sunday Selection",
                "English Talk",
                "Good English"
            ]
        },
        {
            execName: "Santhosh Kumar .G",
            execPhone: "9446534877",
            programmes: [
                "Niyamarangam",
                "Hello Akashvani Live Niyamarangam",
                "Sayanthanam",
                "Malinyamuktham Navakeralam",
                "Gramakeralam",
                "Radio Grama Rangam",
                "Nagara Puranam",
                "Nermozhi – 4th Week"
            ]
        },
        {
            execName: "Manesh M. P",
            execPhone: "9947644490",
            programmes: [
                "Ragamrutham",
                "Sangeetha Sudha",
                "Gaana Kairali",
                "Sangeetha Smruthi",
                "Sangeetha Sadhakam",
                "Sangeetha Sarani",
                "Layavinyasam",
                "Enthoro Mahaanubhavalu",
                "National Programme of Music",
                "Chembai/Swathi/Navarathri Music Festivals",
                "Mann Ki Baat",
                "Prabhathabheri on Sunday MondayTuesday and Wednesday",
                "Gandhi Margam",
                "Nermozhi – 1st week",
                "Hello andeshagaanam",
                "Smruthi Madhuram"
            ]
        }
    ];

    try {
        // Fetch all existing programmes in a single query to optimize startup time
        const [existingRows] = await db.query("SELECT LOWER(name) as name FROM programmes");
        const existingNames = new Set((existingRows || []).map(r => r.name));

        for (const batch of seedBatches) {
            for (const progName of batch.programmes) {
                if (!existingNames.has(progName.toLowerCase())) {
                    await db.query(
                        "INSERT INTO programmes (name, exec_name, exec_phone, pex, duties) VALUES (?, ?, ?, ?, ?)",
                        [progName, batch.execName, batch.execPhone, batch.execName, ""]
                    );
                    console.log(`[Schema] Seeded "${progName}" for ${batch.execName}`);
                }
            }
        }
    } catch (err) {
        console.error('[Schema] Error seeding initial programmes:', err.message);
    }
}

module.exports = { initializeSchema };
