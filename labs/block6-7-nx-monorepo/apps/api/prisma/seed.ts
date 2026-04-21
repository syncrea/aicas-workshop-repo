/**
 * Seed script for the workshop SQLite database.
 *
 * Idempotent: drops all rows and re-creates the same demo dataset every time
 * it runs, so participants can `npm run db:reset` and immediately get back to
 * a known-good state.
 *
 * Run via `npm run db:seed` (defined in the workspace root package.json).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Wipe in dependency order. Cascades on Project would handle most of this,
  // but being explicit keeps the script readable and survives schema tweaks.
  await prisma.attachment.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.task.deleteMany();
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------

  const ada = await prisma.user.create({
    data: {
      id: 'usr_ada',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
    },
  });

  const grace = await prisma.user.create({
    data: {
      id: 'usr_grace',
      email: 'grace@example.com',
      name: 'Grace Hopper',
    },
  });

  const linus = await prisma.user.create({
    data: {
      id: 'usr_linus',
      email: 'linus@example.com',
      name: 'Linus Torvalds',
    },
  });

  const margaret = await prisma.user.create({
    data: {
      id: 'usr_margaret',
      email: 'margaret@example.com',
      name: 'Margaret Hamilton',
    },
  });

  // ---------------------------------------------------------------------
  // Projects + their memberships, tasks, invites, attachments
  // ---------------------------------------------------------------------

  const apollo = await prisma.project.create({
    data: {
      id: 'prj_apollo',
      name: 'Apollo Guidance',
      description:
        'Onboard guidance system for the lunar module. Critical-path software.',
      color: '#0ea5e9', // sky-500
      ownerId: margaret.id,
      members: {
        create: [
          { userId: margaret.id, role: 'owner' },
          { userId: ada.id, role: 'admin' },
          { userId: grace.id, role: 'member' },
        ],
      },
      tasks: {
        create: [
          {
            id: 'tsk_apollo_1',
            title: 'Spec the priority-display interrupts',
            description:
              'Document the BAILOUT routine and the DSKY priority signalling.',
            status: 'in_progress',
            assigneeId: margaret.id,
            creatorId: margaret.id,
            dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
          },
          {
            id: 'tsk_apollo_2',
            title: 'Verify P63 lunar-descent monitor',
            status: 'todo',
            assigneeId: ada.id,
            creatorId: margaret.id,
          },
          {
            id: 'tsk_apollo_3',
            title: 'Archive the AGC source rope',
            status: 'done',
            assigneeId: grace.id,
            creatorId: margaret.id,
          },
        ],
      },
      invites: {
        create: [
          {
            email: 'buzz@example.com',
            role: 'viewer',
            status: 'pending',
            invitedById: margaret.id,
          },
        ],
      },
      attachments: {
        create: [
          {
            fileName: 'AGC-block-II-architecture.pdf',
            contentType: 'application/pdf',
            sizeBytes: 482_133,
            storageKey: 's3://workshop-fake/apollo/architecture.pdf',
            uploadedById: margaret.id,
          },
        ],
      },
    },
  });

  const compiler = await prisma.project.create({
    data: {
      id: 'prj_compiler',
      name: 'A-0 Compiler',
      description:
        'First-of-its-kind compiler that translated mathematical notation to machine code.',
      color: '#8b5cf6', // violet-500
      ownerId: grace.id,
      members: {
        create: [
          { userId: grace.id, role: 'owner' },
          { userId: linus.id, role: 'member' },
        ],
      },
      tasks: {
        create: [
          {
            id: 'tsk_compiler_1',
            title: 'Draft the symbolic-instruction lookup table',
            status: 'todo',
            assigneeId: grace.id,
            creatorId: grace.id,
          },
          {
            id: 'tsk_compiler_2',
            title: 'Pitch reusable subroutines to UNIVAC ops',
            description:
              'Convince the room that programmers should not re-derive sine every time.',
            status: 'in_progress',
            assigneeId: linus.id,
            creatorId: grace.id,
          },
        ],
      },
    },
  });

  const linux = await prisma.project.create({
    data: {
      id: 'prj_linux',
      name: 'Linux Kernel',
      description: 'A free Unix-like kernel. Just for fun.',
      color: '#10b981', // emerald-500
      ownerId: linus.id,
      members: {
        create: [
          { userId: linus.id, role: 'owner' },
          { userId: ada.id, role: 'member' },
        ],
      },
      tasks: {
        create: [
          {
            id: 'tsk_linux_1',
            title: 'Triage scheduler regression #4711',
            status: 'in_progress',
            assigneeId: linus.id,
            creatorId: linus.id,
          },
          {
            id: 'tsk_linux_2',
            title: 'Review patch series from new contributor',
            status: 'todo',
            assigneeId: ada.id,
            creatorId: linus.id,
          },
          {
            id: 'tsk_linux_3',
            title: 'Cut release candidate',
            status: 'todo',
            creatorId: linus.id,
          },
          {
            id: 'tsk_linux_4',
            title: 'Update CREDITS file',
            status: 'done',
            assigneeId: linus.id,
            creatorId: linus.id,
          },
        ],
      },
    },
  });

  console.log('Seed complete.');
  console.log(`  Users:       4 (ada, grace, linus, margaret)`);
  console.log(`  Projects:    3 (${apollo.name}, ${compiler.name}, ${linux.name})`);
  console.log(`  Tasks:       9`);
  console.log(`  Memberships: 7`);
  console.log(`  Invites:     1 (pending)`);
  console.log(`  Attachments: 1`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
