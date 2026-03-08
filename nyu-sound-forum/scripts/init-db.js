// Database Initialization Script
// Creates tables and inserts sample data

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/sound-forum.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

// Delete existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Deleted existing database');
}

// Create new database
const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
  console.log('Created new database');
  
  try {
    await initializeDatabase();
    console.log('Database initialized successfully!');
    console.log('\nTest accounts:');
    console.log('   Admin: admin@nyu.edu / admin123');
    console.log('   Sound Student: sound@nyu.edu / sound123');
    console.log('   Director: director@nyu.edu / director123');
    console.log('   Producer: producer@nyu.edu / producer123');
    console.log('\nRun "npm start" to start the server');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
});

async function initializeDatabase() {
  // Read and execute schema
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await runQuery(schema);
  console.log('Created tables');
  
  // Insert sample users
  const users = [
    {
      email: 'admin@nyu.edu',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'admin',
      bio: 'Platform administrator',
      year: null,
      specializations: null,
      primary_position: null
    },
    {
      email: 'sound@nyu.edu',
      password: await bcrypt.hash('sound123', 10),
      name: 'Alex Chen',
      role: 'sound_student',
      bio: 'Sound design enthusiast specializing in post-production',
      year: 2025,
      specializations: JSON.stringify(['Dialogue Editor', 'Mixing Engineer']),
      primary_position: 'Sound Designer'
    },
    {
      email: 'director@nyu.edu',
      password: await bcrypt.hash('director123', 10),
      name: 'Jordan Martinez',
      role: 'director',
      bio: 'Narrative filmmaker focusing on character-driven stories',
      year: 2025,
      specializations: null,
      primary_position: null
    },
    {
      email: 'producer@nyu.edu',
      password: await bcrypt.hash('producer123', 10),
      name: 'Sam Taylor',
      role: 'producer',
      bio: 'Documentary producer with experience in field recording',
      year: 2024,
      specializations: null,
      primary_position: null
    },
    {
      email: 'maria.rodriguez@nyu.edu',
      password: await bcrypt.hash('sound123', 10),
      name: 'Maria Rodriguez',
      role: 'sound_student',
      bio: 'Production sound mixer with 3 years of experience on student films',
      year: 2024,
      specializations: JSON.stringify(['Boom Operator']),
      primary_position: 'Sound Mixer'
    },
    {
      email: 'james.kim@nyu.edu',
      password: await bcrypt.hash('sound123', 10),
      name: 'James Kim',
      role: 'sound_student',
      bio: 'Boom operator specializing in documentary and narrative work',
      year: 2026,
      specializations: JSON.stringify(['Sound Mixer']),
      primary_position: 'Boom Operator'
    },
    {
      email: 'sarah.johnson@nyu.edu',
      password: await bcrypt.hash('sound123', 10),
      name: 'Sarah Johnson',
      role: 'sound_student',
      bio: 'Dialogue editor passionate about clean, natural-sounding ADR',
      year: 2025,
      specializations: JSON.stringify(['ADR Engineer', 'Sound Designer']),
      primary_position: 'Dialogue Editor'
    },
    {
      email: 'marcus.williams@nyu.edu',
      password: await bcrypt.hash('sound123', 10),
      name: 'Marcus Williams',
      role: 'sound_student',
      bio: 'Foley artist creating custom sound effects for narrative films',
      year: 2024,
      specializations: JSON.stringify(['Sound Designer']),
      primary_position: 'Foley Artist'
    },
    {
      email: 'emily.zhang@nyu.edu',
      password: await bcrypt.hash('sound123', 10),
      name: 'Emily Zhang',
      role: 'sound_student',
      bio: 'ADR engineer with experience in voiceover recording and cleanup',
      year: 2026,
      specializations: JSON.stringify(['Dialogue Editor']),
      primary_position: 'ADR Engineer'
    },
    {
      email: 'tyler.brown@nyu.edu',
      password: await bcrypt.hash('sound123', 10),
      name: 'Tyler Brown',
      role: 'sound_student',
      bio: 'Mixing engineer focused on immersive 5.1 and Atmos mixes',
      year: 2025,
      specializations: JSON.stringify(['Sound Designer', 'Dialogue Editor']),
      primary_position: 'Mixing Engineer'
    }
  ];
  
  for (const user of users) {
    await runQuery(
      `INSERT INTO users (email, password, name, role, bio, year, specializations, primary_position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.email, user.password, user.name, user.role, user.bio, user.year, user.specializations, user.primary_position]
    );
  }
  console.log(' Created sample users');
  
  // Insert sample requests
  const requests = [
    {
      title: 'Boom Operator Needed for Thesis Film',
      description: 'Looking for an experienced boom operator for my thesis film shoot. 3 days of shooting in Brooklyn. Sound will be captured on a Sound Devices 633 mixer.',
      posted_by: 3,
      position_needed: 'boom_operator',
      project_type: 'Thesis Film',
      shoot_date: '2026-03-15',
      tags: JSON.stringify(['thesis', 'paid'])
    },
    {
      title: 'Sound Designer for Experimental Short',
      description: 'Seeking creative sound designer for a 10-minute experimental film. Heavy on foley and atmospheric design. Great portfolio piece!',
      posted_by: 4,
      position_needed: 'sound_designer',
      project_type: 'Student Short',
      shoot_date: null,
      tags: JSON.stringify(['student_film'])
    },
    {
      title: 'Production Sound Mixer - Documentary',
      description: 'Need a production sound mixer for a documentary about street musicians in NYC. Guerrilla-style shooting over 2 weekends.',
      posted_by: 3,
      position_needed: 'sound_mixer',
      project_type: 'Documentary',
      shoot_date: '2026-02-20',
      tags: JSON.stringify(['student_film', 'urgent'])
    }
  ];
  
  for (const request of requests) {
    await runQuery(
      `INSERT INTO requests (title, description, posted_by, position_needed, project_type, shoot_date, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [request.title, request.description, request.posted_by, request.position_needed, request.project_type, request.shoot_date, request.tags]
    );
  }
  console.log(' Created sample requests');
  
  // Insert sample gigs
  const gigs = [
    {
      title: 'Need Dialogue Editor for Short Film',
      description: 'Working on final mix for my thesis short. Need someone experienced with dialogue editing and noise reduction. Will provide detailed spotting notes. Expected to take 3-4 hours.',
      posted_by: 2,
      position_needed: 'dialogue_editor',
      project_type: 'Thesis Short',
      date_needed: '2026-03-01',
      tags: JSON.stringify(['thesis', 'paid'])
    },
    {
      title: 'Sound Designer Needed - Experimental Piece',
      description: 'Creating an avant-garde audio piece for my Sound Design class. Need collaborator who\'s into weird textures and creative foley. Portfolio piece for both of us!',
      posted_by: 2,
      position_needed: 'sound_designer',
      project_type: 'Class Project',
      date_needed: null,
      tags: JSON.stringify(['student_film'])
    }
  ];
  
  for (const gig of gigs) {
    await runQuery(
      `INSERT INTO gigs (title, description, posted_by, position_needed, project_type, date_needed, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [gig.title, gig.description, gig.posted_by, gig.position_needed, gig.project_type, gig.date_needed, gig.tags]
    );
  }
  console.log(' Created sample gigs');
  
  // Insert sample forum posts
  const posts = [
    {
      title: 'Best wireless lav systems under $500?',
      content: 'I\'m looking to upgrade from my current setup. What are your recommendations for wireless lavs in the $300-500 range? Mainly for narrative work.',
      posted_by: 2,
      category: 'equipment',
      is_pinned: 1
    },
    {
      title: 'How to reduce wind noise when shooting outdoors?',
      content: 'I have a shoot coming up in a park and I\'m worried about wind noise. What are the best practices? Should I invest in a blimp or will a deadcat be enough?',
      posted_by: 3,
      category: 'production_sound'
    },
    {
      title: 'Workflow for syncing audio in post?',
      content: 'What\'s everyone\'s preferred workflow for syncing audio recorded on a separate recorder? PluralEyes? Manual sync? Looking for the most efficient method.',
      posted_by: 4,
      category: 'post_sound',
      is_resolved: 1
    }
  ];
  
  for (const post of posts) {
    await runQuery(
      `INSERT INTO forum_posts (title, content, posted_by, category, is_pinned, is_resolved) VALUES (?, ?, ?, ?, ?, ?)`,
      [post.title, post.content, post.posted_by, post.category, post.is_pinned || 0, post.is_resolved || 0]
    );
  }
  console.log(' Created sample forum posts');
  
  // Insert sample replies
  const replies = [
    {
      post_id: 1,
      parent_reply_id: null,
      content: 'I highly recommend the Rode Wireless GO II. Great range, easy to use, and the price is right at $300 for a dual system.',
      posted_by: 2
    },
    {
      post_id: 2,
      parent_reply_id: null,
      content: 'A good deadcat will handle most situations, but if you\'re dealing with heavy wind, a blimp is worth the investment. Rycote makes excellent ones.',
      posted_by: 2
    }
  ];
  
  for (const reply of replies) {
    await runQuery(
      `INSERT INTO forum_replies (post_id, parent_reply_id, content, posted_by) VALUES (?, ?, ?, ?)`,
      [reply.post_id, reply.parent_reply_id, reply.content, reply.posted_by]
    );
  }
  console.log(' Created sample replies');
  
  // Insert sample wiki pages
  const wikiPages = [
    {
      title: 'Getting Started with Production Sound',
      slug: 'getting-started-production-sound',
      content: `# Getting Started with Production Sound

Production sound is the foundation of quality audio in film and video. This guide covers the essentials for beginners.

## Essential Equipment

- **Shotgun Microphone**: Your primary tool for capturing dialogue
- **Boom Pole**: For positioning the mic close to actors
- **Headphones**: Closed-back, professional monitoring headphones
- **Recorder**: A reliable field recorder (Sound Devices, Zoom, Tascam)
- **Wireless Lavs**: For situations where booming isn't practical

## Basic Techniques

1. **Get close to the source** - The closer your mic, the better your signal-to-noise ratio
2. **Monitor constantly** - Always wear headphones and listen actively
3. **Avoid overhead** - Keep the boom above actors, pointed down at 45 degrees
4. **Watch for shadows** - Be aware of lighting and avoid casting mic shadows
5. **Record room tone** - Always capture 30-60 seconds of ambient sound

## Common Mistakes to Avoid

- Not checking levels before each take
- Forgetting to hit record
- Poor cable management causing noise
- Not communicating with the director about sound concerns
`,
      category: 'production',
      created_by: 1,
      last_edited_by: 1
    }
  ];
  
  for (const page of wikiPages) {
    await runQuery(
      `INSERT INTO wiki_pages (title, slug, content, category, created_by, last_edited_by) VALUES (?, ?, ?, ?, ?, ?)`,
      [page.title, page.slug, page.content, page.category, page.created_by, page.last_edited_by]
    );
  }
  console.log(' Created sample wiki pages');
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (params.length > 0) {
      db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }
  });
}
