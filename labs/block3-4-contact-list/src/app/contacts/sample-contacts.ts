import { Contact } from './contact.model';

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Sample contacts used to populate the local store on first load so a
 * brand-new browser session has something to look at. The seed only
 * runs when localStorage has no entry under the contacts key — once
 * the user has saved any contacts (or explicitly cleared the list),
 * the seed never runs again.
 *
 * IDs are stable so deep-links to /contacts/:id work the same across
 * sessions before the user has done anything.
 */
export function buildSampleContacts(): readonly Contact[] {
  return [
    {
      id: 'seed-ada-lovelace',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada.lovelace@analytical-engine.example.com',
      phone: '+44 20 7946 0001',
      company: 'Analytical Engine Ltd',
      notes: 'Wrote the first algorithm intended for a machine.',
      createdAt: daysAgo(120),
      updatedAt: daysAgo(7),
    },
    {
      id: 'seed-grace-hopper',
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@cobol.example.com',
      phone: '+1 202 555 0142',
      company: 'US Navy',
      notes: 'COBOL co-creator. Coined the term "debugging".',
      createdAt: daysAgo(95),
      updatedAt: daysAgo(95),
    },
    {
      id: 'seed-alan-turing',
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@bletchley.example.com',
      phone: null,
      company: 'Bletchley Park',
      notes: null,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(60),
    },
    {
      id: 'seed-katherine-johnson',
      firstName: 'Katherine',
      lastName: 'Johnson',
      email: 'katherine.johnson@nasa.example.com',
      phone: '+1 757 555 0117',
      company: 'NASA Langley',
      notes: 'Trajectory analyst for Mercury, Apollo, and Shuttle programs.',
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: 'seed-margaret-hamilton',
      firstName: 'Margaret',
      lastName: 'Hamilton',
      email: 'mhamilton@apollo.example.com',
      phone: null,
      company: 'MIT Instrumentation Lab',
      notes: 'Led the Apollo onboard flight software team.',
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
    {
      id: 'seed-edsger-dijkstra',
      firstName: 'Edsger',
      lastName: 'Dijkstra',
      email: 'ewd@guarded-commands.example.com',
      phone: null,
      company: 'University of Texas',
      notes: 'Strong opinions on goto. Shortest-path enthusiast.',
      createdAt: daysAgo(20),
      updatedAt: daysAgo(20),
    },
    {
      id: 'seed-barbara-liskov',
      firstName: 'Barbara',
      lastName: 'Liskov',
      email: 'liskov@mit.example.com',
      phone: '+1 617 555 0184',
      company: 'MIT CSAIL',
      notes: 'Substitution principle. CLU language.',
      createdAt: daysAgo(14),
      updatedAt: daysAgo(14),
    },
    {
      id: 'seed-tim-berners-lee',
      firstName: 'Tim',
      lastName: 'Berners-Lee',
      email: 'timbl@w3.example.org',
      phone: null,
      company: 'W3C',
      notes: 'Invented the World Wide Web at CERN, 1989.',
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
    },
    {
      id: 'seed-radia-perlman',
      firstName: 'Radia',
      lastName: 'Perlman',
      email: 'radia@spanning-tree.example.com',
      phone: '+1 415 555 0163',
      company: 'Dell EMC',
      notes: 'Mother of the Internet. Spanning Tree Protocol.',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: 'seed-donald-knuth',
      firstName: 'Donald',
      lastName: 'Knuth',
      email: 'knuth@taocp.example.com',
      phone: null,
      company: 'Stanford University',
      notes: 'TeX, MIX, and most of TAOCP. Pays $2.56 for found bugs.',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ];
}
